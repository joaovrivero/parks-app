import Feather from '@expo/vector-icons/Feather';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, Stack, Link } from 'expo-router';
import { MotiView } from 'moti';
import { Text, View, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';

import CommentSection from '~/components/CommentSection';
import GradientButton from '~/components/GradientButton';
import SupaImage from '~/components/SupaImage';
import { useAuth } from '~/contexts/AuthProvider';
import { Attendance, Event } from '~/types/db';
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

  const joinEventMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .insert({ user_id: user.id, event_id: event!.id })
        .select()
        .single();

      if (error) throw new Error(`Failed to join event: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      // Invalidate attendance query to refetch
      queryClient.invalidateQueries({ queryKey: ['attendance', eventId, user.id] });
    },
  });

  const isLoading = eventLoading || attendanceLoading;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
        <ActivityIndicator size="large" color="#14b8a1" />
        <Text className="mt-4 text-base font-medium text-dark-700">Loading event...</Text>
      </View>
    );
  }

  if (eventError || !event) {
    return (
      <View className="flex-1 items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
        <View className="mx-4 rounded-3xl bg-white/90 p-6">
          <Text className="text-center text-lg font-semibold text-red-600">Event not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark-50">
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          headerBackTitleVisible: false,
          headerTintColor: '#ffffff',
        }}
      />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
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

          {/* Title on Hero */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 300 }}
            style={styles.titleContainer}>
            <Text className="text-4xl font-bold text-white drop-shadow-lg">{event.title}</Text>
          </MotiView>
        </View>

        {/* Info Cards */}
        <View className="px-4" style={{ marginTop: -40 }}>
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
                  <Feather name="clock" size={24} color="#14b8a1" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-dark-500">Time</Text>
                  <Text className="text-lg font-bold text-dark-900">
                    {dayjs(event.date).format('h:mm A')}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
                  <Feather name="map-pin" size={24} color="#14b8a1" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-dark-500">Location</Text>
                  <Text className="text-lg font-bold text-dark-900">{event.location}</Text>
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
              <Text className="mb-3 text-xl font-bold text-dark-900">About</Text>
              <Text className="text-base leading-6 text-dark-700">{event.description}</Text>

              <Link
                href={`/event/${event.id}/attendance`}
                className="mt-4 text-base font-semibold text-brand-600">
                <View className="flex-row items-center gap-2">
                  <Feather name="users" size={18} color="#14b8a1" />
                  <Text className="text-base font-semibold text-brand-600">View attendance</Text>
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
            <Text className="text-sm font-medium text-dark-600">Price</Text>
            <Text className="text-2xl font-bold text-dark-900">Free</Text>
          </View>

          {attendance ? (
            <View className="flex-row items-center gap-2 rounded-3xl bg-green-50 px-6 py-4">
              <Feather name="check-circle" size={24} color="#10b981" />
              <Text className="text-base font-bold text-green-700">Attending</Text>
            </View>
          ) : (
            <GradientButton
              title={joinEventMutation.isPending ? 'Joining...' : 'Join Event'}
              onPress={() => joinEventMutation.mutate()}
              disabled={joinEventMutation.isPending}
              variant="teal"
              size="lg"
            />
          )}
        </View>
      </View>
    </View>
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
    top: 100,
    right: 20,
  },
  titleContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
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
