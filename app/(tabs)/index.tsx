import Mapbox, { Camera, LocationPuck, MapView, ShapeSource, CircleLayer } from '@rnmapbox/maps';
import { featureCollection, point } from '@turf/helpers';
import { BlurView } from 'expo-blur';
import { Stack, router } from 'expo-router';
import { View, ActivityIndicator, Text, Platform, StyleSheet } from 'react-native';

import { useInfiniteEvents } from '~/hooks/useInfiniteEvents';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN);

export default function EventsMapView() {
  const { data: events, isLoading, isError, error } = useInfiniteEvents();

  const points = events
    .filter((event) => event.event_long && event.event_lat)
    .map((event) => point([event.event_long, event.event_lat], { event }));

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
        <Stack.Screen options={{ title: 'Map', headerShown: false }} />
        <ActivityIndicator size="large" color="#1DDD96" />
        <Text className="mt-4 text-base font-medium text-dark-700">Carregando mapa...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
        <Stack.Screen options={{ title: 'Map', headerShown: false }} />
        <View className="mx-4 rounded-3xl bg-white/90 p-6">
          <Text className="text-center text-lg font-semibold text-red-600">
            {error?.message || 'Falha ao carregar eventos'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Stack.Screen options={{ title: 'Map', headerShown: false }} />
      <MapView style={{ height: '100%' }}>
        <Camera followZoomLevel={14} followUserLocation />
        <LocationPuck
          puckBearingEnabled
          puckBearing="heading"
          pulsing={{ isEnabled: true, color: '#1DDD96', radius: 80 }}
        />

        <ShapeSource
          id="events"
          shape={featureCollection(points)}
          onPress={(feature) => {
            const eventData = feature.features[0]?.properties?.event;
            if (eventData?.id) {
              router.push(`/event/${eventData.id}`);
            }
          }}>
          <CircleLayer
            id="events"
            style={{
              circlePitchAlignment: 'map',
              circleColor: '#1DDD96',
              circleRadius: 12,
              circleOpacity: 0.95,
              circleStrokeWidth: 3,
              circleStrokeColor: '#ffffff',
            }}
          />
        </ShapeSource>
      </MapView>

      {/* Glass overlay with event count */}
      <View style={styles.statsContainer}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={60} tint="light" style={styles.glassCard}>
            <View className="p-4">
              <Text className="text-2xl font-bold text-dark-900">{events.length}</Text>
              <Text className="text-sm font-medium text-dark-600">Eventos Próximos</Text>
            </View>
          </BlurView>
        ) : (
          <View
            className="rounded-3xl border border-white/30 bg-white/90 p-4"
            style={styles.glassCard}>
            <Text className="text-2xl font-bold text-dark-900">{events.length}</Text>
            <Text className="text-sm font-medium text-dark-600">Eventos Próximos</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
});
