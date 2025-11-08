-- Add image_url column to comments table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN comments.image_url IS 'Storage path for optional image attachment in comment';
