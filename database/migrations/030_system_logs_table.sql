-- ============================================
-- Migration: 030 - System Logs Table
-- Purpose: Persistent backend logging for errors, warnings, and audit trail
-- ============================================

-- Create system_logs table for persistent backend logging
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level VARCHAR(10) NOT NULL CHECK (level IN ('info', 'warn', 'error', 'debug')),
  message TEXT NOT NULL,
  path TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_id UUID,
  metadata JSONB DEFAULT '{}',
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by level (most common filter)
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON public.system_logs(level);

-- Index for querying by time range
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at DESC);

-- Index for filtering by user
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON public.system_logs(user_id);

-- Index for request tracing
CREATE INDEX IF NOT EXISTS idx_system_logs_request_id ON public.system_logs(request_id);

-- Composite index for admin dashboard queries (level + time)
CREATE INDEX IF NOT EXISTS idx_system_logs_level_time
  ON public.system_logs(level, created_at DESC);

-- Enable RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Only admin users can read logs
DROP POLICY IF EXISTS "Admins can read all logs" ON public.system_logs;
CREATE POLICY "Admins can read all logs"
  ON public.system_logs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- Service role (backend) can insert logs
DROP POLICY IF EXISTS "Service role can insert logs" ON public.system_logs;
CREATE POLICY "Service role can insert logs"
  ON public.system_logs FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Auto-cleanup: Keep logs for 30 days
-- ============================================

-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_system_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.system_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Schedule cleanup (requires pg_cron extension)
-- Run daily at 3:00 AM UTC
-- SELECT cron.schedule('cleanup-system-logs', '0 3 * * *', 'SELECT cleanup_old_system_logs()');

COMMENT ON TABLE public.system_logs IS 'Persistent backend logging for errors, warnings, and audit trail. Auto-cleaned after 30 days.';
