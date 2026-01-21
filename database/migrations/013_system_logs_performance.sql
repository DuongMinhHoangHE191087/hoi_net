-- ============================================
-- Migration 013: System Logs & Performance Indexes
-- Adds system_logs table and performance optimization indexes
-- ============================================

-- ============================================
-- 1. Create system_logs table for structured logging
-- ============================================
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error', 'debug')),
  message TEXT NOT NULL,
  path TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON public.system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON public.system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_path ON public.system_logs(path);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_system_logs_level_created
  ON public.system_logs(level, created_at DESC);

-- Enable RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read logs
DROP POLICY IF EXISTS "Admins can read logs" ON public.system_logs;
CREATE POLICY "Admins can read logs" ON public.system_logs
  FOR SELECT USING (is_admin_user());

-- System can insert logs (no auth check for inserts)
DROP POLICY IF EXISTS "System can insert logs" ON public.system_logs;
CREATE POLICY "System can insert logs" ON public.system_logs
  FOR INSERT WITH CHECK (true);

-- Only admins can delete logs
DROP POLICY IF EXISTS "Admins can delete logs" ON public.system_logs;
CREATE POLICY "Admins can delete logs" ON public.system_logs
  FOR DELETE USING (is_admin_user());

-- Grant permissions
GRANT ALL ON public.system_logs TO authenticated;
GRANT INSERT ON public.system_logs TO anon;

-- ============================================
-- 2. Create auto-cleanup function for old logs
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  -- Delete logs older than 30 days
  DELETE FROM public.system_logs
  WHERE created_at < NOW() - INTERVAL '30 days';

  -- Delete debug logs older than 7 days
  DELETE FROM public.system_logs
  WHERE level = 'debug' AND created_at < NOW() - INTERVAL '7 days';

  -- Delete info logs older than 14 days
  DELETE FROM public.system_logs
  WHERE level = 'info' AND created_at < NOW() - INTERVAL '14 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. Add performance indexes to existing tables
-- ============================================

-- user_requests indexes
CREATE INDEX IF NOT EXISTS idx_user_requests_user_id
  ON public.user_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_requests_status
  ON public.user_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_requests_created_at
  ON public.user_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_requests_status_created
  ON public.user_requests(status, created_at DESC);

-- ai_usage_log indexes
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_user_id
  ON public.ai_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_created_at
  ON public.ai_usage_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_action_type
  ON public.ai_usage_log(action_type);

-- user_quotas indexes
CREATE INDEX IF NOT EXISTS idx_user_quotas_user_id
  ON public.user_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quotas_period_end
  ON public.user_quotas(period_end);

-- blog_posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug
  ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published
  ON public.blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_created
  ON public.blog_posts(published, created_at DESC);

-- ============================================
-- 4. Create batch update function for reordering
-- ============================================
CREATE OR REPLACE FUNCTION batch_update_display_order(
  p_table TEXT,
  p_ids UUID[],
  p_orders INTEGER[]
)
RETURNS void AS $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..array_length(p_ids, 1) LOOP
    EXECUTE format(
      'UPDATE public.%I SET display_order = $1 WHERE id = $2',
      p_table
    ) USING p_orders[i], p_ids[i];
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. Create increment_usage function if not exists
-- ============================================
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_credits INTEGER DEFAULT 1
)
RETURNS void AS $$
BEGIN
  UPDATE public.user_quotas
  SET
    current_usage = current_usage + p_credits,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. Create check_user_quota function
-- ============================================
CREATE OR REPLACE FUNCTION check_user_quota(p_user_id UUID)
RETURNS TABLE (
  has_quota BOOLEAN,
  remaining INTEGER,
  monthly_limit INTEGER,
  current_usage INTEGER,
  period_end TIMESTAMPTZ,
  tier TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (q.is_unlimited OR q.current_usage < q.monthly_limit + COALESCE(q.extra_credits, 0)) as has_quota,
    GREATEST(0, q.monthly_limit + COALESCE(q.extra_credits, 0) - q.current_usage)::INTEGER as remaining,
    q.monthly_limit::INTEGER,
    q.current_usage::INTEGER,
    q.period_end,
    q.tier::TEXT
  FROM public.user_quotas q
  WHERE q.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DONE!
-- ============================================
