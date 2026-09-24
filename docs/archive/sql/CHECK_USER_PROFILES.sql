-- ==========================================
-- CHECK USER PROFILE & OAUTH FLOW
-- ==========================================

-- Step 1: Check if new Google user exists
SELECT
  id,
  email,
  created_at,
  raw_user_meta_data,
  email_confirmed_at
FROM auth.users
WHERE id = 'e9fd86f0-4aa8-43b8-bc84-981f137df6d8';
-- Expected: 1 row with Google user data

-- Step 2: Check if user_profiles record was created
SELECT
  id,
  full_name,
  avatar_url,
  created_at
FROM public.user_profiles
WHERE id = 'e9fd86f0-4aa8-43b8-bc84-981f137df6d8';
-- Expected: 1 row with profile data
-- If EMPTY → Trigger not working!

-- Step 3: Check if users table record was created
SELECT
  id,
  email,
  name,
  created_at
FROM public.users
WHERE id = 'e9fd86f0-4aa8-43b8-bc84-981f137df6d8';
-- Expected: 1 row
-- If EMPTY → Trigger not working!

-- Step 4: Check all users (for admin panel)
SELECT
  u.id,
  u.email,
  u.name,
  up.full_name,
  up.avatar_url,
  u.created_at
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
ORDER BY u.created_at DESC
LIMIT 10;
-- Expected: Should see all users including new Google user

-- Step 5: Check trigger exists and is enabled
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name LIKE '%auth_user%'
  AND event_object_schema = 'auth'
ORDER BY trigger_name;
-- Expected: Trigger on_auth_user_created_complete exists

-- Step 6: Check trigger function
SELECT
  proname as function_name,
  prosrc as function_source
FROM pg_proc
WHERE proname LIKE '%handle_new_user%';
-- Expected: Function handle_new_user_complete exists

-- Step 7: Test trigger function manually for the new user
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get the new user
  SELECT * INTO user_record
  FROM auth.users
  WHERE id = 'e9fd86f0-4aa8-43b8-bc84-981f137df6d8';

  IF user_record.id IS NOT NULL THEN
    RAISE NOTICE 'User found: %', user_record.email;

    -- Check if profile exists
    IF EXISTS (SELECT 1 FROM public.user_profiles WHERE id = user_record.id) THEN
      RAISE NOTICE '✅ user_profiles record exists';
    ELSE
      RAISE NOTICE '❌ user_profiles record MISSING - Trigger did not run!';
      RAISE NOTICE 'Attempting to create manually...';

      -- Create profile manually
      INSERT INTO public.user_profiles (
        id,
        full_name,
        avatar_url,
        created_at,
        updated_at
      )
      VALUES (
        user_record.id,
        COALESCE(
          user_record.raw_user_meta_data->>'full_name',
          user_record.raw_user_meta_data->>'name',
          user_record.email
        ),
        user_record.raw_user_meta_data->>'avatar_url',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO NOTHING;

      RAISE NOTICE '✅ user_profiles created manually';
    END IF;

    -- Check if users record exists
    IF EXISTS (SELECT 1 FROM public.users WHERE id = user_record.id) THEN
      RAISE NOTICE '✅ users record exists';
    ELSE
      RAISE NOTICE '❌ users record MISSING - Trigger did not run!';
      RAISE NOTICE 'Attempting to create manually...';

      -- Create users record manually
      INSERT INTO public.users (
        id,
        email,
        name,
        created_at,
        updated_at
      )
      VALUES (
        user_record.id,
        user_record.email,
        COALESCE(
          user_record.raw_user_meta_data->>'full_name',
          user_record.raw_user_meta_data->>'name',
          user_record.email
        ),
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO NOTHING;

      RAISE NOTICE '✅ users record created manually';
    END IF;
  ELSE
    RAISE NOTICE '❌ User not found with ID: e9fd86f0-4aa8-43b8-bc84-981f137df6d8';
  END IF;
END $$;

-- Step 8: Verify all Google users have profiles
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'provider' as provider,
  CASE
    WHEN u.id IS NULL THEN '❌ Missing'
    ELSE '✅ Exists'
  END as users_table,
  CASE
    WHEN up.id IS NULL THEN '❌ Missing'
    ELSE '✅ Exists'
  END as profiles_table
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.raw_user_meta_data->>'provider' = 'google'
ORDER BY au.created_at DESC;

-- Step 9: Check Storage buckets
SELECT
  name,
  public,
  created_at
FROM storage.buckets
ORDER BY created_at DESC;
-- Expected: Bucket 'avatars' or 'user-avatars' exists

-- ==========================================
-- FIX SUMMARY
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DIAGNOSTIC COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Check the results above:';
  RAISE NOTICE '';
  RAISE NOTICE '1. If user_profiles is MISSING:';
  RAISE NOTICE '   → Trigger not working or not running';
  RAISE NOTICE '   → Run FIX_USER_PROFILES.sql';
  RAISE NOTICE '';
  RAISE NOTICE '2. If Storage bucket not found:';
  RAISE NOTICE '   → Create bucket in Supabase Dashboard';
  RAISE NOTICE '   → Or run CREATE_STORAGE_BUCKET.sql';
  RAISE NOTICE '';
  RAISE NOTICE '3. If users table is MISSING:';
  RAISE NOTICE '   → Trigger not working';
  RAISE NOTICE '   → Manual insert done above';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
