import { useQuery } from '@tanstack/react-query';

import { useAuth } from '~/contexts/AuthProvider';
import { NearbyEvent } from '~/types/db';
import { supabase } from '~/utils/supabase';

interface PastEvent extends Omit<NearbyEvent, 'dist_meters'> {
  dist_meters?: number;
}

export const useMyPastEvents = () => {
  const { user } = useAuth();

  const fetchPastEvents = async (): Promise<PastEvent[]> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    // Get all events the user has attended that are in the past
    const { data, error } = await supabase
      .from('attendance')
      .select(
        `
        event_id,
        events:event_id (
          id,
          created_at,
          title,
          description,
          date,
          location,
          image_uri,
          user_id,
          location_point
        )
      `
      )
      .eq('user_id', user.id)
      .lt('events.date', new Date().toISOString().split('T')[0])
      .order('events(date)', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch past events: ${error.message}`);
    }

    // Transform the data to match NearbyEvent structure
    const pastEvents: PastEvent[] = (data || [])
      .map((item: any) => {
        const event = item.events;
        if (!event) return null;

        // Extract coordinates from PostGIS point if available
        let lat: number | null = null;
        let long: number | null = null;

        if (event.location_point) {
          // PostGIS point format: POINT(longitude latitude)
          const pointStr = event.location_point;
          if (typeof pointStr === 'string') {
            const match = pointStr.match(/POINT\(([^ ]+) ([^)]+)\)/);
            if (match) {
              long = parseFloat(match[1]);
              lat = parseFloat(match[2]);
            }
          }
        }

        return {
          id: event.id,
          created_at: event.created_at,
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
          image_uri: event.image_uri,
          user_id: event.user_id,
          lat,
          long,
          dist_meters: null, // Not relevant for past events
        };
      })
      .filter((event): event is PastEvent => event !== null);

    return pastEvents;
  };

  return useQuery({
    queryKey: ['pastEvents', user?.id],
    queryFn: fetchPastEvents,
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
