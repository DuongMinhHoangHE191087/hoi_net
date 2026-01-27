-- ==========================================
-- AUTH SECURITY LOCKOUTS - Database Schema
-- ==========================================
-- Bảng lưu trạng thái lockout cho đăng nhập
-- Keyed by HMAC-SHA256 hash của email+IP
-- Tối ưu cho tra cứu nhanh với index

-- ==========================================
-- 1. Main Lockout Table (email+IP combination)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.auth_security_lockouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Hashed identifiers (HMAC-SHA256 hex, 64 chars)
  email_ip_hash VARCHAR(64) NOT NULL,
  email_hash VARCHAR(64) NOT NULL,
  ip_hash VARCHAR(64) NOT NULL,
  
  -- Attempt tracking
  failed_count INTEGER NOT NULL DEFAULT 0,
  first_failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Lockout state
  lockout_until TIMESTAMPTZ,
  lockout_level INTEGER NOT NULL DEFAULT 0, -- Tăng dần: 0, 1, 2, 3... cho exponential backoff
  
  -- Success tracking (for reset)
  last_success_at TIMESTAMPTZ,
  total_lockouts INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint on email+IP combo
  CONSTRAINT unique_email_ip_lockout UNIQUE (email_ip_hash)
);

-- ==========================================
-- 2. Email Aggregate Table (chống đổi IP bypass)
-- ==========================================
-- Track số lần fail tổng của một email từ MỌI IP
-- Dùng để detect brute force đổi IP

CREATE TABLE IF NOT EXISTS public.auth_security_email_aggregate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  email_hash VARCHAR(64) NOT NULL UNIQUE,
  
  -- Aggregate counters
  total_failed_count INTEGER NOT NULL DEFAULT 0,
  total_lockouts INTEGER NOT NULL DEFAULT 0,
  distinct_ips_count INTEGER NOT NULL DEFAULT 0,
  
  -- Global lockout (khi quá nhiều IP khác nhau fail)
  global_lockout_until TIMESTAMPTZ,
  global_lockout_level INTEGER NOT NULL DEFAULT 0,
  
  -- Timing
  first_failed_at TIMESTAMPTZ,
  last_failed_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 3. Indexes for Fast Lookup
-- ==========================================

-- Primary lookup: email+IP hash (most common query)
CREATE INDEX IF NOT EXISTS idx_lockouts_email_ip_hash 
ON public.auth_security_lockouts (email_ip_hash);

-- Lookup by email hash (for aggregate checks)
CREATE INDEX IF NOT EXISTS idx_lockouts_email_hash 
ON public.auth_security_lockouts (email_hash);

-- Lookup by IP hash (for IP-based rate limiting)
CREATE INDEX IF NOT EXISTS idx_lockouts_ip_hash 
ON public.auth_security_lockouts (ip_hash);

-- Index on lockout_until for checking active lockouts
CREATE INDEX IF NOT EXISTS idx_lockouts_until 
ON public.auth_security_lockouts (lockout_until) 
WHERE lockout_until IS NOT NULL;

-- Email aggregate lookup
CREATE INDEX IF NOT EXISTS idx_email_agg_hash 
ON public.auth_security_email_aggregate (email_hash);

-- Index on global_lockout_until
CREATE INDEX IF NOT EXISTS idx_email_agg_lockout 
ON public.auth_security_email_aggregate (global_lockout_until) 
WHERE global_lockout_until IS NOT NULL;

-- ==========================================
-- 4. Auto-update updated_at trigger
-- ==========================================

CREATE OR REPLACE FUNCTION update_auth_security_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lockouts_updated_at ON public.auth_security_lockouts;
CREATE TRIGGER trigger_lockouts_updated_at
  BEFORE UPDATE ON public.auth_security_lockouts
  FOR EACH ROW
  EXECUTE FUNCTION update_auth_security_timestamp();

DROP TRIGGER IF EXISTS trigger_email_agg_updated_at ON public.auth_security_email_aggregate;
CREATE TRIGGER trigger_email_agg_updated_at
  BEFORE UPDATE ON public.auth_security_email_aggregate
  FOR EACH ROW
  EXECUTE FUNCTION update_auth_security_timestamp();

-- ==========================================
-- 5. Lockout Policy Constants (as functions for flexibility)
-- ==========================================

-- Số lần fail trước khi lockout
CREATE OR REPLACE FUNCTION auth_lockout_threshold() 
RETURNS INTEGER AS $$
BEGIN
  RETURN 5;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Base lockout duration in minutes
CREATE OR REPLACE FUNCTION auth_lockout_base_minutes() 
RETURNS INTEGER AS $$
BEGIN
  RETURN 60; -- 1 hour base
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Max lockout level (caps exponential growth)
CREATE OR REPLACE FUNCTION auth_lockout_max_level() 
RETURNS INTEGER AS $$
BEGIN
  RETURN 5; -- Max 32 hours (1 * 2^5)
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Number of distinct IPs that trigger global email lockout
CREATE OR REPLACE FUNCTION auth_global_lockout_ip_threshold() 
RETURNS INTEGER AS $$
BEGIN
  RETURN 10; -- If 10+ different IPs fail for same email, suspicious
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ==========================================
-- 6. Check Lockout Function (single query, optimized)
-- ==========================================

CREATE OR REPLACE FUNCTION check_auth_lockout(
  p_email_ip_hash VARCHAR(64),
  p_email_hash VARCHAR(64)
)
RETURNS TABLE (
  is_locked BOOLEAN,
  lockout_until TIMESTAMPTZ,
  remaining_attempts INTEGER,
  is_globally_locked BOOLEAN,
  global_lockout_until TIMESTAMPTZ
) AS $$
DECLARE
  v_lockout_record RECORD;
  v_email_agg RECORD;
  v_threshold INTEGER;
BEGIN
  v_threshold := auth_lockout_threshold();
  
  -- Check email+IP specific lockout
  SELECT 
    l.lockout_until,
    l.failed_count
  INTO v_lockout_record
  FROM public.auth_security_lockouts l
  WHERE l.email_ip_hash = p_email_ip_hash
  LIMIT 1;
  
  -- Check global email lockout
  SELECT 
    e.global_lockout_until,
    e.total_failed_count
  INTO v_email_agg
  FROM public.auth_security_email_aggregate e
  WHERE e.email_hash = p_email_hash
  LIMIT 1;
  
  -- Calculate return values
  RETURN QUERY SELECT
    -- is_locked: either specific lockout or global lockout is active
    COALESCE(v_lockout_record.lockout_until > NOW(), FALSE) OR 
    COALESCE(v_email_agg.global_lockout_until > NOW(), FALSE),
    
    -- lockout_until: whichever is later
    GREATEST(v_lockout_record.lockout_until, v_email_agg.global_lockout_until),
    
    -- remaining_attempts
    GREATEST(v_threshold - COALESCE(v_lockout_record.failed_count, 0), 0)::INTEGER,
    
    -- is_globally_locked
    COALESCE(v_email_agg.global_lockout_until > NOW(), FALSE),
    
    -- global_lockout_until
    v_email_agg.global_lockout_until;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 7. Record Failed Attempt Function
-- ==========================================

CREATE OR REPLACE FUNCTION record_failed_auth_attempt(
  p_email_ip_hash VARCHAR(64),
  p_email_hash VARCHAR(64),
  p_ip_hash VARCHAR(64)
)
RETURNS TABLE (
  new_failed_count INTEGER,
  is_now_locked BOOLEAN,
  lockout_until TIMESTAMPTZ,
  remaining_attempts INTEGER
) AS $$
DECLARE
  v_threshold INTEGER;
  v_base_minutes INTEGER;
  v_max_level INTEGER;
  v_record RECORD;
  v_new_level INTEGER;
  v_lockout_duration INTERVAL;
  v_new_lockout TIMESTAMPTZ;
  v_new_failed INTEGER;
BEGIN
  v_threshold := auth_lockout_threshold();
  v_base_minutes := auth_lockout_base_minutes();
  v_max_level := auth_lockout_max_level();
  
  -- Upsert lockout record
  INSERT INTO public.auth_security_lockouts (
    email_ip_hash, email_hash, ip_hash,
    failed_count, first_failed_at, last_failed_at
  )
  VALUES (
    p_email_ip_hash, p_email_hash, p_ip_hash,
    1, NOW(), NOW()
  )
  ON CONFLICT (email_ip_hash) DO UPDATE SET
    failed_count = 
      CASE 
        -- Reset counter if last fail was > 24 hours ago
        WHEN auth_security_lockouts.last_failed_at < NOW() - INTERVAL '24 hours' THEN 1
        ELSE auth_security_lockouts.failed_count + 1
      END,
    last_failed_at = NOW(),
    lockout_level = 
      CASE 
        WHEN auth_security_lockouts.last_failed_at < NOW() - INTERVAL '24 hours' THEN 0
        ELSE auth_security_lockouts.lockout_level
      END
  RETURNING * INTO v_record;
  
  v_new_failed := v_record.failed_count;
  
  -- Check if should lock
  IF v_new_failed >= v_threshold THEN
    -- Calculate lockout duration with exponential backoff
    v_new_level := LEAST(v_record.lockout_level + 1, v_max_level);
    v_lockout_duration := (v_base_minutes * POWER(2, v_new_level - 1))::INTEGER * INTERVAL '1 minute';
    v_new_lockout := NOW() + v_lockout_duration;
    
    -- Update lockout
    UPDATE public.auth_security_lockouts
    SET 
      lockout_until = v_new_lockout,
      lockout_level = v_new_level,
      total_lockouts = total_lockouts + 1,
      failed_count = 0 -- Reset counter after lockout
    WHERE email_ip_hash = p_email_ip_hash;
    
    RETURN QUERY SELECT
      0::INTEGER,
      TRUE,
      v_new_lockout,
      0::INTEGER;
  ELSE
    RETURN QUERY SELECT
      v_new_failed,
      FALSE,
      NULL::TIMESTAMPTZ,
      (v_threshold - v_new_failed)::INTEGER;
  END IF;
  
  -- Update email aggregate
  INSERT INTO public.auth_security_email_aggregate (
    email_hash,
    total_failed_count,
    distinct_ips_count,
    first_failed_at,
    last_failed_at
  )
  VALUES (
    p_email_hash,
    1,
    1,
    NOW(),
    NOW()
  )
  ON CONFLICT (email_hash) DO UPDATE SET
    total_failed_count = auth_security_email_aggregate.total_failed_count + 1,
    last_failed_at = NOW(),
    distinct_ips_count = (
      SELECT COUNT(DISTINCT ip_hash) 
      FROM public.auth_security_lockouts 
      WHERE email_hash = p_email_hash
    );
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 8. Record Successful Login (reset lockout)
-- ==========================================

CREATE OR REPLACE FUNCTION record_successful_auth(
  p_email_ip_hash VARCHAR(64),
  p_email_hash VARCHAR(64)
)
RETURNS VOID AS $$
BEGIN
  -- Reset specific lockout
  UPDATE public.auth_security_lockouts
  SET 
    failed_count = 0,
    lockout_until = NULL,
    last_success_at = NOW()
    -- Keep lockout_level for history (optional: reset to 0)
  WHERE email_ip_hash = p_email_ip_hash;
  
  -- Update email aggregate
  UPDATE public.auth_security_email_aggregate
  SET last_success_at = NOW()
  WHERE email_hash = p_email_hash;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 9. Cleanup Old Records (run periodically)
-- ==========================================

CREATE OR REPLACE FUNCTION cleanup_old_auth_lockouts(
  p_days_old INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  -- Delete records with no activity for X days
  DELETE FROM public.auth_security_lockouts
  WHERE last_failed_at < NOW() - (p_days_old || ' days')::INTERVAL
    AND (last_success_at IS NULL OR last_success_at < NOW() - (p_days_old || ' days')::INTERVAL)
    AND (lockout_until IS NULL OR lockout_until < NOW());
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  
  -- Also cleanup email aggregate with no recent activity
  DELETE FROM public.auth_security_email_aggregate
  WHERE last_failed_at < NOW() - (p_days_old || ' days')::INTERVAL
    AND (last_success_at IS NULL OR last_success_at < NOW() - (p_days_old || ' days')::INTERVAL)
    AND (global_lockout_until IS NULL OR global_lockout_until < NOW());
  
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 10. RLS Policies (optional - for admin access)
-- ==========================================

ALTER TABLE public.auth_security_lockouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_security_email_aggregate ENABLE ROW LEVEL SECURITY;

-- Only service role can access these tables
DROP POLICY IF EXISTS "Service role full access lockouts" ON public.auth_security_lockouts;
CREATE POLICY "Service role full access lockouts"
ON public.auth_security_lockouts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access email_agg" ON public.auth_security_email_aggregate;
CREATE POLICY "Service role full access email_agg"
ON public.auth_security_email_aggregate
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ AUTH SECURITY LOCKOUTS SCHEMA CREATED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '- auth_security_lockouts (email+IP tracking)';
  RAISE NOTICE '- auth_security_email_aggregate (global email tracking)';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '- check_auth_lockout()';
  RAISE NOTICE '- record_failed_auth_attempt()';
  RAISE NOTICE '- record_successful_auth()';
  RAISE NOTICE '- cleanup_old_auth_lockouts()';
  RAISE NOTICE '';
  RAISE NOTICE 'Policy: 5 attempts -> 1h lockout (doubling each time)';
  RAISE NOTICE 'Max lockout: ~32 hours (level 5)';
  RAISE NOTICE '';
  RAISE NOTICE 'Run cleanup_old_auth_lockouts() periodically (cron job)';
  RAISE NOTICE '========================================';
END $$;
