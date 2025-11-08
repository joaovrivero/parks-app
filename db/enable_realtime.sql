-- Enable Realtime for tables
-- Run this in your Supabase SQL Editor to enable real-time subscriptions

-- Enable Realtime for the comments table
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- Enable Realtime for the attendance table
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;

-- Optional: Enable Realtime for events table (for future use)
ALTER PUBLICATION supabase_realtime ADD TABLE events;
