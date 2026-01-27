-- ============================================
-- MIGRATION 031: Supabase Linter + RBAC Fixes
-- هدف: Fix security lints (views, RLS disabled, permissive policies, search_path)
-- Safe to run multiple times.
-- ============================================

-- ============================================
-- 1) REMOVE/REPLACE PROBLEMATIC VIEWS
-- - admin_dashboard_stats exposes auth.users via public schema
-- - user_usage_stats flagged as security definer view in Supabase linter
-- These views are not referenced in app code; admin APIs use service-role queries.
-- ============================================

DROP VIEW IF EXISTS public.admin_dashboard_stats;
DROP VIEW IF EXISTS public.user_usage_stats;

-- ============================================
-- 2) UNIFY ADMIN CHECKS (DB SIDE)
-- Make public.is_admin() consistent with user_profiles.role + admin_users.
-- IMPORTANT: Do NOT grant EXECUTE to anon.
-- ============================================

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Primary: user_profiles.role
  IF EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = user_id
      AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Legacy: admin_users table
  IF EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE admin_users.user_id = user_id
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- Keep get_user_role aligned with user_profiles.role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  r TEXT;
BEGIN
  SELECT role INTO r
  FROM public.user_profiles
  WHERE id = user_id;

  IF r IS NOT NULL THEN
    RETURN r;
  END IF;

  IF EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = user_id) THEN
    RETURN 'admin';
  END IF;

  RETURN 'user';
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_role(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;

-- Keep has_permission but lock down search_path
CREATE OR REPLACE FUNCTION public.has_permission(user_id UUID, perm VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role FROM public.user_profiles WHERE id = user_id;
  user_role := COALESCE(user_role, 'user');

  RETURN EXISTS(
    SELECT 1
    FROM public.role_permissions
    WHERE role = user_role AND permission = perm
  );
END;
$$;

REVOKE ALL ON FUNCTION public.has_permission(UUID, VARCHAR) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_permission(UUID, VARCHAR) TO authenticated;

-- ============================================
-- 3) ENABLE RLS FOR TABLES FLAGGED BY LINTER
-- ============================================

-- system_prompts (public read for active prompts; admin can manage)
ALTER TABLE IF EXISTS public.system_prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active system prompts" ON public.system_prompts;
CREATE POLICY "Public can read active system prompts"
  ON public.system_prompts
  FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage system prompts" ON public.system_prompts;
CREATE POLICY "Admins can manage system prompts"
  ON public.system_prompts
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- role_permissions (safe to read for authenticated; only admins can write)
ALTER TABLE IF EXISTS public.role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read role permissions" ON public.role_permissions;
CREATE POLICY "Authenticated can read role permissions"
  ON public.role_permissions
  FOR SELECT
  TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage role permissions" ON public.role_permissions;
CREATE POLICY "Admins can manage role permissions"
  ON public.role_permissions
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- moderator_actions (only moderator/admin can insert + read; only admin can delete)
ALTER TABLE IF EXISTS public.moderator_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Mods can insert moderator actions" ON public.moderator_actions;
CREATE POLICY "Mods can insert moderator actions"
  ON public.moderator_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'moderator')
    )
  );

DROP POLICY IF EXISTS "Mods can read moderator actions" ON public.moderator_actions;
CREATE POLICY "Mods can read moderator actions"
  ON public.moderator_actions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'moderator')
    )
  );

DROP POLICY IF EXISTS "Admins can delete moderator actions" ON public.moderator_actions;
CREATE POLICY "Admins can delete moderator actions"
  ON public.moderator_actions
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================
-- 4) FIX OVERLY PERMISSIVE RLS POLICIES (WARNINGS)
-- ============================================

-- distributed_locks: was authenticated_manage_locks USING(true)
ALTER TABLE IF EXISTS public.distributed_locks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_manage_locks" ON public.distributed_locks;
DROP POLICY IF EXISTS "admin_manage_locks" ON public.distributed_locks;
CREATE POLICY "admin_manage_locks" ON public.distributed_locks
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- conflict_log: was insert policies WITH CHECK(true)
ALTER TABLE IF EXISTS public.conflict_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "insert_conflict_log" ON public.conflict_log;
DROP POLICY IF EXISTS "service_insert_conflict_log" ON public.conflict_log;
CREATE POLICY "insert_conflict_log" ON public.conflict_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (user_id IS NULL OR user_id = auth.uid())
    AND table_name IS NOT NULL
    AND length(trim(table_name)) > 0
  );

-- features: only admins can insert/update/delete
ALTER TABLE IF EXISTS public.features ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can insert features" ON public.features;
DROP POLICY IF EXISTS "Authenticated users can update features" ON public.features;
DROP POLICY IF EXISTS "Authenticated users can delete features" ON public.features;

CREATE POLICY "Admins can insert features" ON public.features
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update features" ON public.features
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete features" ON public.features
  FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- feedback: public inserts should not be unconditional true
ALTER TABLE IF EXISTS public.feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_feedback" ON public.feedback;
CREATE POLICY "public_insert_feedback" ON public.feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND length(trim(name)) > 0
    AND email IS NOT NULL AND length(trim(email)) > 0
    AND message IS NOT NULL AND length(trim(message)) > 0
  );

-- notifications: scope system inserts to service_role explicitly
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications" ON public.notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- system_logs: scope system inserts to service_role explicitly
ALTER TABLE IF EXISTS public.system_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can insert logs" ON public.system_logs;
CREATE POLICY "Service role can insert logs"
  ON public.system_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================
-- 5) FIX MUTABLE search_path WARNINGS (BEST PRACTICE)
-- Use ALTER FUNCTION where signatures are known.
-- ============================================

DO $$
BEGIN
  -- Common trigger
  BEGIN
    ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
  EXCEPTION WHEN undefined_function THEN NULL;
  END;

  -- Roles / permissions
  BEGIN
    ALTER FUNCTION public.get_user_role(UUID) SET search_path = public, auth;
  EXCEPTION WHEN undefined_function THEN NULL;
  END;

  BEGIN
    ALTER FUNCTION public.has_permission(UUID, VARCHAR) SET search_path = public, auth;
  EXCEPTION WHEN undefined_function THEN NULL;
  END;

  -- AI quota functions
  BEGIN
    ALTER FUNCTION public.check_user_quota(UUID) SET search_path = public, auth;
  EXCEPTION WHEN undefined_function THEN NULL;
  END;

  BEGIN
    ALTER FUNCTION public.increment_usage(UUID, INTEGER) SET search_path = public, auth;
  EXCEPTION WHEN undefined_function THEN NULL;
  END;

  BEGIN
    ALTER FUNCTION public.reset_expired_quotas() SET search_path = public, auth;
  EXCEPTION WHEN undefined_function THEN NULL;
  END;

  BEGIN
    ALTER FUNCTION public.reset_monthly_quotas() SET search_path = public, auth;
  EXCEPTION WHEN undefined_function THEN NULL;
  END;

  BEGIN
    ALTER FUNCTION public.cleanup_temp_data() SET search_path = public, auth;
  EXCEPTION WHEN undefined_function THEN NULL;
  END;

  BEGIN
    ALTER FUNCTION public.cleanup_ai_cache(INT) SET search_path = public, auth;
  EXCEPTION WHEN undefined_function THEN NULL;
  END;

  -- Notifications functions
  BEGIN
    ALTER FUNCTION public.create_notification_preferences() SET search_path = public, auth;
  EXCEPTION WHEN undefined_function THEN NULL;
  END;

  BEGIN
    ALTER FUNCTION public.delete_old_notifications() SET search_path = public, auth;
  EXCEPTION WHEN undefined_function THEN NULL;
  END;

  BEGIN
    ALTER FUNCTION public.get_unread_count(UUID) SET search_path = public, auth;
  EXCEPTION WHEN undefined_function THEN NULL;
  END;

  -- Media library trigger
  BEGIN
    ALTER FUNCTION public.update_media_library_updated_at() SET search_path = public;
  EXCEPTION WHEN undefined_function THEN NULL;
  END;

  -- Features trigger
  BEGIN
    ALTER FUNCTION public.update_features_updated_at() SET search_path = public;
  EXCEPTION WHEN undefined_function THEN NULL;
  END;

  -- Logging helpers
  BEGIN
    ALTER FUNCTION public.log_error(TEXT, JSONB) SET search_path = public, auth;
  EXCEPTION WHEN undefined_function THEN NULL;
  END;

  BEGIN
    ALTER FUNCTION public.log_info(TEXT, JSONB) SET search_path = public, auth;
  EXCEPTION WHEN undefined_function THEN NULL;
  END;
END $$;

-- Done
DO $$ BEGIN
  RAISE NOTICE 'Migration 031: Security linter fixes applied.';
END $$;
