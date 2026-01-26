-- =============================================
-- QUICK DEBUG: Check user_requests data
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Count total requests
SELECT COUNT(*) as total_requests FROM user_requests;

-- 2. List all requests with user info
SELECT 
  ur.id,
  ur.user_id,
  ur.type,
  ur.status,
  ur.description,
  ur.created_at,
  au.email as user_email
FROM user_requests ur
LEFT JOIN auth.users au ON ur.user_id = au.id
ORDER BY ur.created_at DESC
LIMIT 20;

-- 3. Check if table exists and its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_requests'
ORDER BY ordinal_position;

-- 4. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_requests';

-- 5. Check if RLS is enabled
SELECT 
  relname,
  relrowsecurity,
  relforcerowsecurity
FROM pg_class
WHERE relname = 'user_requests';

-- 6. Test insert (as service role - should work)
-- Uncomment to test:
-- INSERT INTO user_requests (user_id, type, description, original_images)
-- VALUES (
--   (SELECT id FROM auth.users LIMIT 1),
--   'restore',
--   'Test request from SQL',
--   ARRAY['https://example.com/test.jpg']
-- )
-- RETURNING *;
