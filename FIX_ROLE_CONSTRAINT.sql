-- =====================================================
-- FIX USER PROFILES ROLE CHECK CONSTRAINT
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Drop the existing constraint
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Step 2: Add new constraint with all allowed roles
-- Roles used in AdminUsers: user, editor, moderator, admin
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('user', 'admin', 'moderator', 'editor'));

-- Step 3: Verify the constraint
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass 
AND contype = 'c';

-- Step 4: Check current roles in the table
SELECT DISTINCT role, COUNT(*) as count 
FROM user_profiles 
GROUP BY role;
