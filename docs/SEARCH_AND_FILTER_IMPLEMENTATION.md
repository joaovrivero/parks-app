# Search and Date Filter Implementation

## Overview

This document describes the implementation of search and date filtering functionality for the events page, allowing users to find specific events by text search and filter by date range.

## Features Added

### 1. Text Search
- **Component**: `SearchInput.tsx`
- **Functionality**:
  - Searches across event title, description, and location
  - Debounced input (500ms delay) to prevent excessive API calls
  - Clear button to reset search
  - Case-insensitive search using PostgreSQL ILIKE

### 2. Date Range Filtering
- **Component**: `DateRangeFilter.tsx`
- **Functionality**:
  - Two date pickers for "From Date" and "To Date"
  - Uses existing `react-native-date-picker` library
  - Clear filter functionality
  - Visual indicators for active filters
  - Date validation (To Date cannot be before From Date)

### 3. Enhanced Backend Function
- **File**: `docs/nearby_events_with_filters.sql`
- **New Function**: `nearby_events_with_filters`
- **Parameters**:
  - `lat`, `long`: Location coordinates (required)
  - `page_limit`, `page_offset`: Pagination (optional)
  - `search_query`: Text search term (optional)
  - `date_from`, `date_to`: Date range filters (optional)

### 4. Updated Hook
- **File**: `hooks/useInfiniteEvents.tsx`
- **Changes**:
  - Added filter parameters interface
  - Updated to use new database function
  - Improved query key for proper cache management
  - Reduced stale time for search results

### 5. Enhanced Events Page
- **File**: `app/(tabs)/events/index.tsx`
- **Changes**:
  - Added search and filter components as sticky header
  - State management for search query and date filters
  - Improved empty state messages for filtered results
  - Better user feedback when no results match filters

## Database Schema Requirements

### SQL Function to Deploy

Run the following SQL in your Supabase console:

```sql
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
```

## Usage

### For Users
1. **Text Search**: Type in the search bar to find events by title, description, or location
2. **Date Filtering**:
   - Tap "Select date" buttons to choose date range
   - Use "Clear" to remove date filters
3. **Combined Filters**: Search and date filters work together
4. **Results**: Events update automatically as you type or change filters

### For Developers
```typescript
// Using the enhanced hook with filters
const { data: events, isLoading, error } = useInfiniteEvents({
  search: "workshop",
  dateFrom: new Date("2024-01-01"),
  dateTo: new Date("2024-12-31")
});
```

## Performance Considerations

- **Debounced Search**: 500ms delay prevents excessive API calls
- **Query Caching**: Separate cache keys for different filter combinations
- **Pagination**: Maintains existing infinite scroll functionality
- **Database Indexes**: Ensure proper indexes on `title`, `description`, `location`, and `date` columns

## Future Enhancements

1. **Category Filtering**: Add event category filters
2. **Distance Filtering**: Allow users to set maximum distance
3. **Saved Searches**: Save frequently used search/filter combinations
4. **Search History**: Remember recent searches
5. **Advanced Filters**: Price range, organizer, etc.

## Files Modified

- `components/SearchInput.tsx` (new)
- `components/DateRangeFilter.tsx` (new)
- `hooks/useInfiniteEvents.tsx` (updated)
- `app/(tabs)/events/index.tsx` (updated)
- `types/supabase.ts` (updated)
- `docs/nearby_events_with_filters.sql` (new)