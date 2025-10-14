import { useInfiniteQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { FlatList, Text, View, ActivityIndicator, RefreshControl } from 'react-native';

import { supabase } from '~/utils/supabase';

const ATTENDEES_PER_PAGE = 20;

interface AttendeesPage {
  attendees: any[];
  nextCursor: number | null;
}

const fetchAttendees = async (eventId: string, pageParam = 0): Promise<AttendeesPage> => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, profiles(*)')
    .eq('event_id', eventId)
    .range(pageParam, pageParam + ATTENDEES_PER_PAGE - 1)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch attendees: ${error.message}`);
  }

  const attendees = data || [];
  const hasMore = attendees.length === ATTENDEES_PER_PAGE;

  return {
    attendees,
    nextCursor: hasMore ? pageParam + ATTENDEES_PER_PAGE : null,
  };
};

export default function EventAttendance() {
  const { id } = useLocalSearchParams();
  const eventId = Array.isArray(id) ? id[0] : id;

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['attendees', eventId],
    queryFn: ({ pageParam = 0 }) => fetchAttendees(eventId, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const flattenedAttendees = data?.pages.flatMap((page) => page.attendees) ?? [];

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#0066cc" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <ActivityIndicator size="large" color="#0066cc" />
          <Text className="mt-2 text-gray-600">Loading attendees...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <Text className="text-center text-red-600">
            {error?.message || 'Failed to load attendees'}
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-8">
        <Text className="text-center text-gray-600">No attendees yet</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={flattenedAttendees}
      renderItem={({ item }) => (
        <View className="border-b border-gray-100 p-3">
          <Text className="font-bold">{item.profiles?.full_name || 'User'}</Text>
          <Text className="text-sm text-gray-600">{item.profiles?.username || ''}</Text>
        </View>
      )}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
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
      className="bg-white"
    />
  );
}
