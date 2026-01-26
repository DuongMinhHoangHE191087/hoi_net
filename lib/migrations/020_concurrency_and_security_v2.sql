-- ==========================================
-- COMPREHENSIVE CONCURRENCY & SECURITY FIX V2
-- File: 020_concurrency_and_security_v2.sql
-- Run in Supabase SQL Editor
-- Fixed syntax errors
-- ==========================================

-- ==========================================
-- STEP 1: ADD VERSION COLUMNS FOR OPTIMISTIC LOCKING
-- ==========================================

DO $$
BEGIN
  -- blog_posts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blog_posts' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'version') THEN
      ALTER TABLE blog_posts ADD COLUMN version INTEGER DEFAULT 1;
      RAISE NOTICE 'Added version column to blog_posts';
    END IF;
  END IF;

  -- team_members
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_members' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'version') THEN
      ALTER TABLE team_members ADD COLUMN version INTEGER DEFAULT 1;
      RAISE NOTICE 'Added version column to team_members';
    END IF;
  END IF;

  -- site_settings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_settings' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'version') THEN
      ALTER TABLE site_settings ADD COLUMN version INTEGER DEFAULT 1;
      RAISE NOTICE 'Added version column to site_settings';
    END IF;
  END IF;

  -- feedback
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedback' AND column_name = 'version') THEN
      ALTER TABLE feedback ADD COLUMN version INTEGER DEFAULT 1;
      RAISE NOTICE 'Added version column to feedback';
    END IF;
  END IF;

  -- value_sections
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'value_sections' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'value_sections' AND column_name = 'version') THEN
      ALTER TABLE value_sections ADD COLUMN version INTEGER DEFAULT 1;
      RAISE NOTICE 'Added version column to value_sections';
    END IF;
  END IF;

  -- user_requests
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_requests' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_requests' AND column_name = 'version') THEN
      ALTER TABLE user_requests ADD COLUMN version INTEGER DEFAULT 1;
      RAISE NOTICE 'Added version column to user_requests';
    END IF;
  END IF;

  -- requests
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'requests' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'version') THEN
      ALTER TABLE requests ADD COLUMN version INTEGER DEFAULT 1;
      RAISE NOTICE 'Added version column to requests';
    END IF;
  END IF;

  -- navigation_links
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'navigation_links' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'navigation_links' AND column_name = 'version') THEN
      ALTER TABLE navigation_links ADD COLUMN version INTEGER DEFAULT 1;
      RAISE NOTICE 'Added version column to navigation_links';
    END IF;
  END IF;

  -- footer_links
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'footer_links' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'footer_links' AND column_name = 'version') THEN
      ALTER TABLE footer_links ADD COLUMN version INTEGER DEFAULT 1;
      RAISE NOTICE 'Added version column to footer_links';
    END IF;
  END IF;

  -- about_sections
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'about_sections' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'about_sections' AND column_name = 'version') THEN
      ALTER TABLE about_sections ADD COLUMN version INTEGER DEFAULT 1;
      RAISE NOTICE 'Added version column to about_sections';
    END IF;
  END IF;

  -- ai_system_prompts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_system_prompts' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_system_prompts' AND column_name = 'version') THEN
      ALTER TABLE ai_system_prompts ADD COLUMN version INTEGER DEFAULT 1;
      RAISE NOTICE 'Added version column to ai_system_prompts';
    END IF;
  END IF;

END $$;

-- ==========================================
-- STEP 2: CREATE VERSION INCREMENT TRIGGER FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION public.increment_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment if version column exists
  NEW.version := COALESCE(OLD.version, 0) + 1;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- STEP 3: APPLY VERSION TRIGGERS TO ALL TABLES
-- ==========================================

-- blog_posts trigger
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blog_posts') THEN
    DROP TRIGGER IF EXISTS trigger_increment_version_blog_posts ON blog_posts;
    CREATE TRIGGER trigger_increment_version_blog_posts
      BEFORE UPDATE ON blog_posts
      FOR EACH ROW EXECUTE FUNCTION increment_version();
    RAISE NOTICE 'Created version trigger for blog_posts';
  END IF;
END $$;

-- team_members trigger
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_members') THEN
    DROP TRIGGER IF EXISTS trigger_increment_version_team_members ON team_members;
    CREATE TRIGGER trigger_increment_version_team_members
      BEFORE UPDATE ON team_members
      FOR EACH ROW EXECUTE FUNCTION increment_version();
    RAISE NOTICE 'Created version trigger for team_members';
  END IF;
END $$;

-- site_settings trigger
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_settings') THEN
    DROP TRIGGER IF EXISTS trigger_increment_version_site_settings ON site_settings;
    CREATE TRIGGER trigger_increment_version_site_settings
      BEFORE UPDATE ON site_settings
      FOR EACH ROW EXECUTE FUNCTION increment_version();
    RAISE NOTICE 'Created version trigger for site_settings';
  END IF;
END $$;

-- feedback trigger
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback') THEN
    DROP TRIGGER IF EXISTS trigger_increment_version_feedback ON feedback;
    CREATE TRIGGER trigger_increment_version_feedback
      BEFORE UPDATE ON feedback
      FOR EACH ROW EXECUTE FUNCTION increment_version();
    RAISE NOTICE 'Created version trigger for feedback';
  END IF;
END $$;

-- value_sections trigger
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'value_sections') THEN
    DROP TRIGGER IF EXISTS trigger_increment_version_value_sections ON value_sections;
    CREATE TRIGGER trigger_increment_version_value_sections
      BEFORE UPDATE ON value_sections
      FOR EACH ROW EXECUTE FUNCTION increment_version();
    RAISE NOTICE 'Created version trigger for value_sections';
  END IF;
END $$;

-- user_requests trigger
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_requests') THEN
    DROP TRIGGER IF EXISTS trigger_increment_version_user_requests ON user_requests;
    CREATE TRIGGER trigger_increment_version_user_requests
      BEFORE UPDATE ON user_requests
      FOR EACH ROW EXECUTE FUNCTION increment_version();
    RAISE NOTICE 'Created version trigger for user_requests';
  END IF;
END $$;

-- navigation_links trigger
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'navigation_links') THEN
    DROP TRIGGER IF EXISTS trigger_increment_version_navigation_links ON navigation_links;
    CREATE TRIGGER trigger_increment_version_navigation_links
      BEFORE UPDATE ON navigation_links
      FOR EACH ROW EXECUTE FUNCTION increment_version();
    RAISE NOTICE 'Created version trigger for navigation_links';
  END IF;
END $$;

-- footer_links trigger
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'footer_links') THEN
    DROP TRIGGER IF EXISTS trigger_increment_version_footer_links ON footer_links;
    CREATE TRIGGER trigger_increment_version_footer_links
      BEFORE UPDATE ON footer_links
      FOR EACH ROW EXECUTE FUNCTION increment_version();
    RAISE NOTICE 'Created version trigger for footer_links';
  END IF;
END $$;

-- ==========================================
-- STEP 4: CREATE DISTRIBUTED LOCKS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS distributed_locks (
  lock_name TEXT PRIMARY KEY,
  lock_id TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  acquired_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster expired lock cleanup
DROP INDEX IF EXISTS idx_locks_expires;
CREATE INDEX idx_locks_expires ON distributed_locks(expires_at);

-- Enable RLS
ALTER TABLE distributed_locks ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
DROP POLICY IF EXISTS "authenticated_manage_locks" ON distributed_locks;
CREATE POLICY "authenticated_manage_locks" ON distributed_locks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- STEP 5: CREATE ROW LOCKING FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION public.lock_row_for_update(p_table TEXT, p_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  allowed_tables TEXT[] := ARRAY[
    'blog_posts', 'team_members', 'site_settings', 
    'user_requests', 'requests', 'feedback', 'value_sections',
    'navigation_links', 'footer_links', 'about_sections', 'ai_system_prompts'
  ];
BEGIN
  -- Validate table name to prevent SQL injection
  IF NOT (p_table = ANY(allowed_tables)) THEN
    RAISE EXCEPTION 'Invalid table name: %', p_table;
  END IF;

  EXECUTE format(
    'SELECT row_to_json(t)::jsonb FROM %I t WHERE id = $1 FOR UPDATE NOWAIT',
    p_table
  ) INTO result USING p_id;
  
  IF result IS NULL THEN
    RAISE EXCEPTION 'Row not found in table %', p_table;
  END IF;
  
  RETURN result;
EXCEPTION
  WHEN lock_not_available THEN
    RAISE EXCEPTION 'Row is currently locked by another user. Please try again later.';
END;
$$;

-- ==========================================
-- STEP 6: CLEANUP EXPIRED LOCKS FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_locks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM distributed_locks WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ==========================================
-- STEP 7: CREATE CONFLICT LOG TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS conflict_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  row_id UUID,
  user_id UUID,
  expected_version INTEGER,
  actual_version INTEGER,
  operation TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_conflict_log_table;
DROP INDEX IF EXISTS idx_conflict_log_created;
CREATE INDEX idx_conflict_log_table ON conflict_log(table_name);
CREATE INDEX idx_conflict_log_created ON conflict_log(created_at DESC);

-- Enable RLS on conflict_log
ALTER TABLE conflict_log ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert conflict logs
DROP POLICY IF EXISTS "service_insert_conflict_log" ON conflict_log;
CREATE POLICY "service_insert_conflict_log" ON conflict_log
  FOR INSERT TO authenticated WITH CHECK (true);

-- Admin can read all conflict logs
DROP POLICY IF EXISTS "admin_read_conflict_log" ON conflict_log;
CREATE POLICY "admin_read_conflict_log" ON conflict_log
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- ==========================================
-- STEP 8: FIX OVERLY PERMISSIVE RLS POLICIES
-- ==========================================

-- Drop permissive policies
DROP POLICY IF EXISTS "Allow all blog operations" ON blog_posts;
DROP POLICY IF EXISTS "Allow all team operations" ON team_members;
DROP POLICY IF EXISTS "Allow all settings operations" ON site_settings;
DROP POLICY IF EXISTS "Allow all sections operations" ON value_sections;

-- Create admin-only policies (if admin_users table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users' AND table_schema = 'public') THEN
    
    -- ========== BLOG POSTS ==========
    DROP POLICY IF EXISTS "admin_only_blog_insert" ON blog_posts;
    DROP POLICY IF EXISTS "admin_only_blog_update" ON blog_posts;
    DROP POLICY IF EXISTS "admin_only_blog_delete" ON blog_posts;
    DROP POLICY IF EXISTS "admin_read_all_blog" ON blog_posts;
    
    CREATE POLICY "admin_only_blog_insert" ON blog_posts
      FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    CREATE POLICY "admin_only_blog_update" ON blog_posts
      FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    CREATE POLICY "admin_only_blog_delete" ON blog_posts
      FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    CREATE POLICY "admin_read_all_blog" ON blog_posts
      FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    -- ========== TEAM MEMBERS ==========
    DROP POLICY IF EXISTS "admin_only_team_insert" ON team_members;
    DROP POLICY IF EXISTS "admin_only_team_update" ON team_members;
    DROP POLICY IF EXISTS "admin_only_team_delete" ON team_members;
    
    CREATE POLICY "admin_only_team_insert" ON team_members
      FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    CREATE POLICY "admin_only_team_update" ON team_members
      FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    CREATE POLICY "admin_only_team_delete" ON team_members
      FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    -- ========== SITE SETTINGS ==========
    DROP POLICY IF EXISTS "admin_only_settings_insert" ON site_settings;
    DROP POLICY IF EXISTS "admin_only_settings_update" ON site_settings;
    DROP POLICY IF EXISTS "admin_only_settings_delete" ON site_settings;
    
    CREATE POLICY "admin_only_settings_insert" ON site_settings
      FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    CREATE POLICY "admin_only_settings_update" ON site_settings
      FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    CREATE POLICY "admin_only_settings_delete" ON site_settings
      FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    -- ========== VALUE SECTIONS ==========
    DROP POLICY IF EXISTS "admin_only_values_insert" ON value_sections;
    DROP POLICY IF EXISTS "admin_only_values_update" ON value_sections;
    DROP POLICY IF EXISTS "admin_only_values_delete" ON value_sections;
    
    CREATE POLICY "admin_only_values_insert" ON value_sections
      FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    CREATE POLICY "admin_only_values_update" ON value_sections
      FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    CREATE POLICY "admin_only_values_delete" ON value_sections
      FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    RAISE NOTICE '✅ Created admin-only RLS policies';
  ELSE
    RAISE NOTICE '⚠️ admin_users table not found, skipping admin policies';
  END IF;
END $$;

-- ==========================================
-- STEP 9: CREATE HELPER FUNCTION FOR OPTIMISTIC LOCKING
-- ==========================================

CREATE OR REPLACE FUNCTION public.update_with_version_check(
  p_table TEXT,
  p_id UUID,
  p_expected_version INTEGER,
  p_updates JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  current_version INTEGER;
  allowed_tables TEXT[] := ARRAY[
    'blog_posts', 'team_members', 'site_settings', 
    'user_requests', 'requests', 'feedback', 'value_sections',
    'navigation_links', 'footer_links', 'about_sections'
  ];
BEGIN
  -- Validate table name
  IF NOT (p_table = ANY(allowed_tables)) THEN
    RAISE EXCEPTION 'Invalid table name: %', p_table;
  END IF;

  -- Get current version
  EXECUTE format('SELECT version FROM %I WHERE id = $1', p_table)
  INTO current_version USING p_id;

  IF current_version IS NULL THEN
    RAISE EXCEPTION 'Row not found';
  END IF;

  -- Check version match
  IF current_version != p_expected_version THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'VERSION_MISMATCH',
      'expected_version', p_expected_version,
      'current_version', current_version
    );
  END IF;

  -- Perform update (version will be auto-incremented by trigger)
  EXECUTE format(
    'UPDATE %I SET ' ||
    array_to_string(
      ARRAY(SELECT format('%I = $2->>%L', key, key) FROM jsonb_object_keys(p_updates) AS key),
      ', '
    ) ||
    ' WHERE id = $1 AND version = $3 RETURNING row_to_json(%I.*)::jsonb',
    p_table, p_table
  ) INTO result USING p_id, p_updates, p_expected_version;

  IF result IS NULL THEN
    -- Race condition - version changed between check and update
    EXECUTE format('SELECT version FROM %I WHERE id = $1', p_table)
    INTO current_version USING p_id;
    
    RETURN jsonb_build_object(
      'success', false,
      'error', 'VERSION_MISMATCH',
      'expected_version', p_expected_version,
      'current_version', current_version
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'data', result
  );
END;
$$;

-- ==========================================
-- STEP 10: VERIFICATION
-- ==========================================

DO $$
DECLARE
  version_count INTEGER;
  trigger_count INTEGER;
  lock_table_exists BOOLEAN;
  conflict_table_exists BOOLEAN;
BEGIN
  -- Count tables with version column
  SELECT COUNT(*) INTO version_count
  FROM information_schema.columns
  WHERE column_name = 'version'
    AND table_schema = 'public';
  
  -- Count version triggers
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_name LIKE 'trigger_increment_version%'
    AND trigger_schema = 'public';
  
  -- Check tables exist
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'distributed_locks') 
  INTO lock_table_exists;
  
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conflict_log') 
  INTO conflict_table_exists;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MIGRATION COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 Tables with version column: %', version_count;
  RAISE NOTICE '⚡ Version increment triggers: %', trigger_count;
  RAISE NOTICE '🔒 Distributed locks table: %', CASE WHEN lock_table_exists THEN 'Created' ELSE 'Not created' END;
  RAISE NOTICE '📝 Conflict log table: %', CASE WHEN conflict_table_exists THEN 'Created' ELSE 'Not created' END;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update API routes to use optimistic locking';
  RAISE NOTICE '2. Update frontend to handle 409 Conflict responses';
  RAISE NOTICE '3. Set up periodic cleanup of expired locks';
  RAISE NOTICE '';
END $$;
