import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useState, useCallback } from 'react';
import { FlatList, ActivityIndicator, Text, View, RefreshControl, StyleSheet } from 'react-native';

import DateRangeFilter from '~/components/DateRangeFilter';
import EventListItem from '~/components/EventListItem';
import SearchInput from '~/components/SearchInput';
import { useAttendeeCounts } from '~/hooks/useAttendeeCounts';
import { useInfiniteEvents } from '~/hooks/useInfiniteEvents';

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  // Memoize callbacks to prevent re-renders
  const handleSearchChange = useCallback((search: string) => {
    setSearchQuery(search);
  }, []);

  const handleDateFromChange = useCallback((date: Date | null) => {
    setDateFrom(date);
  }, []);

  const handleDateToChange = useCallback((date: Date | null) => {
    setDateTo(date);
  }, []);

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

  // Fetch attendee counts for all visible events in a single query
  const eventIds = events.map((event) => event.id);
  const { data: attendeeCounts } = useAttendeeCounts(eventIds);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View className="pb-24 pt-4">
        <ActivityIndicator size="small" color="#1DDD96" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" color="#1DDD96" />
          <Text className="mt-4 text-base font-medium text-dark-600">Carregando eventos...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View className="mx-4 mt-8 rounded-3xl bg-white/80 p-6">
          <Text className="text-center text-lg font-semibold text-red-600">
            {error?.message || 'Falha ao carregar eventos'}
          </Text>
          <Text className="mt-2 text-center text-dark-600">
            Arraste para baixo para tentar novamente
          </Text>
        </View>
      );
    }

    const hasActiveFilters = searchQuery || dateFrom || dateTo;

    return (
      <View className="mx-4 mt-8 rounded-3xl bg-white/80 p-8">
        <Text className="text-center text-xl font-semibold text-dark-800">
          {hasActiveFilters ? 'Nenhum evento encontrado' : 'Nenhum evento próximo'}
        </Text>
        <Text className="mt-2 text-center text-dark-600">
          {hasActiveFilters
            ? 'Tente ajustar sua busca ou filtros de data'
            : 'Volte mais tarde para novos eventos'}
        </Text>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Eventos', headerShown: false }} />

      <LinearGradient
        colors={['#e6faf3', '#b3f0d9', '#f8fafc']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <View className="pt-4">
          <SearchInput
            value={searchQuery}
            onSearchChange={handleSearchChange}
            placeholder="Buscar eventos..."
          />
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={handleDateFromChange}
            onDateToChange={handleDateToChange}
          />
        </View>
        <FlatList
          data={events}
          renderItem={({ item, index }) => (
            <EventListItem
              event={item}
              index={index}
              attendeeCount={attendeeCounts?.[item.id] || 0}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
