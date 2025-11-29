import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { MotiView } from 'moti';
import { useState } from 'react';
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
} from 'react-native';
import DatePicker from 'react-native-date-picker';

import AddressAutocomplete from '~/components/AddressAutocomplete';
import AnimatedPressable from '~/components/AnimatedPressable';
import Avatar from '~/components/Avatar';
import GradientButton from '~/components/GradientButton';
import { useAuth } from '~/contexts/AuthProvider';
import { queryClient } from '~/contexts/QueryProvider';
import { supabase } from '~/utils/supabase';

export default function CreateEvent() {
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

  const { user } = useAuth();

  const createEvent = async () => {
    if (!title || !description || !location) {
      Alert.alert('Informação Faltando', 'Por favor, preencha todos os campos');
      return;
    }

    // Validate capacity if not unlimited
    if (!isUnlimited && (!maxCapacity || parseInt(maxCapacity) <= 0)) {
      Alert.alert('Capacidade Inválida', 'Por favor, insira um número válido de participantes');
      return;
    }

    setLoading(true);

    const long = location.features[0].geometry.coordinates[0];
    const lat = location.features[0].geometry.coordinates[1];

    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          title,
          description,
          date: date.toISOString(),
          user_id: user.id,
          image_uri: imageUrl,
          location: location.features[0].properties.name,
          location_point: `POINT(${long} ${lat})`,
          max_capacity: isUnlimited ? null : parseInt(maxCapacity),
          women_only: womenOnly,
        },
      ])
      .select()
      .single();

    if (error) {
      Alert.alert('Falha ao criar o evento', error.message);
    } else {
      // Invalidate events query to refresh map and feed
      queryClient.invalidateQueries({ queryKey: ['events'] });

      setTitle('');
      setDescription('');
      setDate(new Date());
      setMaxCapacity('');
      setIsUnlimited(true);
      setWomenOnly(false);
      router.push(`/event/${data.id}`);
    }

    setLoading(false);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Create', headerShown: false }} />

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
              <Text className="mb-2 text-3xl font-bold text-dark-900">Criar Evento</Text>
              <Text className="text-base text-dark-600">Compartilhe sua aventura ao ar livre</Text>
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
                  <AddressAutocomplete onSelected={(location) => setLocation(location)} />
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

            {/* Create Button */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', delay: 400 }}>
              <GradientButton
                title={loading ? 'Criando...' : 'Criar Evento'}
                onPress={createEvent}
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
