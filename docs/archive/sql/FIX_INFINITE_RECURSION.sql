-- ==========================================
-- FIX INFINITE RECURSION - ADMIN_USERS RLS
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

-- Step 3: RECREATE is_admin() function WITHOUT recursion
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Direct query, no RLS triggered
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = check_user_id
  );
$$;

-- Step 4: CREATE simple RLS policies WITHOUT calling is_admin()

-- Policy 1: Allow ALL authenticated users to SELECT (read admin list)
-- This is needed for AdminService.isAdmin() to work
CREATE POLICY "allow_authenticated_select_admin_users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (true);  -- No recursion, simple true

-- Policy 2: Only existing admins can INSERT (grant admin)
CREATE POLICY "admins_can_insert_admin_users"
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (
  -- Direct EXISTS query, no function call
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

-- Step 5: RE-ENABLE RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Step 6: Grant permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO authenticated;

-- Step 7: Verify no recursion
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'admin_users'
ORDER BY policyname;

-- Expected: 4 policies (SELECT, INSERT, UPDATE, DELETE)

-- ==========================================
-- GRANT ADMIN TO YOUR EMAIL
-- ==========================================

-- Replace with your email
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
-- VERIFY IT WORKS
-- ==========================================

-- Test 1: Check admin granted
SELECT
  u.id,
  u.email,
  au.granted_at,
  au.permissions
FROM auth.users u
JOIN public.admin_users au ON au.user_id = u.id
WHERE u.email = 'duongminhhoanggame@gmail.com';

-- Expected: 1 row with your email

-- Test 2: Test is_admin() function
SELECT
  email,
  public.is_admin(id) as is_admin_result
FROM auth.users
WHERE email = 'duongminhhoanggame@gmail.com';

-- Expected: is_admin_result = true

-- Test 3: Direct query (should work without recursion)
SELECT
  user_id,
  granted_at,
  permissions
FROM public.admin_users
LIMIT 5;

-- Expected: Your admin record appears

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '✅ INFINITE RECURSION FIX COMPLETED!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Restart your dev server: rd /s /q .next && bun run dev';
  RAISE NOTICE '2. Hard refresh browser: Ctrl + Shift + R';
  RAISE NOTICE '3. Login and test admin access';
  RAISE NOTICE '';
  RAISE NOTICE 'If error persists, check console for new errors.';
END $$;
