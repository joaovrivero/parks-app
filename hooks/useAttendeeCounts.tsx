import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { supabase } from '~/utils/supabase';

interface AttendeeCount {
  event_id: string;
  count: number;
}

export const useAttendeeCounts = (eventIds: string[]) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['attendeeCounts', eventIds.sort().join(',')],
    queryFn: async (): Promise<Record<string, number>> => {
      if (eventIds.length === 0) {
        return {};
      }

      const { data, error } = await supabase
        .from('attendance')
        .select('event_id')
        .in('event_id', eventIds);

      if (error) {
        throw new Error(`Failed to fetch attendee counts: ${error.message}`);
      }

      // Count occurrences of each event_id
      const counts: Record<string, number> = {};
      eventIds.forEach((id) => {
        counts[id] = 0;
      });

      data?.forEach((attendance) => {
        counts[attendance.event_id] = (counts[attendance.event_id] || 0) + 1;
      });

      return counts;
    },
    enabled: eventIds.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Real-time subscription for attendance changes on visible events
  useEffect(() => {
    if (eventIds.length === 0) return;

    // Subscribe to all visible events' attendance changes
    const channel = supabase
      .channel('attendance:events-list')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'attendance',
        },
        (payload) => {
          console.log('Attendance change detected:', payload);
          // Check if the changed attendance belongs to one of our visible events
          const affectedEventId =
            payload.eventType === 'DELETE' ? payload.old.event_id : payload.new.event_id;

          if (eventIds.includes(affectedEventId?.toString())) {
            // Invalidate the query to refetch counts
            queryClient.invalidateQueries({
              queryKey: ['attendeeCounts', eventIds.sort().join(',')],
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventIds.join(','), queryClient]);

  return query;
};
