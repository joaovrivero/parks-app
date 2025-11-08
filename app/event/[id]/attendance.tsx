import Feather from '@expo/vector-icons/Feather';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useEffect } from 'react';
import {
  FlatList,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';

import AvatarReadOnly from '~/components/AvatarReadOnly';
import { useAuth } from '~/contexts/AuthProvider';
import { Event } from '~/types/db';
import { supabase } from '~/utils/supabase';

const ATTENDEES_PER_PAGE = 20;

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface AttendeeItem {
  id: number;
  user_id: string;
  event_id: number;
  created_at: string;
  profiles: Profile;
}

interface AttendeesPage {
  attendees: AttendeeItem[];
  nextCursor: number | null;
}

const fetchEvent = async (eventId: string): Promise<Event> => {
  const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
  if (error) throw new Error(`Failed to fetch event: ${error.message}`);
  return data;
};

const fetchAttendees = async (eventId: string, pageParam = 0): Promise<AttendeesPage> => {
  // Fetch attendance records
  const { data: attendanceData, error: attendanceError } = await supabase
    .from('attendance')
    .select('*')
    .eq('event_id', eventId)
    .range(pageParam, pageParam + ATTENDEES_PER_PAGE - 1)
    .order('created_at', { ascending: false });

  if (attendanceError) {
    throw new Error(`Failed to fetch attendees: ${attendanceError.message}`);
  }

  if (!attendanceData || attendanceData.length === 0) {
    return {
      attendees: [],
      nextCursor: null,
    };
  }

  // Fetch profiles for all user_ids
  const userIds = attendanceData.map((a) => a.user_id);
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);

  if (profilesError) {
    throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
  }

  // Map profiles by id for quick lookup
  const profilesMap = new Map<string, Profile>();
  (profilesData || []).forEach((profile) => {
    profilesMap.set(profile.id, profile);
  });

  // Combine attendance with profiles
  const attendees: AttendeeItem[] = attendanceData.map((attendance) => ({
    ...attendance,
    profiles: profilesMap.get(attendance.user_id) || {
      id: attendance.user_id,
      full_name: null,
      username: null,
      avatar_url: null,
    },
  }));

  const hasMore = attendees.length === ATTENDEES_PER_PAGE;

  return {
    attendees,
    nextCursor: hasMore ? pageParam + ATTENDEES_PER_PAGE : null,
  };
};

export default function EventAttendance() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const eventId = Array.isArray(id) ? id[0] : id;

  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEvent(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5,
  });

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
  const isEventCreator = event?.user_id === user?.id;

  // Real-time subscription for attendance changes
  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel(`attendance-list:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          // Refetch the attendees list on any change
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, refetch]);

  const removeAttendeeMutation = useMutation({
    mutationFn: async (attendanceId: number) => {
      const { error } = await supabase.from('attendance').delete().eq('id', attendanceId);
      if (error) throw new Error(`Failed to remove attendee: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendees', eventId] });
      queryClient.invalidateQueries({ queryKey: ['attendeeCount', eventId] });
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleRemoveAttendee = (item: AttendeeItem) => {
    Alert.alert(
      'Remove Attendee',
      `Are you sure you want to remove ${item.profiles.full_name || item.profiles.username || 'this attendee'} from the event?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeAttendeeMutation.mutate(item.id),
        },
      ]
    );
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#1DDD96" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <ActivityIndicator size="large" color="#1DDD96" />
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
    <View className="flex-1 bg-dark-50">
      <Stack.Screen
        options={{
          title: 'Attendees',
          headerBackTitle: 'Back',
        }}
      />
      <FlatList
        data={flattenedAttendees}
        renderItem={({ item }) => (
          <View className="mx-4 mb-3 overflow-hidden rounded-2xl bg-white shadow-sm">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <AvatarReadOnly
                  url={item.profiles.avatar_url}
                  size={48}
                  fallbackText={item.profiles.full_name || item.profiles.username}
                />
                <View className="flex-1">
                  <Text className="text-base font-bold text-dark-900">
                    {item.profiles.full_name || item.profiles.username || 'Unknown User'}
                  </Text>
                  {item.profiles.username && item.profiles.full_name && (
                    <Text className="text-sm text-dark-500">@{item.profiles.username}</Text>
                  )}
                  {item.user_id === event?.user_id && (
                    <View className="mt-1 self-start rounded-full bg-brand-100 px-2 py-0.5">
                      <Text className="text-xs font-semibold text-brand-600">Organizer</Text>
                    </View>
                  )}
                </View>
              </View>

              {isEventCreator && item.user_id !== user?.id && (
                <TouchableOpacity
                  onPress={() => handleRemoveAttendee(item)}
                  className="h-10 w-10 items-center justify-center rounded-full bg-red-50"
                  disabled={removeAttendeeMutation.isPending}>
                  {removeAttendeeMutation.isPending ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <Feather name="x" size={20} color="#ef4444" />
                  )}
                </TouchableOpacity>
              )}
            </View>
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
            colors={['#1DDD96']}
            tintColor="#1DDD96"
          />
        }
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
      />
    </View>
  );
}
