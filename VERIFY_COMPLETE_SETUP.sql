-- ==========================================
-- VERIFY COMPLETE ADMIN & USER SETUP
-- ==========================================
-- Run this to check everything is working
-- ==========================================

-- Step 1: Check all users across all tables
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Step 1: Checking all users';
  RAISE NOTICE '========================================';
END $$;

SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'provider' as provider,
  CASE WHEN u.id IS NOT NULL THEN '✅' ELSE '❌' END as has_users_record,
  CASE WHEN up.id IS NOT NULL THEN '✅' ELSE '❌' END as has_profile_record,
  CASE WHEN admin.user_id IS NOT NULL THEN '✅ ADMIN' ELSE '' END as is_admin,
  au.created_at
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
LEFT JOIN public.user_profiles up ON au.id = up.id
LEFT JOIN public.admin_users admin ON au.id = admin.user_id
ORDER BY au.created_at DESC;

-- Step 2: Check specific Google OAuth user
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Step 2: Google OAuth User Details';
  RAISE NOTICE '========================================';
END $$;

SELECT
  'auth.users' as table_name,
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'avatar_url' as avatar_url,
  created_at
FROM auth.users
WHERE id = 'e9fd86f0-4aa8-43b8-bc84-981f137df6d8'

UNION ALL

SELECT
  'public.users' as table_name,
  id,
  email,
  name as full_name,
  NULL as avatar_url,
  created_at
FROM public.users
WHERE id = 'e9fd86f0-4aa8-43b8-bc84-981f137df6d8'

UNION ALL

SELECT
  'public.user_profiles' as table_name,
  id,
  NULL as email,
  full_name,
  avatar_url,
  created_at
FROM public.user_profiles
WHERE id = 'e9fd86f0-4aa8-43b8-bc84-981f137df6d8';

-- Step 3: Check admin_users table and policies
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Step 3: Admin Users & Policies';
  RAISE NOTICE '========================================';
END $$;

-- List all admins
SELECT
  u.email,
  au.granted_at,
  au.granted_by,
  au.permissions
FROM public.admin_users au
JOIN auth.users u ON u.id = au.user_id
ORDER BY au.granted_at DESC;

-- Check admin_users RLS policies
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'admin_users'
ORDER BY policyname;

-- Step 4: Check is_admin() function
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Step 4: is_admin() Function Check';
  RAISE NOTICE '========================================';
END $$;

SELECT
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  CASE
    WHEN p.prosecdef THEN '✅ SECURITY DEFINER'
    ELSE '❌ NOT SECURITY DEFINER'
  END as security_mode,
  p.provolatile::text as volatility
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'is_admin';

-- Step 5: Test is_admin() function
DO $$
DECLARE
  admin_email TEXT := 'duongminhhoanggame@gmail.com';
  google_email TEXT := 'cutevui403@gmail.com';
  admin_user_id UUID;
  google_user_id UUID;
  admin_result BOOLEAN;
  google_result BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Step 5: Testing is_admin() Function';
  RAISE NOTICE '========================================';

  -- Get admin user ID
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = admin_email;

  IF admin_user_id IS NOT NULL THEN
    SELECT public.is_admin(admin_user_id) INTO admin_result;
    RAISE NOTICE 'Admin user (%): is_admin() = %', admin_email, admin_result;
  ELSE
    RAISE NOTICE 'Admin user (%) not found', admin_email;
  END IF;

  -- Get Google OAuth user ID
  SELECT id INTO google_user_id
  FROM auth.users
  WHERE email = google_email;

  IF google_user_id IS NOT NULL THEN
    SELECT public.is_admin(google_user_id) INTO google_result;
    RAISE NOTICE 'Google user (%): is_admin() = %', google_email, google_result;
  ELSE
    RAISE NOTICE 'Google user (%) not found', google_email;
  END IF;
END $$;

-- Step 6: Check Storage buckets
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Step 6: Storage Buckets';
  RAISE NOTICE '========================================';
END $$;

SELECT
  id,
  name,
  CASE WHEN public THEN '✅ Public' ELSE '❌ Private' END as access,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
ORDER BY created_at DESC;

-- Check storage policies
SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%avatar%'
ORDER BY policyname;

-- Step 7: Check trigger exists
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Step 7: User Creation Trigger';
  RAISE NOTICE '========================================';
END $$;

SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  CASE
    WHEN tgenabled = 'O' THEN '✅ Enabled'
    WHEN tgenabled = 'D' THEN '❌ Disabled'
    ELSE tgenabled::text
  END as status
FROM information_schema.triggers
JOIN pg_trigger ON trigger_name = tgname
WHERE trigger_name LIKE '%auth_user%'
  AND event_object_schema = 'auth'
ORDER BY trigger_name;

-- Step 8: Summary Report
DO $$
DECLARE
  total_users INTEGER;
  users_with_profiles INTEGER;
  users_missing_profiles INTEGER;
  total_admins INTEGER;
  has_storage_bucket BOOLEAN;
  has_trigger BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SUMMARY REPORT';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- Count users
  SELECT COUNT(*) INTO total_users FROM auth.users;
  RAISE NOTICE 'Total users: %', total_users;

  SELECT COUNT(*) INTO users_with_profiles
  FROM auth.users au
  JOIN public.user_profiles up ON au.id = up.id;
  RAISE NOTICE 'Users with profiles: %', users_with_profiles;

  users_missing_profiles := total_users - users_with_profiles;
  RAISE NOTICE 'Users missing profiles: %', users_missing_profiles;

  -- Count admins
  SELECT COUNT(*) INTO total_admins FROM public.admin_users;
  RAISE NOTICE 'Total admins: %', total_admins;

  -- Check storage
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'avatars'
  ) INTO has_storage_bucket;

  IF has_storage_bucket THEN
    RAISE NOTICE 'Storage bucket: ✅ EXISTS';
  ELSE
    RAISE NOTICE 'Storage bucket: ❌ MISSING - Run CREATE_STORAGE_BUCKET.sql';
  END IF;

  -- Check trigger
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.triggers
    WHERE trigger_name = 'on_auth_user_created_complete'
  ) INTO has_trigger;

  IF has_trigger THEN
    RAISE NOTICE 'User creation trigger: ✅ EXISTS';
  ELSE
    RAISE NOTICE 'User creation trigger: ❌ MISSING - Check migrations';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  IF users_missing_profiles > 0 THEN
    RAISE NOTICE '⚠️  ACTION REQUIRED:';
    RAISE NOTICE '- % users missing profiles', users_missing_profiles;
    RAISE NOTICE '- Run CHECK_USER_PROFILES.sql to create them';
  END IF;

  IF NOT has_storage_bucket THEN
    RAISE NOTICE '⚠️  ACTION REQUIRED:';
    RAISE NOTICE '- Storage bucket missing';
    RAISE NOTICE '- Run CREATE_STORAGE_BUCKET.sql';
  END IF;

  IF users_missing_profiles = 0 AND has_storage_bucket THEN
    RAISE NOTICE '✅ ALL CHECKS PASSED!';
  END IF;
  RAISE NOTICE '========================================';
END $$;
