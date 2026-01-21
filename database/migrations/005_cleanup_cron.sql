-- ==========================================
-- MAINTENANCE FUNCTIONS
-- ==========================================

-- Function to reset monthly quotas
-- Should be called on the 1st of every month
CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Reset current_usage to 0 for all users
  UPDATE user_quotas
  SET current_usage = 0,
      updated_at = NOW();
      
  -- Log the event
  INSERT INTO system_logs (level, message, metadata)
  VALUES ('info', 'Monthly quota reset completed', jsonb_build_object('timestamp', NOW()));
END;
$$;

-- Function to clean up old temp images
-- Should be called daily
CREATE OR REPLACE FUNCTION cleanup_temp_data()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Clean up old AI cache (older than 30 days)
  DELETE FROM ai_analysis_cache
  WHERE last_accessed_at < NOW() - INTERVAL '30 days';
  
  -- Clean up old logs (older than 90 days)
  DELETE FROM system_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- ==========================================
-- PG_CRON SETUP (Requires pg_cron extension)
-- ==========================================
-- Only run these if pg_cron is enabled on your Supabase instance

/*
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule: Reset quotas at 00:00 on day 1 of every month
SELECT cron.schedule(
  'reset-monthly-quotas',
  '0 0 1 * *', 
  $$SELECT reset_monthly_quotas()$$
);

-- Schedule: Cleanup daily at 03:00 AM
SELECT cron.schedule(
  'daily-cleanup',
  '0 3 * * *',
  $$SELECT cleanup_temp_data()$$
);
*/
