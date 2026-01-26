-- ==========================================
-- COMPREHENSIVE CONCURRENCY & SECURITY FIX
-- File: 020_concurrency_and_security.sql
-- Run in Supabase SQL Editor
-- ==========================================

-- ==========================================
-- STEP 1: ADD VERSION COLUMNS FOR OPTIMISTIC LOCKING
-- ==========================================

-- Add version column to tables that need concurrency control
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE value_sections ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- User requests table (might be named differently)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_requests') THEN
    ALTER TABLE user_requests ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'requests') THEN
    ALTER TABLE requests ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
  END IF;
END $$;

-- ==========================================
-- STEP 2: CREATE VERSION INCREMENT TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = COALESCE(OLD.version, 0) + 1;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY['blog_posts', 'team_members', 'site_settings', 
                          'feedback', 'value_sections'];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    BEGIN
      EXECUTE format('
        DROP TRIGGER IF EXISTS trigger_increment_version ON %I;
        CREATE TRIGGER trigger_increment_version
          BEFORE UPDATE ON %I
          FOR EACH ROW EXECUTE FUNCTION increment_version();
      ', tbl, tbl);
      RAISE NOTICE 'Added version trigger to: %', tbl;
    EXCEPTION WHEN undefined_table THEN
      RAISE NOTICE 'Table % does not exist, skipping', tbl;
    END;
  END LOOP;
END $$;

-- ==========================================
-- STEP 3: CREATE DISTRIBUTED LOCKS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS distributed_locks (
  lock_name TEXT PRIMARY KEY,
  lock_id TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  acquired_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster expired lock cleanup
CREATE INDEX IF NOT EXISTS idx_locks_expires ON distributed_locks(expires_at);

-- Enable RLS on locks table
ALTER TABLE distributed_locks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage locks
DO $$
BEGIN
  DROP POLICY IF EXISTS "authenticated_manage_locks" ON distributed_locks;
  CREATE POLICY "authenticated_manage_locks" ON distributed_locks
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'distributed_locks table not ready, skipping policy';
END $$;

-- ==========================================
-- STEP 4: CREATE ROW LOCKING FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION lock_row_for_update(p_table TEXT, p_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Validate table name to prevent SQL injection
  IF p_table NOT IN ('blog_posts', 'team_members', 'site_settings', 
                     'user_requests', 'requests', 'feedback', 'value_sections') THEN
    RAISE EXCEPTION 'Invalid table name: %', p_table;
  END IF;

  EXECUTE format(
    'SELECT row_to_json(t)::jsonb FROM %I t WHERE id = $1 FOR UPDATE NOWAIT',
    p_table
  ) INTO result USING p_id;
  
  IF result IS NULL THEN
    RAISE EXCEPTION 'Row not found';
  END IF;
  
  RETURN result;
EXCEPTION
  WHEN lock_not_available THEN
    RAISE EXCEPTION 'Row is currently locked by another user. Please try again.';
END;
$$;

-- ==========================================
-- STEP 5: CLEANUP EXPIRED LOCKS FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
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
-- STEP 6: CREATE CONFLICT LOG TABLE (OPTIONAL)
-- ==========================================

CREATE TABLE IF NOT EXISTS conflict_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  row_id UUID NOT NULL,
  user_id UUID,
  expected_version INTEGER,
  actual_version INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conflict_log_table ON conflict_log(table_name);
CREATE INDEX IF NOT EXISTS idx_conflict_log_created ON conflict_log(created_at DESC);

-- ==========================================
-- STEP 7: FIX OVERLY PERMISSIVE RLS POLICIES
-- ==========================================

-- Drop the permissive policies that allow anyone to modify data
DO $$
BEGIN
  -- Blog posts
  DROP POLICY IF EXISTS "Allow all blog operations" ON blog_posts;
  
  -- Team members
  DROP POLICY IF EXISTS "Allow all team operations" ON team_members;
  
  -- Site settings
  DROP POLICY IF EXISTS "Allow all settings operations" ON site_settings;
  
  -- Value sections
  DROP POLICY IF EXISTS "Allow all sections operations" ON value_sections;
  
  RAISE NOTICE 'Dropped permissive policies';
EXCEPTION WHEN undefined_object THEN
  RAISE NOTICE 'Some policies did not exist, continuing...';
END $$;

-- Create admin-only policies (requires admin_users table)
DO $$
BEGIN
  -- Check if admin_users table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    
    -- Blog posts - Admin only for CUD operations
    CREATE POLICY "admin_only_blog_insert" ON blog_posts
      FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    CREATE POLICY "admin_only_blog_update" ON blog_posts
      FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    CREATE POLICY "admin_only_blog_delete" ON blog_posts
      FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    -- Admin can read all posts
    CREATE POLICY "admin_read_all_blog" ON blog_posts
      FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    -- Team members
    CREATE POLICY "admin_only_team_insert" ON team_members
      FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    CREATE POLICY "admin_only_team_update" ON team_members
      FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    CREATE POLICY "admin_only_team_delete" ON team_members
      FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    -- Site settings
    CREATE POLICY "admin_only_settings_insert" ON site_settings
      FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    CREATE POLICY "admin_only_settings_update" ON site_settings
      FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    CREATE POLICY "admin_only_settings_delete" ON site_settings
      FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    -- Value sections
    CREATE POLICY "admin_only_values_insert" ON value_sections
      FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    CREATE POLICY "admin_only_values_update" ON value_sections
      FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    CREATE POLICY "admin_only_values_delete" ON value_sections
      FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

    RAISE NOTICE '✅ Created admin-only policies';
  ELSE
    RAISE NOTICE '⚠️ admin_users table not found, skipping admin policies';
  END IF;
END $$;

-- ==========================================
-- VERIFICATION
-- ==========================================

DO $$
DECLARE
  version_count INTEGER;
  lock_table_exists BOOLEAN;
BEGIN
  -- Check version columns
  SELECT COUNT(*) INTO version_count
  FROM information_schema.columns
  WHERE column_name = 'version'
    AND table_schema = 'public'
    AND table_name IN ('blog_posts', 'team_members', 'site_settings');
  
  -- Check locks table
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'distributed_locks'
  ) INTO lock_table_exists;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Migration completed!';
  RAISE NOTICE '📊 Tables with version column: %', version_count;
  RAISE NOTICE '🔒 Distributed locks table: %', 
    CASE WHEN lock_table_exists THEN 'Created' ELSE 'Not created' END;
  RAISE NOTICE '========================================';
END $$;
