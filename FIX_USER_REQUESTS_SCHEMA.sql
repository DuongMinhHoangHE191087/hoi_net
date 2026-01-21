-- ==========================================
-- CHECK USER_REQUESTS SCHEMA & FIX
-- ==========================================

-- Step 1: Check current schema of user_requests
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_requests'
ORDER BY ordinal_position;

-- Step 2: Check foreign key constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'user_requests'
  AND tc.constraint_type = 'FOREIGN KEY';

-- Step 3: If foreign key doesn't exist, create it
-- (Only run if Step 2 shows no foreign key to user_profiles)

-- Check if user_id column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'user_requests'
      AND column_name = 'user_id'
  ) THEN
    -- Add foreign key constraint if not exists
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints
      WHERE table_name = 'user_requests'
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%user_id%'
    ) THEN
      ALTER TABLE public.user_requests
      ADD CONSTRAINT user_requests_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.user_profiles(id)
      ON DELETE CASCADE;

      RAISE NOTICE 'Foreign key constraint added successfully';
    ELSE
      RAISE NOTICE 'Foreign key already exists';
    END IF;
  ELSE
    RAISE NOTICE 'ERROR: user_id column does not exist in user_requests table!';
    RAISE NOTICE 'Please check your schema and add user_id column first.';
  END IF;
END $$;

-- Step 4: Verify relationship works
-- Test query (should work after FK is added)
SELECT
  ur.*,
  up.full_name,
  up.phone
FROM public.user_requests ur
LEFT JOIN public.user_profiles up ON ur.user_id = up.id
LIMIT 5;

-- If this works, the relationship is correct

-- ==========================================
-- ALTERNATIVE: Check what columns exist
-- ==========================================

-- List all columns in user_requests
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_requests'
ORDER BY ordinal_position;

-- Expected columns should include:
-- - id
-- - user_id (or similar)
-- - status
-- - created_at
-- etc.
