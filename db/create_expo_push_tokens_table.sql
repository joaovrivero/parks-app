-- Create table for storing Expo push tokens
-- This allows us to send push notifications to users

CREATE TABLE IF NOT EXISTS public.expo_push_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one token per user (user can have only one active device token)
  CONSTRAINT unique_user_token UNIQUE (user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_expo_push_tokens_user_id ON public.expo_push_tokens(user_id);

-- Create index on token for faster lookups when validating tokens
CREATE INDEX IF NOT EXISTS idx_expo_push_tokens_token ON public.expo_push_tokens(token);

-- Enable Row Level Security (RLS)
ALTER TABLE public.expo_push_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only insert/update their own tokens
CREATE POLICY "Users can manage their own push tokens"
  ON public.expo_push_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Allow service role to read all tokens (for sending notifications)
CREATE POLICY "Service role can read all tokens"
  ON public.expo_push_tokens
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_expo_push_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before updates
CREATE TRIGGER update_expo_push_tokens_updated_at_trigger
  BEFORE UPDATE ON public.expo_push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_expo_push_tokens_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expo_push_tokens TO authenticated;
GRANT SELECT ON public.expo_push_tokens TO service_role;

COMMENT ON TABLE public.expo_push_tokens IS 'Stores Expo push notification tokens for registered users';
COMMENT ON COLUMN public.expo_push_tokens.token IS 'Expo push token in format ExponentPushToken[...]';
