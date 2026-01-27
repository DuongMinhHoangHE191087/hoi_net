-- =====================================================
-- Password Reset Token Tracking
-- Ensures tokens can only be used once (one-time use)
-- =====================================================

-- Create table to track used password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_created ON password_reset_tokens(created_at);

-- Enable RLS
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can see their own tokens
CREATE POLICY "Users can view own reset tokens" ON password_reset_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Service role can insert/delete (for cleanup)
CREATE POLICY "Service role can manage tokens" ON password_reset_tokens
  FOR ALL USING (auth.role() = 'service_role');

-- Function to cleanup old tokens (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_reset_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM password_reset_tokens
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Function to check if token has been used (by hash)
CREATE OR REPLACE FUNCTION is_token_used(p_token_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM password_reset_tokens 
    WHERE token_hash = p_token_hash
  );
END;
$$;

-- Function to mark token as used
CREATE OR REPLACE FUNCTION mark_token_used(
  p_user_id UUID,
  p_token_hash TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if already used
  IF is_token_used(p_token_hash) THEN
    RETURN FALSE;
  END IF;
  
  -- Mark as used
  INSERT INTO password_reset_tokens (user_id, token_hash, ip_address, user_agent)
  VALUES (p_user_id, p_token_hash, p_ip_address, p_user_agent);
  
  RETURN TRUE;
END;
$$;

-- Comment
COMMENT ON TABLE password_reset_tokens IS 'Tracks used password reset tokens to prevent reuse';
