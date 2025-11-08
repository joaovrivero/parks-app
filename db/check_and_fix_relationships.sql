-- Check existing foreign keys on attendance table
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name='attendance';

-- If the foreign key doesn't exist, create it
-- First, make sure the attendance table exists and has the correct structure
CREATE TABLE IF NOT EXISTS attendance (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event_id ON attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_created_at ON attendance(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view attendance" ON attendance;
DROP POLICY IF EXISTS "Users can join events" ON attendance;
DROP POLICY IF EXISTS "Users can leave events they joined" ON attendance;
DROP POLICY IF EXISTS "Event creators can remove attendees" ON attendance;

-- Policy: Anyone can view attendance records
CREATE POLICY "Anyone can view attendance"
    ON attendance FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Authenticated users can join events
CREATE POLICY "Users can join events"
    ON attendance FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Users can delete their own attendance (leave event)
CREATE POLICY "Users can leave events they joined"
    ON attendance FOR DELETE
    TO authenticated
    USING (auth.uid()::text = user_id::text);

-- Policy: Event creators can remove any attendee from their events
CREATE POLICY "Event creators can remove attendees"
    ON attendance FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM events
            WHERE events.id = attendance.event_id
            AND events.user_id::text = auth.uid()::text
        )
    );
