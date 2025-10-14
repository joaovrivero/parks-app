-- Updated nearby_events function with pagination support
CREATE OR REPLACE FUNCTION nearby_events_paginated(
  lat FLOAT,
  long FLOAT,
  page_limit INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0
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
    id,
    created_at,
    title,
    description,
    date,
    location,
    image_uri,
    user_id,
    ST_Y(location_point::geometry) AS lat,
    ST_X(location_point::geometry) AS long,
    ST_Distance(location_point, ST_Point(long, lat)::geography) AS dist_meters
  FROM public.events
  ORDER BY location_point <-> ST_Point(long, lat)::geography
  LIMIT page_limit
  OFFSET page_offset;
$$;