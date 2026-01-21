-- ==========================================
-- MIGRATION 016B: ADMIN USERS - SAFE VERSION
-- Version này an toàn, không drop function
-- ==========================================

-- ==========================================
-- STEP 1: Check existing is_admin function signature
-- ==========================================

-- Run this first to see current function:
-- SELECT pg_get_functiondef('public.is_admin'::regproc);

-- ==========================================
-- STEP 2: Create admin_users table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin list" ON public.admin_users;
CREATE POLICY "Admins can view admin list"
  ON public.admin_users FOR SELECT
  USING (
    user_id = auth.uid() OR
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

DROP POLICY IF EXISTS "Only admins can grant admin" ON public.admin_users;
CREATE POLICY "Only admins can grant admin"
  ON public.admin_users FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

-- ==========================================
-- STEP 3: Create index
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);

-- ==========================================
-- STEP 4: Update is_admin function (WITHOUT dropping it)
-- ==========================================

-- This will update the function body while keeping the same signature
-- So all existing RLS policies that depend on it will continue to work

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin_users table first
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = $1) THEN
    RETURN true;
  END IF;

  -- Fallback: return false
  -- (In middleware, we'll also check env variable as additional layer)
  RETURN false;
END;
$$;

-- ==========================================
-- STEP 5: Update or create get_user_role function
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = $1) THEN
    RETURN 'admin';
  ELSE
    RETURN 'user';
  END IF;
END;
$$;

-- ==========================================
-- STEP 6: IMPORTANT - Grant first admin
-- ==========================================

-- YOU MUST RUN THIS SEPARATELY after migration completes:
-- Replace 'your-email@gmail.com' with your actual admin email

/*
INSERT INTO public.admin_users (user_id, granted_by)
SELECT id, id FROM auth.users WHERE email = 'your-email@gmail.com'
ON CONFLICT DO NOTHING;
*/

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- 1. Check admin_users table exists and is empty
-- SELECT * FROM public.admin_users;

-- 2. Check functions exist
-- SELECT routine_name
-- FROM information_schema.routines
-- WHERE routine_name IN ('is_admin', 'get_user_role');

-- 3. After granting admin, verify it works:
-- SELECT public.is_admin((SELECT id FROM auth.users WHERE email = 'your-email@gmail.com'));
-- Should return true

-- 4. Check all policies still work:
-- SELECT schemaname, tablename, policyname
-- FROM pg_policies
-- WHERE policyname LIKE '%admin%'
-- ORDER BY tablename;
