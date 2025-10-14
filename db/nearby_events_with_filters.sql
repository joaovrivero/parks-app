-- Enhanced nearby_events function with search and date filtering support
CREATE OR REPLACE FUNCTION nearby_events_with_filters(
  lat FLOAT,
  long FLOAT,
  page_limit INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0,
  search_query TEXT DEFAULT NULL,
  date_from DATE DEFAULT NULL,
  date_to DATE DEFAULT NULL
)
RETURNS TABLE (
  id public.events.id%TYPE,
  created_at public.events.created_at%TYPE,
  title public.events.title%TYPE,
  description public.events.description%TYPE,
  date public.events.date%TYPE,
  location public.events.location%TYPE,
  image_uri public.events.image_uri%TYPE,
  user_id public.events.user_id%TYPE,
  lat FLOAT,
  long FLOAT,
  dist_meters FLOAT
)
LANGUAGE sql AS $$
  SELECT
    e.id,
    e.created_at,
    e.title,
    e.description,
    e.date,
    e.location,
    e.image_uri,
    e.user_id,
    ST_Y(e.location_point::geometry) AS lat,
    ST_X(e.location_point::geometry) AS long,
    ST_Distance(e.location_point, ST_Point(long, lat)::geography) AS dist_meters
  FROM public.events e
  WHERE
    -- Only show upcoming events (exclude past events)
    e.date::date >= CURRENT_DATE
  AND
    (search_query IS NULL OR
     e.title ILIKE '%' || search_query || '%' OR
     e.description ILIKE '%' || search_query || '%' OR
     e.location ILIKE '%' || search_query || '%')
  AND
    (date_from IS NULL OR e.date::date >= date_from)
  AND
    (date_to IS NULL OR e.date::date <= date_to)
  ORDER BY e.location_point <-> ST_Point(long, lat)::geography
  LIMIT page_limit
  OFFSET page_offset;
$$;