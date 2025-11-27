import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { FlatList, ActivityIndicator, Text, View, RefreshControl, StyleSheet } from 'react-native';

import EventListItem from '~/components/EventListItem';
import { useAttendeeCounts } from '~/hooks/useAttendeeCounts';
import { useMyPastEvents } from '~/hooks/useMyPastEvents';

export default function History() {
  const { data: events, isLoading, isError, error, refetch, isRefetching } = useMyPastEvents();

  // Fetch attendee counts for all visible events in a single query
  const eventIds = events?.map((event) => event.id) || [];
  const { data: attendeeCounts } = useAttendeeCounts(eventIds);

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <ActivityIndicator size="large" color="#1DDD96" />
          <Text className="mt-2 text-gray-600">Carregando seu histórico de eventos...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <Text className="text-center text-red-600">
            {error?.message || 'Falha ao carregar histórico de eventos'}
          </Text>
          <Text className="mt-2 text-center text-gray-600">
            Arraste para baixo para tentar novamente
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center px-6 py-8">
        <Text className="mb-2 text-center text-xl font-semibold text-gray-700">
          Nenhum Evento Passado
        </Text>
        <Text className="text-center text-gray-600">
          Eventos que você participou aparecerão aqui após o término
        </Text>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Histórico de Eventos', headerShown: false }} />

      <LinearGradient
        colors={['#e6faf3', '#b3f0d9', '#f8fafc']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <FlatList
          data={events || []}
          renderItem={({ item, index }) => (
            <EventListItem
              event={item}
              index={index}
              attendeeCount={attendeeCounts?.[item.id] || 0}
            />
          )}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={['#1DDD96']}
              tintColor="#1DDD96"
            />
          }
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={
            events?.length === 0
              ? { flex: 1 }
              : { paddingBottom: 100, paddingHorizontal: 16, paddingTop: 8 }
          }
        />
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
