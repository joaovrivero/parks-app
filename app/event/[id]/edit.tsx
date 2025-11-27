import Feather from '@expo/vector-icons/Feather';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import { useState, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DatePicker from 'react-native-date-picker';

import AddressAutocomplete from '~/components/AddressAutocomplete';
import AnimatedPressable from '~/components/AnimatedPressable';
import Avatar from '~/components/Avatar';
import GradientButton from '~/components/GradientButton';
import { useAuth } from '~/contexts/AuthProvider';
import { queryClient } from '~/contexts/QueryProvider';
import { Event } from '~/types/db';
import { supabase } from '~/utils/supabase';

const fetchEvent = async (eventId: string): Promise<Event> => {
  const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
  if (error) throw new Error(`Failed to fetch event: ${error.message}`);
  return data;
};

export default function EditEvent() {
  const { id } = useLocalSearchParams();
  const eventId = Array.isArray(id) ? id[0] : id;
  const { user } = useAuth();

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEvent(eventId),
    enabled: !!eventId,
  });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState(null);
  const [maxCapacity, setMaxCapacity] = useState('');
  const [isUnlimited, setIsUnlimited] = useState(true);
  const [womenOnly, setWomenOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  // Populate form when event data is loaded
  useEffect(() => {
    if (event) {
      // Check if user is the creator
      if (event.user_id !== user?.id) {
        Alert.alert('Acesso Negado', 'Você não tem permissão para editar este evento');
        router.back();
        return;
      }

      setTitle(event.title);
      setDescription(event.description);
      setDate(new Date(event.date));
      setImageUrl(event.image_uri || '');
      setMaxCapacity(event.max_capacity ? String(event.max_capacity) : '');
      setIsUnlimited(!event.max_capacity);
      setWomenOnly(event.women_only || false);

      // Note: We can't perfectly restore the location object from just the location string
      // The user will need to re-select if they want to change it
    }
  }, [event, user]);

  const updateEvent = async () => {
    if (!title || !description) {
      Alert.alert('Informação Faltando', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Validate capacity if not unlimited
    if (!isUnlimited && (!maxCapacity || parseInt(maxCapacity) <= 0)) {
      Alert.alert('Capacidade Inválida', 'Por favor, insira um número válido de participantes');
      return;
    }

    setLoading(true);

    const updates: any = {
      title,
      description,
      date: date.toISOString(),
      image_uri: imageUrl,
      max_capacity: isUnlimited ? null : parseInt(maxCapacity),
      women_only: womenOnly,
    };

    // Only update location if a new one was selected
    if (location) {
      const long = location.features[0].geometry.coordinates[0];
      const lat = location.features[0].geometry.coordinates[1];
      updates.location = location.features[0].properties.name;
      updates.location_point = `POINT(${long} ${lat})`;
    }

    const { error } = await supabase.from('events').update(updates).eq('id', eventId);

    if (error) {
      Alert.alert('Falha ao atualizar o evento', error.message);
    } else {
      // Invalidate events query to refresh data
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });

      Alert.alert('Sucesso', 'Evento atualizado com sucesso', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }

    setLoading(false);
  };

  if (eventLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
        <ActivityIndicator size="large" color="#1DDD96" />
        <Text className="mt-4 text-base font-medium text-dark-700">Carregando evento...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
        <Text className="text-lg font-semibold text-red-600">Evento não encontrado</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Editar Evento', headerBackTitleVisible: false }} />

      <LinearGradient
        colors={['#e6faf3', '#b3f0d9', '#f8fafc']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {/* Hero Section */}
            <MotiView
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', delay: 100 }}
              className="mb-8">
              <Text className="mb-2 text-3xl font-bold text-dark-900">Editar Evento</Text>
              <Text className="text-base text-dark-600">Atualize os detalhes do seu evento</Text>
            </MotiView>

            {/* Image Upload */}
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', delay: 200 }}
              className="mb-6">
              <Avatar
                size={200}
                url={imageUrl}
                onUpload={(url: string) => {
                  setImageUrl(url);
                }}
              />
            </MotiView>

            {/* Form Card */}
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', delay: 300 }}
              className="mb-6 overflow-hidden rounded-3xl bg-white"
              style={styles.card}>
              <View className="gap-5 p-5">
                {/* Title Input */}
                <View>
                  <Text className="mb-2 text-sm font-semibold text-dark-700">Título do Evento</Text>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Dê um nome ao seu evento"
                    placeholderTextColor="#94a3b8"
                    className="rounded-2xl border border-dark-200 bg-dark-50 p-4 text-base text-dark-900"
                  />
                </View>

                {/* Description Input */}
                <View>
                  <Text className="mb-2 text-sm font-semibold text-dark-700">Descrição</Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Conte às pessoas o que esperar..."
                    placeholderTextColor="#94a3b8"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    className="min-h-32 rounded-2xl border border-dark-200 bg-dark-50 p-4 text-base text-dark-900"
                  />
                </View>

                {/* Date/Time Picker */}
                <View>
                  <Text className="mb-2 text-sm font-semibold text-dark-700">Data e Hora</Text>
                  <AnimatedPressable onPress={() => setOpen(true)}>
                    <View className="flex-row items-center gap-3 rounded-2xl border border-dark-200 bg-dark-50 p-4">
                      <Feather name="calendar" size={20} color="#1DDD96" />
                      <Text className="flex-1 text-base font-medium text-dark-900">
                        {date.toLocaleString()}
                      </Text>
                      <Feather name="chevron-right" size={20} color="#64748b" />
                    </View>
                  </AnimatedPressable>
                </View>

                {/* Location */}
                <View>
                  <Text className="mb-2 text-sm font-semibold text-dark-700">Localização</Text>
                  <Text className="mb-2 text-sm text-dark-600">Atual: {event.location}</Text>
                  <AddressAutocomplete
                    onSelected={(location) => setLocation(location)}
                    placeholder="Selecione nova localização (opcional)"
                  />
                </View>

                {/* Participant Capacity */}
                <View>
                  <Text className="mb-2 text-sm font-semibold text-dark-700">
                    Máximo de Participantes
                  </Text>
                  <View className="mb-3 flex-row items-center justify-between rounded-2xl border border-dark-200 bg-dark-50 p-4">
                    <Text className="text-base text-dark-900">Ilimitado</Text>
                    <Switch
                      value={isUnlimited}
                      onValueChange={(value) => {
                        setIsUnlimited(value);
                        if (value) setMaxCapacity('');
                      }}
                      trackColor={{ false: '#cbd5e1', true: '#5eead4' }}
                      thumbColor={isUnlimited ? '#14b8a6' : '#f1f5f9'}
                    />
                  </View>
                  {!isUnlimited && (
                    <TextInput
                      value={maxCapacity}
                      onChangeText={setMaxCapacity}
                      placeholder="ex: 10"
                      placeholderTextColor="#94a3b8"
                      keyboardType="number-pad"
                      className="rounded-2xl border border-dark-200 bg-dark-50 p-4 text-base text-dark-900"
                    />
                  )}
                </View>

                {/* Women Only Option */}
                <View>
                  <View className="flex-row items-center justify-between rounded-2xl border border-dark-200 bg-dark-50 p-4">
                    <View className="flex-1 pr-4">
                      <Text className="mb-1 text-base font-semibold text-dark-900">
                        Evento Exclusivo para Mulheres
                      </Text>
                      <Text className="text-sm text-dark-600">
                        Este evento é destinado a participantes mulheres
                      </Text>
                    </View>
                    <Switch
                      value={womenOnly}
                      onValueChange={setWomenOnly}
                      trackColor={{ false: '#cbd5e1', true: '#f9a8d4' }}
                      thumbColor={womenOnly ? '#ec4899' : '#f1f5f9'}
                    />
                  </View>
                </View>
              </View>
            </MotiView>

            <DatePicker
              modal
              open={open}
              date={date}
              minimumDate={new Date()}
              minuteInterval={15}
              onConfirm={(date) => {
                setOpen(false);
                setDate(date);
              }}
              onCancel={() => {
                setOpen(false);
              }}
            />

            {/* Update Button */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', delay: 400 }}>
              <GradientButton
                title={loading ? 'Salvando...' : 'Salvar Alterações'}
                onPress={updateEvent}
                disabled={loading}
                variant="teal"
                size="lg"
                className="w-full"
              />
            </MotiView>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
});
