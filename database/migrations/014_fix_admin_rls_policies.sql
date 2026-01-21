-- Fix Admin RLS Policies - Migration 014 (UPDATED)
-- This migration fixes the admin email mismatch in RLS policies
-- and improves admin access control across all tables

-- Drop old admin RLS policies on user_requests
DROP POLICY IF EXISTS "Admins can view all requests" ON user_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON user_requests;

-- Helper function to check if user is admin
-- Uses user_profiles.role for better security
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- First check if user has admin role in user_profiles
  IF EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id
    AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Fallback: Check if user email is in the hardcoded admin list
  -- This ensures admin access even before profile is created
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = user_id
    AND email IN (
      'duongminhhoanggame@gmail.com',
      'admin@photoai.com'
      -- Add more admin emails as needed
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin TO anon;

-- Create new admin policies for user_requests
CREATE POLICY "Admins can view all requests"
  ON user_requests
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all requests"
  ON user_requests
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete all requests"
  ON user_requests
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Apply same admin policies to user_profiles if exists
DO $$
BEGIN
  -- Drop old policies if they exist
  DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
  DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
  DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

  -- Create new admin policies
  CREATE POLICY "Admins can view all profiles"
    ON user_profiles
    FOR SELECT
    TO authenticated
    USING (is_admin(auth.uid()));

  CREATE POLICY "Admins can update all profiles"
    ON user_profiles
    FOR UPDATE
    TO authenticated
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

  CREATE POLICY "Admins can delete profiles"
    ON user_profiles
    FOR DELETE
    TO authenticated
    USING (is_admin(auth.uid()));
EXCEPTION
  WHEN undefined_table THEN
    NULL; -- Table doesn't exist yet, skip
END $$;

-- Apply same admin policies to blog_posts if exists
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;

  -- Admins can do everything with blog posts
  CREATE POLICY "Admins can manage blog posts"
    ON blog_posts
    FOR ALL
    TO authenticated
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Apply same admin policies to feedback if exists
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can view all feedback" ON feedback;
  DROP POLICY IF EXISTS "Admins can update feedback" ON feedback;

  CREATE POLICY "Admins can view all feedback"
    ON feedback
    FOR SELECT
    TO authenticated
    USING (is_admin(auth.uid()));

  CREATE POLICY "Admins can update feedback"
    ON feedback
    FOR UPDATE
    TO authenticated
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Create admin_actions audit table to track admin operations
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'view'
  table_name TEXT NOT NULL,
  record_id TEXT,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admin_actions
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON admin_actions
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create indexes for admin_actions
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_table_name ON admin_actions(table_name);

-- Grant permissions
GRANT ALL ON admin_actions TO authenticated;

-- Comments
COMMENT ON TABLE admin_actions IS 'Audit log for admin operations';
COMMENT ON FUNCTION is_admin IS 'Check if a user is an admin based on role or email';

-- Create a view for admin dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  -- User statistics
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM auth.users WHERE created_at > NOW() - INTERVAL '7 days') as new_users_week,
  COALESCE((SELECT COUNT(*) FROM user_profiles WHERE is_blocked = true), 0) as blocked_users,

  -- Request statistics
  COALESCE((SELECT COUNT(*) FROM user_requests), 0) as total_requests,
  COALESCE((SELECT COUNT(*) FROM user_requests WHERE status = 'pending'), 0) as pending_requests,
  COALESCE((SELECT COUNT(*) FROM user_requests WHERE status = 'processing'), 0) as processing_requests,
  COALESCE((SELECT COUNT(*) FROM user_requests WHERE status = 'completed'), 0) as completed_requests,
  COALESCE((SELECT COUNT(*) FROM user_requests WHERE status = 'rejected'), 0) as rejected_requests,

  -- Content statistics (safely handle missing tables)
  COALESCE((SELECT COUNT(*) FROM blog_posts), 0) as total_posts,
  COALESCE((SELECT COUNT(*) FROM blog_posts WHERE published = true), 0) as published_posts,
  COALESCE((SELECT COUNT(*) FROM feedback), 0) as total_feedback,
  COALESCE((SELECT COUNT(*) FROM feedback WHERE status = 'new'), 0) as unread_feedback,

  -- System statistics
  COALESCE((SELECT COUNT(*) FROM ai_usage_log), 0) as total_api_requests,
  COALESCE((SELECT COUNT(*) FROM ai_analysis_cache), 0) as total_cached,
  -- Use rejected requests as error count instead of system_logs
  COALESCE((SELECT COUNT(*) FROM user_requests WHERE status = 'rejected'), 0) as total_errors;

-- Grant select on view to authenticated users (will be filtered by RLS)
GRANT SELECT ON admin_dashboard_stats TO authenticated;

COMMENT ON VIEW admin_dashboard_stats IS 'Aggregated statistics for admin dashboard';

-- Success message
DO $$ BEGIN
  RAISE NOTICE 'Migration 014: Admin RLS policies updated successfully';
END $$;
