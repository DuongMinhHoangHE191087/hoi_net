-- ==========================================
-- ADMIN DEBUG & FIX SCRIPT
-- Chạy script này để debug và fix admin issue
-- ==========================================

-- STEP 1: Check user exists
SELECT
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'duongminhhoanggame@gmail.com';
-- Copy user ID từ kết quả này

-- STEP 2: Check admin_users table
SELECT * FROM public.admin_users
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'duongminhhoanggame@gmail.com');
-- Nếu empty → Chưa grant admin

-- STEP 3: Grant admin (chạy nếu STEP 2 empty)
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

-- STEP 4: Verify admin function works
SELECT
  email,
  public.is_admin(id) as is_admin_result,
  public.get_user_role(id) as user_role
FROM auth.users
WHERE email = 'duongminhhoanggame@gmail.com';
-- is_admin_result phải = true

-- STEP 5: Check all admin users
SELECT
  u.email,
  au.granted_at,
  au.permissions,
  public.is_admin(u.id) as is_admin_check
FROM public.admin_users au
JOIN auth.users u ON au.user_id = u.id;

-- STEP 6: If still not working, rebuild is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log for debugging
  RAISE NOTICE 'Checking admin for user: %', check_user_id;

  -- Check admin_users table
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = check_user_id
  );
END;
$$;

-- STEP 7: Clear any caches (restart app after running this)
-- No SQL needed, just restart: rm -rf .next && bun run dev
