import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { MotiView } from 'moti';
import { useState } from 'react';
import { Text, View, TextInput, Alert, ScrollView, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';

import AddressAutocomplete from '~/components/AddressAutocomplete';
import AnimatedPressable from '~/components/AnimatedPressable';
import Avatar from '~/components/Avatar';
import GradientButton from '~/components/GradientButton';
import { useAuth } from '~/contexts/AuthProvider';
import { supabase } from '~/utils/supabase';

export default function CreateEvent() {
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState(null);

  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const createEvent = async () => {
    if (!title || !description || !location) {
      Alert.alert('Missing Information', 'Please fill in all fields');
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
        },
      ])
      .select()
      .single();

    if (error) {
      Alert.alert('Failed to create the event', error.message);
    } else {
      setTitle('');
      setDescription('');
      setDate(new Date());
      router.push(`/event/${data.id}`);
    }

    setLoading(false);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Create Event', headerShown: false }} />

      <LinearGradient
        colors={['#f0fdf9', '#e0f2fe', '#f8fafc']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 100 }}
            className="mb-8">
            <Text className="mb-2 text-3xl font-bold text-dark-900">Create Event</Text>
            <Text className="text-base text-dark-600">Share your outdoor adventure</Text>
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
                <Text className="mb-2 text-sm font-semibold text-dark-700">Event Title</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Give your event a name"
                  placeholderTextColor="#94a3b8"
                  className="rounded-2xl border border-dark-200 bg-dark-50 p-4 text-base text-dark-900"
                />
              </View>

              {/* Description Input */}
              <View>
                <Text className="mb-2 text-sm font-semibold text-dark-700">Description</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Tell people what to expect..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="min-h-32 rounded-2xl border border-dark-200 bg-dark-50 p-4 text-base text-dark-900"
                />
              </View>

              {/* Date/Time Picker */}
              <View>
                <Text className="mb-2 text-sm font-semibold text-dark-700">Date & Time</Text>
                <AnimatedPressable onPress={() => setOpen(true)}>
                  <View className="flex-row items-center gap-3 rounded-2xl border border-dark-200 bg-dark-50 p-4">
                    <Feather name="calendar" size={20} color="#14b8a1" />
                    <Text className="flex-1 text-base font-medium text-dark-900">
                      {date.toLocaleString()}
                    </Text>
                    <Feather name="chevron-right" size={20} color="#64748b" />
                  </View>
                </AnimatedPressable>
              </View>

              {/* Location */}
              <View>
                <Text className="mb-2 text-sm font-semibold text-dark-700">Location</Text>
                <AddressAutocomplete onSelected={(location) => setLocation(location)} />
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
              title={loading ? 'Creating...' : 'Create Event'}
              onPress={createEvent}
              disabled={loading}
              variant="teal"
              size="lg"
              className="w-full"
            />
          </MotiView>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
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
