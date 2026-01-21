-- Create system_logs table for application logging
-- Migration: 015_create_system_logs
-- Created: 2026-01-18

-- Create system_logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(20) NOT NULL DEFAULT 'info', -- debug, info, warn, error, critical
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_id VARCHAR(100),
  path VARCHAR(500),
  method VARCHAR(10),
  status_code INTEGER,
  duration_ms INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_request_id ON system_logs(request_id);

-- Add RLS policies
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read logs
CREATE POLICY "Admins can view all logs"
  ON system_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Service role can insert logs (for API routes)
CREATE POLICY "Service role can insert logs"
  ON system_logs
  FOR INSERT
  WITH CHECK (true);

-- Add retention policy comment (can be implemented with cron later)
COMMENT ON TABLE system_logs IS 'Application logs. Consider adding auto-cleanup for logs older than 90 days.';

-- Add helper function to log errors
CREATE OR REPLACE FUNCTION log_error(
  p_message TEXT,
  p_context JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO system_logs (level, message, context, user_id)
  VALUES ('error', p_message, p_context, auth.uid())
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Add helper function to log info
CREATE OR REPLACE FUNCTION log_info(
  p_message TEXT,
  p_context JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO system_logs (level, message, context, user_id)
  VALUES ('info', p_message, p_context, auth.uid())
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Success message
DO $$ BEGIN
  RAISE NOTICE 'Migration 015: system_logs table created successfully';
END $$;
