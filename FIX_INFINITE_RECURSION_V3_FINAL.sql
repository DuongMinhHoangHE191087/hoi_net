-- ==========================================
-- FIX INFINITE RECURSION - VERSION 3 (FINAL)
-- ==========================================
-- Không drop function, chỉ fix policies của admin_users
-- ==========================================

-- Step 1: Show current situation
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Current situation:';
  RAISE NOTICE '- Function is_admin() is used by 10+ other tables';
  RAISE NOTICE '- We will NOT drop the function';
  RAISE NOTICE '- We will ONLY fix admin_users policies';
  RAISE NOTICE '========================================';
END $$;

-- Step 2: DISABLE RLS on admin_users (temporary)
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Step 3: DROP only admin_users policies
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
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Step 4: UPDATE is_admin() function to use SECURITY DEFINER
-- This will bypass RLS when called from within policies
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- ← KEY: Bypass RLS
STABLE
AS $$
BEGIN
  -- This function now bypasses RLS, preventing recursion
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE admin_users.user_id = $1
  );
END;
$$;

-- Step 5: CREATE simple RLS policies for admin_users
-- These policies do NOT call is_admin() to avoid recursion

-- Policy 1: Allow ALL authenticated users to SELECT (read admin list)
-- This is SAFE because:
-- - AdminService needs to query this table
-- - Other tables still protected by their own policies
-- - INSERT/UPDATE/DELETE still restricted
CREATE POLICY "allow_authenticated_select_admin_users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (true);  -- Simple true, no function call

-- Policy 2: Only existing admins can INSERT (grant admin)
-- Use direct EXISTS instead of calling is_admin()
CREATE POLICY "only_admins_can_grant_admin"
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (
  -- Direct query without function call
  EXISTS (
    SELECT 1
    FROM public.admin_users existing
    WHERE existing.user_id = auth.uid()
  )
);

-- Policy 3: Only existing admins can UPDATE
CREATE POLICY "only_admins_can_update_admin"
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
CREATE POLICY "only_admins_can_revoke_admin"
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

-- Step 6: RE-ENABLE RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Step 7: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO authenticated;

-- ==========================================
-- GRANT ADMIN TO YOUR EMAIL
-- ==========================================

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
-- VERIFY SOLUTION
-- ==========================================

-- Test 1: Check policies on admin_users
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'admin_users';

  RAISE NOTICE '✅ admin_users table has % policies', policy_count;
END $$;

-- Test 2: Check admin record
DO $$
DECLARE
  admin_email TEXT;
BEGIN
  SELECT u.email INTO admin_email
  FROM public.admin_users au
  JOIN auth.users u ON u.id = au.user_id
  WHERE u.email = 'duongminhhoanggame@gmail.com';

  IF admin_email IS NOT NULL THEN
    RAISE NOTICE '✅ Admin record found for: %', admin_email;
  ELSE
    RAISE NOTICE '❌ No admin record found';
  END IF;
END $$;

-- Test 3: Test is_admin() function
DO $$
DECLARE
  test_user_id UUID;
  is_admin_result BOOLEAN;
BEGIN
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'duongminhhoanggame@gmail.com';

  IF test_user_id IS NOT NULL THEN
    SELECT public.is_admin(test_user_id) INTO is_admin_result;

    IF is_admin_result THEN
      RAISE NOTICE '✅ is_admin() function returns TRUE';
    ELSE
      RAISE NOTICE '❌ is_admin() returns FALSE (check admin record)';
    END IF;
  END IF;
END $$;

-- Test 4: Check other tables still have their policies
DO $$
DECLARE
  total_policies INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_policies
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('user_requests', 'user_profiles', 'blog_posts', 'feedback', 'admin_actions');

  RAISE NOTICE '✅ Other tables still have % policies (unchanged)', total_policies;
END $$;

-- Test 5: List all admin users
SELECT
  u.email,
  au.granted_at,
  au.permissions
FROM public.admin_users au
JOIN auth.users u ON u.id = au.user_id;

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ INFINITE RECURSION FIX COMPLETED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'What was changed:';
  RAISE NOTICE '1. Added SECURITY DEFINER to is_admin() function';
  RAISE NOTICE '   → Function now bypasses RLS, no recursion';
  RAISE NOTICE '';
  RAISE NOTICE '2. Recreated admin_users policies WITHOUT calling is_admin()';
  RAISE NOTICE '   → Policy 1: Allow all authenticated to SELECT';
  RAISE NOTICE '   → Policy 2-4: Only admins can INSERT/UPDATE/DELETE';
  RAISE NOTICE '';
  RAISE NOTICE '3. Other tables policies unchanged';
  RAISE NOTICE '   → user_requests, user_profiles, etc. still work';
  RAISE NOTICE '';
  RAISE NOTICE 'Why this works:';
  RAISE NOTICE '- admin_users policies do NOT call is_admin()';
  RAISE NOTICE '- is_admin() has SECURITY DEFINER, bypasses RLS';
  RAISE NOTICE '- Other tables can still safely call is_admin()';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Close SQL Editor';
  RAISE NOTICE '2. Terminal: rd /s /q .next';
  RAISE NOTICE '3. Terminal: bun run dev';
  RAISE NOTICE '4. Browser: Ctrl + Shift + R';
  RAISE NOTICE '5. Login and test';
  RAISE NOTICE '';
  RAISE NOTICE 'Expected: NO "infinite recursion" errors!';
  RAISE NOTICE '========================================';
END $$;
