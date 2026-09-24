-- =====================================================
-- COMPREHENSIVE ROLE SYSTEM FIX
-- Run ALL these commands in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Check current constraint
-- =====================================================
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as current_definition
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass 
AND contype = 'c';

-- =====================================================
-- STEP 2: Check current roles in table
-- =====================================================
SELECT DISTINCT role, COUNT(*) as count 
FROM user_profiles 
GROUP BY role
ORDER BY count DESC;

-- =====================================================
-- STEP 3: Drop ALL role-related constraints
-- =====================================================
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  FOR constraint_name IN 
    SELECT conname FROM pg_constraint 
    WHERE conrelid = 'user_profiles'::regclass 
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%role%'
  LOOP
    EXECUTE format('ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS %I', constraint_name);
    RAISE NOTICE 'Dropped constraint: %', constraint_name;
  END LOOP;
END $$;

-- =====================================================
-- STEP 4: Create new constraint with correct roles
-- Allowed roles: user, admin, moderator, editor
-- =====================================================
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('user', 'admin', 'moderator', 'editor'));

-- =====================================================
-- STEP 5: Set default role for column
-- =====================================================
ALTER TABLE user_profiles 
ALTER COLUMN role SET DEFAULT 'user';

-- =====================================================
-- STEP 6: Update any NULL or invalid roles to 'user'
-- =====================================================
UPDATE user_profiles 
SET role = 'user' 
WHERE role IS NULL 
   OR role NOT IN ('user', 'admin', 'moderator', 'editor');

-- =====================================================
-- STEP 7: Verify constraint is now correct
-- =====================================================
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as new_definition
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass 
AND contype = 'c';

-- =====================================================
-- STEP 8: Verify all roles are valid
-- =====================================================
SELECT DISTINCT role, COUNT(*) as count 
FROM user_profiles 
GROUP BY role
ORDER BY count DESC;

-- =====================================================
-- STEP 9: Create index on role for faster queries
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- =====================================================
-- STEP 10: Grant permissions
-- =====================================================
GRANT SELECT, UPDATE ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;

-- =====================================================
-- STEP 11: Create RLS policy for role updates (if needed)
-- =====================================================
-- Allow service_role to update roles (for admin API)
DROP POLICY IF EXISTS "Service role can update profiles" ON user_profiles;
CREATE POLICY "Service role can update profiles"
ON user_profiles FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- DONE! Role system should now work correctly.
-- =====================================================

-- Test query: Try to manually update a role
-- UPDATE user_profiles SET role = 'editor' WHERE id = 'YOUR_USER_ID';
