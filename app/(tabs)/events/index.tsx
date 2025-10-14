import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, ActivityIndicator, Text, View, RefreshControl, StyleSheet } from 'react-native';

import DateRangeFilter from '~/components/DateRangeFilter';
import EventListItem from '~/components/EventListItem';
import SearchInput from '~/components/SearchInput';
import { useInfiniteEvents } from '~/hooks/useInfiniteEvents';

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const {
    data: events,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteEvents({
    search: searchQuery,
    dateFrom,
    dateTo,
  });

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View className="pb-24 pt-4">
        <ActivityIndicator size="small" color="#14b8a1" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" color="#14b8a1" />
          <Text className="mt-4 text-base font-medium text-dark-600">Loading events...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View className="mx-4 mt-8 rounded-3xl bg-white/80 p-6">
          <Text className="text-center text-lg font-semibold text-red-600">
            {error?.message || 'Failed to load events'}
          </Text>
          <Text className="mt-2 text-center text-dark-600">Pull down to retry</Text>
        </View>
      );
    }

    const hasActiveFilters = searchQuery || dateFrom || dateTo;

    return (
      <View className="mx-4 mt-8 rounded-3xl bg-white/80 p-8">
        <Text className="text-center text-xl font-semibold text-dark-800">
          {hasActiveFilters ? 'No events found' : 'No events nearby'}
        </Text>
        <Text className="mt-2 text-center text-dark-600">
          {hasActiveFilters
            ? 'Try adjusting your search or date filters'
            : 'Check back later for new events'}
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View className="pt-4">
      <SearchInput
        value={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search events..."
      />
      <DateRangeFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Events', headerShown: false }} />

      <LinearGradient
        colors={['#f0fdf9', '#e0f2fe', '#f8fafc']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <FlatList
          data={events}
          renderItem={({ item, index }) => <EventListItem event={item} index={index} />}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={['#14b8a1']}
              tintColor="#14b8a1"
            />
          }
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
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
