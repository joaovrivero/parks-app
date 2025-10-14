# Event Pagination Implementation

## Overview
This implementation replaces the previous "load all events at once" approach with a professional paginated loading system using TanStack Query.

## What Changed

### 1. Dependencies Added
- `@tanstack/react-query` - Industry standard data fetching and caching library

### 2. New Query Provider Setup
- **File**: `contexts/QueryProvider.tsx`
- **Purpose**: Configures QueryClient with optimized mobile settings
- **Features**:
  - 5-minute stale time for fresh data
  - 10-minute garbage collection time
  - Automatic retry with exponential backoff
  - Refetch on app focus

### 3. Database Function (SQL to run in Supabase)
- **File**: `docs/nearby_events_paginated.sql`
- **Purpose**: New RPC function supporting pagination parameters
- **Parameters**:
  - `lat` - Latitude
  - `long` - Longitude
  - `page_limit` - Number of events per page (default: 20)
  - `page_offset` - Offset for pagination (default: 0)

### 4. New Infinite Query Hook
- **File**: `hooks/useInfiniteEvents.tsx`
- **Purpose**: Replaces `useNearbyEvents` with infinite loading capabilities
- **Features**:
  - Loads 20 events per page
  - Infinite scroll pagination
  - Location permission handling
  - Comprehensive error handling
  - Loading and refetching states

### 5. Updated Events Screen
- **File**: `app/(tabs)/events/index.tsx`
- **Features**:
  - Infinite scroll (loads more when reaching end)
  - Pull-to-refresh functionality
  - Loading indicators (initial, loading more)
  - Error states with retry capability
  - Empty state handling

## Benefits

### Performance
- **Reduced initial load time** - Only loads 20 events instead of all
- **Lower memory usage** - Manages data efficiently
- **Faster subsequent loads** - Cached results

### User Experience
- **Smooth infinite scrolling** - No pagination buttons needed
- **Pull-to-refresh** - Standard mobile pattern
- **Loading indicators** - Clear feedback on data state
- **Error handling** - Graceful failure with retry options

### Developer Experience
- **Request deduplication** - Prevents duplicate API calls
- **Background refetching** - Keeps data fresh automatically
- **TypeScript support** - Full type safety
- **Devtools integration** - Query debugging capabilities

## Usage

The Events screen now automatically:
1. Loads first 20 events on mount
2. Shows loading indicators during fetch
3. Loads more events when user scrolls to bottom
4. Refreshes data when user pulls down
5. Handles errors gracefully with retry options

## Database Setup Required

You must run the SQL in `docs/nearby_events_paginated.sql` in your Supabase console to create the new paginated function.

## Migration Notes

- The old `useNearbyEvents` hook is still available but not used
- Consider removing it after confirming the new implementation works
- Update any other components using the old hook if needed