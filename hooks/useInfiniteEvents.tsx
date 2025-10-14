import { useInfiniteQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import { NearbyEvent } from '~/types/db';
import { supabase } from '~/utils/supabase';

const EVENTS_PER_PAGE = 20;

interface EventsPage {
  events: NearbyEvent[];
  nextCursor: number | null;
}

interface UseInfiniteEventsFilters {
  search?: string;
  dateFrom?: Date | null;
  dateTo?: Date | null;
}

interface UseInfiniteEventsResult {
  data: NearbyEvent[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  refetch: () => void;
  isRefetching: boolean;
}

export const useInfiniteEvents = (
  filters: UseInfiniteEventsFilters = {}
): UseInfiniteEventsResult => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [status, requestPermission] = Location.useForegroundPermissions();

  // Request location permission
  useEffect(() => {
    if (status && !status.granted && status.canAskAgain) {
      requestPermission();
    }
  }, [status]);

  // Get current location
  useEffect(() => {
    (async () => {
      if (!status?.granted) {
        setLocationError('Location permission not granted');
        return;
      }

      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);
        setLocationError(null);
      } catch (error) {
        setLocationError('Failed to get location');
        console.error('Location error:', error);
      }
    })();
  }, [status]);

  const fetchEvents = async ({ pageParam = 0 }): Promise<EventsPage> => {
    if (!location) {
      throw new Error('Location not available');
    }

    // Prepare filter parameters
    const searchQuery = filters.search?.trim() || null;
    const dateFrom = filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : null;
    const dateTo = filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : null;

    const { data, error } = await supabase.rpc('nearby_events_with_filters', {
      lat: location.coords.latitude,
      long: location.coords.longitude,
      page_limit: EVENTS_PER_PAGE,
      page_offset: pageParam,
      search_query: searchQuery,
      date_from: dateFrom,
      date_to: dateTo,
    });

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    const events = data || [];
    const hasMore = events.length === EVENTS_PER_PAGE;

    return {
      events,
      nextCursor: hasMore ? pageParam + EVENTS_PER_PAGE : null,
    };
  };

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
    queryKey: [
      'events',
      location?.coords.latitude,
      location?.coords.longitude,
      filters.search,
      filters.dateFrom?.toISOString(),
      filters.dateTo?.toISOString(),
    ],
    queryFn: fetchEvents,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!location && !locationError,
    staleTime: 1000 * 60 * 2, // Reduced to 2 minutes for search results
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Flatten the paginated data into a single array
  const flattenedEvents = data?.pages.flatMap((page) => page.events) ?? [];

  return {
    data: flattenedEvents,
    isLoading: isLoading || (!location && !locationError),
    isError: isError || !!locationError,
    error: error || (locationError ? new Error(locationError) : null),
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  };
};
