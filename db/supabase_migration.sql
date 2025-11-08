-- Migration to add max_capacity and women_only fields to events table
-- Run this in your Supabase SQL Editor

-- Add max_capacity column (nullable for unlimited events)
ALTER TABLE events
ADD COLUMN IF NOT EXISTS max_capacity INTEGER;

-- Add women_only column (default false)
ALTER TABLE events
ADD COLUMN IF NOT EXISTS women_only BOOLEAN DEFAULT false;

-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS nearby_events(double precision, double precision);
DROP FUNCTION IF EXISTS nearby_events_with_filters(double precision, double precision, integer, integer, text, date, date);
DROP FUNCTION IF EXISTS nearby_events_with_filters(float, float, integer, integer, text, date, date);

-- Recreate the nearby_events function with new fields
CREATE OR REPLACE FUNCTION nearby_events(
  lat FLOAT,
  long FLOAT
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
  event_lat FLOAT,
  event_long FLOAT,
  dist_meters FLOAT,
  max_capacity public.events.max_capacity%TYPE,
  women_only public.events.women_only%TYPE
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
    ST_Y(e.location_point::geometry),
    ST_X(e.location_point::geometry),
    ST_Distance(e.location_point, ST_Point(long, lat)::geography),
    e.max_capacity,
    e.women_only
  FROM public.events e
  ORDER BY e.location_point <-> ST_Point(long, lat)::geography;
$$;

-- Recreate the nearby_events_with_filters function with new fields
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
  event_lat FLOAT,
  event_long FLOAT,
  dist_meters FLOAT,
  max_capacity public.events.max_capacity%TYPE,
  women_only public.events.women_only%TYPE
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
    ST_Y(e.location_point::geometry),
    ST_X(e.location_point::geometry),
    ST_Distance(e.location_point, ST_Point(long, lat)::geography),
    e.max_capacity,
    e.women_only
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
