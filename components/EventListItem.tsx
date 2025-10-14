import Feather from '@expo/vector-icons/Feather';
import dayjs from 'dayjs';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';

import AnimatedPressable from './AnimatedPressable';
import SupaImage from './SupaImage';

import { supabase } from '~/utils/supabase';

export default function EventListItem({ event, index = 0 }) {
  const [numberOfAttendees, setNumberOfAttendees] = useState(0);

  useEffect(() => {
    fetchNumberOfAttendees();
  }, [event.id]);

  const fetchNumberOfAttendees = async () => {
    const { count } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id);

    setNumberOfAttendees(count);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: 400,
        delay: index * 100,
      }}>
      <Link href={`/event/${event.id}`} asChild>
        <AnimatedPressable className="mx-4 mb-4">
          <View className="overflow-hidden rounded-3xl bg-white" style={styles.card}>
            {/* Image with gradient overlay */}
            <View className="relative h-48 overflow-hidden">
              {event.image_uri ? (
                <SupaImage path={event.image_uri} className="h-full w-full" />
              ) : (
                <View className="h-full w-full bg-gradient-to-br from-brand-100 to-brand-200" />
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.gradientOverlay}
                className="absolute bottom-0 left-0 right-0 h-32"
              />

              {/* Date badge */}
              <View className="absolute left-4 top-4 overflow-hidden rounded-2xl">
                <View className="bg-white/90 px-4 py-2">
                  <Text className="text-xs font-bold uppercase tracking-wide text-brand-600">
                    {dayjs(event.date).format('MMM')}
                  </Text>
                  <Text className="text-xl font-bold text-dark-800">
                    {dayjs(event.date).format('DD')}
                  </Text>
                </View>
              </View>

              {/* Time in bottom corner */}
              <View className="absolute bottom-3 right-3">
                <View className="rounded-full bg-white/90 px-3 py-1.5">
                  <Text className="text-xs font-semibold text-dark-700">
                    {dayjs(event.date).format('h:mm A')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Content */}
            <View className="gap-3 p-4">
              <Text className="text-xl font-bold text-dark-900" numberOfLines={2}>
                {event.title}
              </Text>

              <View className="flex-row items-center gap-2">
                <Feather name="map-pin" size={16} color="#64748b" />
                <Text className="flex-1 text-sm text-dark-600" numberOfLines={1}>
                  {event.location}
                </Text>
              </View>

              {/* Footer */}
              <View className="flex-row items-center justify-between border-t border-dark-100 pt-3">
                <View className="flex-row items-center gap-2">
                  <Feather name="users" size={16} color="#14b8a1" />
                  <Text className="text-sm font-semibold text-dark-700">
                    {numberOfAttendees} going
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <Feather name="navigation" size={14} color="#64748b" />
                  <Text className="text-sm text-dark-600">
                    {Math.round(event.dist_meters / 1000)} km
                  </Text>
                </View>

                <View className="flex-row gap-3">
                  <Feather name="share" size={18} color="#64748b" />
                  <Feather name="bookmark" size={18} color="#64748b" />
                </View>
              </View>
            </View>
          </View>
        </AnimatedPressable>
      </Link>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientOverlay: {
    position: 'absolute',
  },
});
