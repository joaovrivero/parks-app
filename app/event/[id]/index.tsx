import Feather from '@expo/vector-icons/Feather';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, Stack, Link, router } from 'expo-router';
import { MotiView } from 'moti';
import { useEffect } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';

import CommentSection from '~/components/CommentSection';
import GradientButton from '~/components/GradientButton';
import SupaImage from '~/components/SupaImage';
import { useAuth } from '~/contexts/AuthProvider';
import { Attendance, Event } from '~/types/db';
import {
  scheduleParticipantNotification,
  scheduleEventReminderNotification,
} from '~/utils/notifications';
import { shareEvent } from '~/utils/sharing';
import { supabase } from '~/utils/supabase';

const fetchEvent = async (eventId: string): Promise<Event> => {
  const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
  if (error) throw new Error(`Failed to fetch event: ${error.message}`);
  return data;
};

const fetchAttendance = async (eventId: string, userId: string): Promise<Attendance | null> => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .single();

  // No error if no attendance record found
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch attendance: ${error.message}`);
  }
  return data;
};

const fetchAttendeeCount = async (eventId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);

  if (error) throw new Error(`Failed to fetch attendee count: ${error.message}`);
  return count || 0;
};

export default function EventPage() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const eventId = Array.isArray(id) ? id[0] : id;

  const {
    data: event,
    isLoading: eventLoading,
    isError: eventError,
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEvent(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const {
    data: attendance,
    isLoading: attendanceLoading,
    isError: attendanceError,
  } = useQuery({
    queryKey: ['attendance', eventId, user?.id],
    queryFn: () => fetchAttendance(eventId, user.id),
    enabled: !!eventId && !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: attendeeCount = 0 } = useQuery({
    queryKey: ['attendeeCount', eventId],
    queryFn: () => fetchAttendeeCount(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const joinEventMutation = useMutation({
    mutationFn: async () => {
      // Check if event is at capacity
      if (event!.max_capacity && attendeeCount >= event!.max_capacity) {
        throw new Error('Este evento está lotado');
      }

      const { data, error } = await supabase
        .from('attendance')
        .insert({ user_id: user.id, event_id: event!.id })
        .select()
        .single();

      if (error) throw new Error(`Falha ao participar do evento: ${error.message}`);
      return data;
    },
    onSuccess: async () => {
      // Invalidate attendance and count queries to refetch
      queryClient.invalidateQueries({ queryKey: ['attendance', eventId, user.id] });
      queryClient.invalidateQueries({ queryKey: ['attendeeCount', eventId] });

      // Get participant profile for notification
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      // Schedule event reminder notifications (24h and 1h before)
      if (event) {
        await scheduleEventReminderNotification(event, 24);
        await scheduleEventReminderNotification(event, 1);
      }

      // Notify event creator that someone joined (only if it's not the creator themselves)
      if (event && event.user_id !== user.id) {
        await scheduleParticipantNotification(event.title, event.id, profile?.username || 'Alguém');
      }
    },
    onError: (error: Error) => {
      Alert.alert('Não foi possível participar', error.message);
    },
  });

  const leaveEventMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('user_id', user.id)
        .eq('event_id', event!.id);

      if (error) throw new Error(`Falha ao sair do evento: ${error.message}`);
    },
    onSuccess: () => {
      // Invalidate attendance and count queries to refetch
      queryClient.invalidateQueries({ queryKey: ['attendance', eventId, user.id] });
      queryClient.invalidateQueries({ queryKey: ['attendeeCount', eventId] });
    },
    onError: (error: Error) => {
      Alert.alert('Não foi possível sair', error.message);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('events').delete().eq('id', event!.id);

      if (error) throw new Error(`Falha ao excluir o evento: ${error.message}`);
    },
    onSuccess: () => {
      // Invalidate events query to refresh map and feed
      queryClient.invalidateQueries({ queryKey: ['events'] });
      Alert.alert('Sucesso', 'Evento excluído com sucesso', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error: Error) => {
      Alert.alert('Não foi possível excluir', error.message);
    },
  });

  // Real-time subscription for attendance changes
  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel(`attendance:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log('New attendee joined:', payload);
          // Invalidate to refetch attendance count
          queryClient.invalidateQueries({ queryKey: ['attendeeCount', eventId] });

          // If it's the current user, update their attendance status
          if (payload.new.user_id === user?.id) {
            queryClient.invalidateQueries({ queryKey: ['attendance', eventId, user.id] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'attendance',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log('Attendee left:', payload);
          queryClient.invalidateQueries({ queryKey: ['attendeeCount', eventId] });

          // If it's the current user, update their attendance status
          if (payload.old.user_id === user?.id) {
            queryClient.invalidateQueries({ queryKey: ['attendance', eventId, user.id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, queryClient, user?.id]);

  const isLoading = eventLoading || attendanceLoading;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
        <ActivityIndicator size="large" color="#1DDD96" />
        <Text className="mt-4 text-base font-medium text-dark-700">Carregando evento...</Text>
      </View>
    );
  }

  if (eventError || !event) {
    return (
      <View className="flex-1 items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
        <View className="mx-4 rounded-3xl bg-white/90 p-6">
          <Text className="text-center text-lg font-semibold text-red-600">
            Evento não encontrado
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <View className="flex-1 bg-dark-50">
        <Stack.Screen
          options={{
            title: '',
            headerTransparent: true,
            headerBackTitleVisible: false,
            headerTintColor: '#ffffff',
          }}
        />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled">
          {/* Hero Image with Gradient Overlay */}
          <View style={styles.hero}>
            {event.image_uri ? (
              <SupaImage path={event.image_uri} className="h-full w-full" />
            ) : (
              <View className="h-full w-full bg-gradient-to-br from-brand-200 to-brand-400" />
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.heroGradient}
            />

            {/* Date Badge on Hero */}
            <MotiView
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', delay: 200 }}
              style={styles.dateBadge}>
              <View className="rounded-3xl bg-white/95 px-6 py-3">
                <Text className="text-center text-xs font-bold uppercase tracking-wide text-brand-600">
                  {dayjs(event.date).format('MMMM')}
                </Text>
                <Text className="text-center text-3xl font-bold text-dark-900">
                  {dayjs(event.date).format('DD')}
                </Text>
              </View>
            </MotiView>

            {/* Women Only Badge */}
            {event.women_only && (
              <MotiView
                from={{ opacity: 0, translateX: 20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'spring', delay: 250 }}
                style={styles.womenOnlyBadge}>
                <View className="rounded-full bg-pink-500/95 px-5 py-2.5">
                  <Text className="text-center text-sm font-bold text-white">
                    Exclusivo para Mulheres
                  </Text>
                </View>
              </MotiView>
            )}

            {/* Title on Hero */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', delay: 300 }}
              style={styles.titleContainer}>
              <Text className="text-4xl font-bold text-white drop-shadow-lg">{event.title}</Text>
            </MotiView>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {event.user_id === user?.id && (
                <>
                  <Pressable
                    onPress={() => {
                      console.log('Edit button pressed', event.id);
                      router.push(`/event/${event.id}/edit` as any);
                    }}
                    style={styles.actionButton}
                    className="rounded-full bg-white/90 p-3 shadow-lg">
                    <Feather name="edit-2" size={20} color="#1DDD96" />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      console.log('Delete button pressed');
                      Alert.alert(
                        'Excluir Evento',
                        'Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.',
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Excluir',
                            style: 'destructive',
                            onPress: () => deleteEventMutation.mutate(),
                          },
                        ]
                      );
                    }}
                    style={styles.actionButton}
                    className="rounded-full bg-red-500/90 p-3 shadow-lg">
                    <Feather name="trash-2" size={20} color="#ffffff" />
                  </Pressable>
                </>
              )}
              <Pressable
                onPress={() => {
                  console.log('Share button pressed', event);
                  shareEvent(event);
                }}
                style={styles.actionButton}
                className="rounded-full bg-white/90 p-3 shadow-lg">
                <Feather name="share-2" size={20} color="#1DDD96" />
              </Pressable>
            </View>
          </View>

          {/* Info Cards */}
          <View className="px-4" style={{ marginTop: 20 }}>
            {/* Time & Location Card */}
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', delay: 400 }}
              className="mb-4 overflow-hidden rounded-3xl bg-white"
              style={styles.card}>
              <View className="p-5">
                <View className="mb-4 flex-row items-center gap-3 border-b border-dark-100 pb-4">
                  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
                    <Feather name="clock" size={24} color="#1DDD96" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-dark-500">Horário</Text>
                    <Text className="text-lg font-bold text-dark-900">
                      {dayjs(event.date).format('h:mm A')}
                    </Text>
                  </View>
                </View>

                <View className="mb-4 flex-row items-center gap-3 border-b border-dark-100 pb-4">
                  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
                    <Feather name="map-pin" size={24} color="#1DDD96" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-dark-500">Localização</Text>
                    <Text className="text-lg font-bold text-dark-900">{event.location}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
                    <Feather name="users" size={24} color="#1DDD96" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-dark-500">Participantes</Text>
                    <Text className="text-lg font-bold text-dark-900">
                      {event.max_capacity
                        ? `${attendeeCount}/${event.max_capacity} vagas`
                        : `${attendeeCount} confirmados • Ilimitado`}
                    </Text>
                  </View>
                </View>
              </View>
            </MotiView>

            {/* Description Card */}
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', delay: 500 }}
              className="mb-4 overflow-hidden rounded-3xl bg-white"
              style={styles.card}>
              <View className="p-5">
                <Text className="mb-3 text-xl font-bold text-dark-900">Sobre</Text>
                <Text className="text-base leading-6 text-dark-700">{event.description}</Text>

                <Link
                  href={`/event/${event.id}/attendance`}
                  className="mt-4 text-base font-semibold text-brand-600">
                  <View className="flex-row items-center gap-2">
                    <Feather name="users" size={18} color="#1DDD96" />
                    <Text className="text-base font-semibold text-brand-600">
                      Ver participantes
                    </Text>
                  </View>
                </Link>
              </View>
            </MotiView>

            {/* Comments Section */}
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', delay: 600 }}
              className="overflow-hidden rounded-3xl bg-white"
              style={styles.card}>
              <CommentSection eventId={event.id} />
            </MotiView>
          </View>
        </ScrollView>

        {/* Floating Footer */}
        <View style={styles.footer}>
          <View className="flex-row items-center justify-between px-6 py-4">
            <View>
              <Text className="text-sm font-medium text-dark-600">Preço</Text>
              <Text className="text-2xl font-bold text-dark-900">Grátis</Text>
            </View>

            {attendance ? (
              <Pressable
                onPress={() => {
                  Alert.alert('Sair do evento', 'Tem certeza que deseja sair deste evento?', [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Sair',
                      style: 'destructive',
                      onPress: () => leaveEventMutation.mutate(),
                    },
                  ]);
                }}
                disabled={leaveEventMutation.isPending}
                className="flex-row items-center gap-2 rounded-3xl bg-green-50 px-6 py-4 active:opacity-70">
                <Feather name="check-circle" size={24} color="#10b981" />
                <Text className="text-base font-bold text-green-700">
                  {leaveEventMutation.isPending ? 'Saindo...' : 'Participando'}
                </Text>
              </Pressable>
            ) : event.max_capacity && attendeeCount >= event.max_capacity ? (
              <View className="rounded-3xl bg-dark-200 px-6 py-4">
                <Text className="text-base font-bold text-dark-600">Evento Lotado</Text>
              </View>
            ) : (
              <GradientButton
                title={joinEventMutation.isPending ? 'Participando...' : 'Participar do Evento'}
                onPress={() => joinEventMutation.mutate()}
                disabled={joinEventMutation.isPending}
                variant="teal"
                size="lg"
              />
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 400,
    position: 'relative',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  dateBadge: {
    position: 'absolute',
    top: 120,
    right: 20,
  },
  womenOnlyBadge: {
    position: 'absolute',
    top: 120,
    left: 20,
  },
  titleContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
  },
  actionButtons: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
});
