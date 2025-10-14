import { Stack } from 'expo-router';
import { FlatList, ActivityIndicator, Text, View, RefreshControl } from 'react-native';

import EventListItem from '~/components/EventListItem';
import { useMyPastEvents } from '~/hooks/useMyPastEvents';

export default function History() {
  const { data: events, isLoading, isError, error, refetch, isRefetching } = useMyPastEvents();

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <ActivityIndicator size="large" color="#0066cc" />
          <Text className="mt-2 text-gray-600">Loading your event history...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <Text className="text-center text-red-600">
            {error?.message || 'Failed to load event history'}
          </Text>
          <Text className="mt-2 text-center text-gray-600">Pull down to retry</Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-8 px-6">
        <Text className="text-center text-xl font-semibold text-gray-700 mb-2">
          No Past Events
        </Text>
        <Text className="text-center text-gray-600">
          Events you've attended will appear here after they've ended
        </Text>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Event History' }} />

      <FlatList
        data={events || []}
        renderItem={({ item }) => <EventListItem event={item} />}
        className="bg-white"
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#0066cc']}
            tintColor="#0066cc"
          />
        }
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={events?.length === 0 ? { flex: 1 } : undefined}
      />
    </>
  );
}
