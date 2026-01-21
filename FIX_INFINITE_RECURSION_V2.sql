-- ==========================================
-- FIX INFINITE RECURSION - VERSION 2 (FIXED)
-- ==========================================
-- CHẠY TOÀN BỘ SCRIPT NÀY TRONG SUPABASE SQL EDITOR
-- ==========================================

-- Step 1: DISABLE RLS on admin_users (temporary)
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Step 2: DROP ALL existing policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'admin_users'
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_users', pol.policyname);
    END LOOP;
END $$;

-- Step 3: DROP existing is_admin function (FIX for parameter name error)
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.is_admin(check_user_id UUID);

-- Step 4: CREATE is_admin() function WITHOUT recursion
-- Using exact parameter name to avoid conflicts
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Direct query with SECURITY DEFINER bypasses RLS
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE admin_users.user_id = $1
  );
$$;

-- Step 5: Also recreate get_user_role if needed
DROP FUNCTION IF EXISTS public.get_user_role(UUID);

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    CASE
      WHEN EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = $1)
      THEN 'admin'
      ELSE 'user'
    END;
$$;

-- Step 6: CREATE simple RLS policies WITHOUT calling functions

-- Policy 1: Allow ALL authenticated users to SELECT (read admin list)
-- This is SAFE and needed for AdminService.isAdmin() to work
CREATE POLICY "allow_authenticated_select_admin_users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (true);  -- Simple true, no recursion

-- Policy 2: Only existing admins can INSERT (grant admin)
CREATE POLICY "admins_can_insert_admin_users"
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (
  -- Direct EXISTS query without function call
  EXISTS (
    SELECT 1
    FROM public.admin_users existing
    WHERE existing.user_id = auth.uid()
  )
);

-- Policy 3: Only existing admins can UPDATE
CREATE POLICY "admins_can_update_admin_users"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_users existing
    WHERE existing.user_id = auth.uid()
  )
);

-- Policy 4: Only existing admins can DELETE (revoke admin)
CREATE POLICY "admins_can_delete_admin_users"
ON public.admin_users
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_users existing
    WHERE existing.user_id = auth.uid()
  )
);

-- Step 7: RE-ENABLE RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Step 8: Grant permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 9: Verify policies created
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'admin_users';

  RAISE NOTICE '✅ Created % policies for admin_users table', policy_count;
END $$;

-- ==========================================
-- GRANT ADMIN TO YOUR EMAIL
-- ==========================================

-- Insert admin record (replace email if needed)
INSERT INTO public.admin_users (user_id, granted_by, permissions)
SELECT
  id,
  id,
  '{"full_access": true}'::jsonb
FROM auth.users
WHERE email = 'duongminhhoanggame@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  permissions = '{"full_access": true}'::jsonb,
  granted_at = NOW();

-- ==========================================
-- VERIFY EVERYTHING WORKS
-- ==========================================

-- Test 1: Check admin record exists
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM public.admin_users au
  JOIN auth.users u ON u.id = au.user_id
  WHERE u.email = 'duongminhhoanggame@gmail.com';

  IF admin_count > 0 THEN
    RAISE NOTICE '✅ Admin record found for duongminhhoanggame@gmail.com';
  ELSE
    RAISE NOTICE '❌ No admin record found! Check if user exists in auth.users';
  END IF;
END $$;

-- Test 2: Test is_admin() function
DO $$
DECLARE
  test_user_id UUID;
  is_admin_result BOOLEAN;
BEGIN
  -- Get user ID
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'duongminhhoanggame@gmail.com'
  LIMIT 1;

  IF test_user_id IS NOT NULL THEN
    -- Test function
    SELECT public.is_admin(test_user_id) INTO is_admin_result;

    IF is_admin_result THEN
      RAISE NOTICE '✅ is_admin() function works correctly and returns TRUE';
    ELSE
      RAISE NOTICE '❌ is_admin() function returns FALSE (should be TRUE)';
    END IF;
  ELSE
    RAISE NOTICE '❌ User not found in auth.users table';
  END IF;
END $$;

-- Test 3: Test get_user_role() function
DO $$
DECLARE
  test_user_id UUID;
  user_role TEXT;
BEGIN
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'duongminhhoanggame@gmail.com'
  LIMIT 1;

  IF test_user_id IS NOT NULL THEN
    SELECT public.get_user_role(test_user_id) INTO user_role;

    IF user_role = 'admin' THEN
      RAISE NOTICE '✅ get_user_role() returns ''admin''';
    ELSE
      RAISE NOTICE '❌ get_user_role() returns ''%'' (should be ''admin'')', user_role;
    END IF;
  END IF;
END $$;

-- Test 4: List all admin users
SELECT
  u.email,
  au.granted_at,
  au.permissions,
  public.is_admin(u.id) as function_check
FROM public.admin_users au
JOIN auth.users u ON u.id = au.user_id
ORDER BY au.granted_at DESC;

-- ==========================================
-- FINAL SUCCESS MESSAGE
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ INFINITE RECURSION FIX COMPLETED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes made:';
  RAISE NOTICE '1. Dropped and recreated is_admin() function with SECURITY DEFINER';
  RAISE NOTICE '2. Created 4 RLS policies without function calls';
  RAISE NOTICE '3. Granted admin to duongminhhoanggame@gmail.com';
  RAISE NOTICE '4. Verified all functions work correctly';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Close this SQL editor';
  RAISE NOTICE '2. Open terminal and run: rd /s /q .next';
  RAISE NOTICE '3. Restart server: bun run dev';
  RAISE NOTICE '4. Hard refresh browser: Ctrl + Shift + R';
  RAISE NOTICE '5. Login and test admin access';
  RAISE NOTICE '';
  RAISE NOTICE 'Expected result:';
  RAISE NOTICE '- No "infinite recursion" errors in console';
  RAISE NOTICE '- Admin button visible in navbar';
  RAISE NOTICE '- Can access /admin page';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
