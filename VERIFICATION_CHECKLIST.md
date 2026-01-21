# ✅ SETUP VERIFICATION CHECKLIST

## Quick Verification - Copy & Paste These Commands

Run these SQL commands in Supabase SQL Editor to verify your setup is complete and correct.

---

## 1️⃣ Database Tables Verification

### Check All Tables Exist

```sql
SELECT
  tablename,
  schemaname
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected Result:**
```
tablename       | schemaname
----------------|------------
blog_posts      | public
user_profiles   | public
user_requests   | public
```

✅ **PASS:** All 3 tables exist
❌ **FAIL:** Missing tables → Re-run `COMPLETE_DATABASE_MIGRATION.sql`

---

### Check Table Columns

**User Profiles:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

**Expected Columns:**
- id (uuid, NO)
- full_name (text, YES)
- phone (text, YES)
- address (text, YES)
- facebook_url (text, YES)
- avatar_url (text, YES)
- created_at (timestamp with time zone, YES)
- updated_at (timestamp with time zone, YES)

**User Requests:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_requests'
ORDER BY ordinal_position;
```

**Expected Columns:**
- id (uuid, NO)
- user_id (uuid, NO)
- type (USER-DEFINED, NO)
- description (text, NO)
- status (USER-DEFINED, YES)
- original_images (ARRAY, NO)
- restored_images (ARRAY, YES)
- admin_notes (text, YES)
- admin_id (uuid, YES)
- created_at (timestamp with time zone, YES)
- updated_at (timestamp with time zone, YES)
- completed_at (timestamp with time zone, YES)

**Blog Posts:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'blog_posts'
ORDER BY ordinal_position;
```

**Expected Columns:**
- id (uuid, NO)
- author_id (uuid, NO)
- title (text, NO)
- slug (text, NO)
- excerpt (text, NO)
- content (text, NO)
- author_name (text, NO)
- featured_image (text, YES)
- published (boolean, YES)
- meta_title (text, YES)
- meta_description (text, YES)
- views (integer, YES)
- created_at (timestamp with time zone, YES)
- updated_at (timestamp with time zone, YES)
- published_at (timestamp with time zone, YES)

---

## 2️⃣ Row Level Security (RLS) Verification

### Check RLS is Enabled

```sql
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'user_requests', 'blog_posts')
ORDER BY tablename;
```

**Expected Result:**
```
tablename       | rowsecurity
----------------|-------------
blog_posts      | true
user_profiles   | true
user_requests   | true
```

✅ **PASS:** All tables have RLS enabled
❌ **FAIL:** Some tables missing RLS → Re-run migration

---

### Check RLS Policies Exist

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected Policies:**

**user_profiles (4 policies):**
1. Admins can view all profiles (SELECT)
2. Users can insert own profile (INSERT)
3. Users can update own profile (UPDATE)
4. Users can view own profile (SELECT)

**user_requests (6 policies):**
1. Admins can update all requests (UPDATE)
2. Admins can view all requests (SELECT)
3. Users can delete own pending requests (DELETE)
4. Users can insert own requests (INSERT)
5. Users can update own pending requests (UPDATE)
6. Users can view own requests (SELECT)

**blog_posts (5 policies):**
1. Admins can delete posts (DELETE)
2. Admins can insert posts (INSERT)
3. Admins can update posts (UPDATE)
4. Admins can view all posts (SELECT)
5. Anyone can view published posts (SELECT)

✅ **PASS:** Total 15 policies exist
❌ **FAIL:** Missing policies → Re-run migration

---

### Check Admin Email in Policies

```sql
-- This checks if your admin email is in the policies
-- Replace 'your-email@example.com' with your actual admin email

SELECT
  tablename,
  policyname,
  pg_get_expr(qual, 'pg_policies'::regclass) as policy_definition
FROM pg_policies
WHERE schemaname = 'public'
  AND policyname LIKE '%Admin%'
ORDER BY tablename, policyname;
```

**Look for your email in the policy definitions.**

✅ **PASS:** Your email appears in admin policies
❌ **FAIL:** Email not found → Update admin emails in code AND database

---

## 3️⃣ Storage Bucket Verification

### Check Bucket Exists

```sql
SELECT
  id,
  name,
  public,
  created_at
FROM storage.buckets
WHERE name = 'user-uploads';
```

**Expected Result:**
```
id                                   | name          | public | created_at
-------------------------------------|---------------|--------|------------------
[some-uuid]                          | user-uploads  | true   | [timestamp]
```

✅ **PASS:** Bucket exists and is public
❌ **FAIL:** No results → Create bucket in Supabase Dashboard

---

### Check Storage Policies

```sql
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;
```

**Expected Policies (5 total):**
1. Admins can upload blog images (INSERT)
2. Public can view user uploads (SELECT)
3. Users can delete own files (DELETE)
4. Users can update own files (UPDATE)
5. Users can upload own files (INSERT)

✅ **PASS:** 5 storage policies exist
❌ **FAIL:** Missing policies → Re-run `COMPLETE_STORAGE_SETUP.sql`

---

## 4️⃣ Triggers & Functions Verification

### Check Triggers Exist

```sql
SELECT
  event_object_table,
  trigger_name,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN ('user_profiles', 'user_requests', 'blog_posts')
ORDER BY event_object_table, trigger_name;
```

**Expected Triggers (5 total):**
1. blog_posts → set_blog_post_published_at
2. blog_posts → update_blog_posts_updated_at
3. user_profiles → update_user_profiles_updated_at
4. user_requests → set_request_completed_at
5. user_requests → update_user_requests_updated_at

✅ **PASS:** All 5 triggers exist
❌ **FAIL:** Missing triggers → Re-run migration

---

### Check Functions Exist

```sql
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_updated_at_column',
    'set_completed_at',
    'set_published_at'
  )
ORDER BY routine_name;
```

**Expected Functions (3 total):**
1. set_completed_at (FUNCTION)
2. set_published_at (FUNCTION)
3. update_updated_at_column (FUNCTION)

✅ **PASS:** All 3 functions exist
❌ **FAIL:** Missing functions → Re-run migration

---

## 5️⃣ Indexes Verification

### Check Important Indexes

```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'user_requests', 'blog_posts')
ORDER BY tablename, indexname;
```

**Expected Indexes:**

**user_profiles:**
- idx_user_profiles_id
- user_profiles_pkey (PRIMARY KEY)

**user_requests:**
- idx_user_requests_created_at
- idx_user_requests_status
- idx_user_requests_user_id
- user_requests_pkey (PRIMARY KEY)

**blog_posts:**
- blog_posts_pkey (PRIMARY KEY)
- blog_posts_slug_key (UNIQUE)
- idx_blog_posts_author_id
- idx_blog_posts_created_at
- idx_blog_posts_published
- idx_blog_posts_slug

✅ **PASS:** All indexes exist
❌ **FAIL:** Missing indexes → Re-run migration

---

## 6️⃣ Enum Types Verification

### Check Custom Types

```sql
SELECT
  typname,
  typtype
FROM pg_type
WHERE typname IN ('request_type', 'request_status')
ORDER BY typname;
```

**Expected Types:**
```
typname         | typtype
----------------|--------
request_status  | e
request_type    | e
```

✅ **PASS:** Both enum types exist
❌ **FAIL:** Missing types → Re-run migration

---

### Check Enum Values

**Request Type:**
```sql
SELECT
  enumlabel
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'request_type')
ORDER BY enumlabel;
```

**Expected Values:**
- family
- restore

**Request Status:**
```sql
SELECT
  enumlabel
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'request_status')
ORDER BY enumlabel;
```

**Expected Values:**
- completed
- pending
- processing
- rejected

✅ **PASS:** All enum values correct
❌ **FAIL:** Missing values → Re-run migration

---

## 7️⃣ Permissions Verification

### Check Table Permissions

```sql
SELECT
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name IN ('user_profiles', 'user_requests', 'blog_posts')
  AND grantee IN ('authenticated', 'anon')
ORDER BY table_name, grantee, privilege_type;
```

**Expected for each table:**
- authenticated: SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
- anon: SELECT

✅ **PASS:** Permissions set correctly
❌ **FAIL:** Missing permissions → Re-run migration

---

## 8️⃣ Views Verification

### Check Stats View

```sql
SELECT
  viewname
FROM pg_views
WHERE schemaname = 'public'
  AND viewname = 'user_request_stats';
```

**Expected Result:**
```
viewname
-------------------
user_request_stats
```

✅ **PASS:** Stats view exists
❌ **FAIL:** View missing → Re-run migration

---

### Test Stats View

```sql
SELECT * FROM user_request_stats LIMIT 5;
```

**Should return columns:**
- user_id
- total_requests
- pending_requests
- processing_requests
- completed_requests
- rejected_requests

✅ **PASS:** View works correctly
❌ **FAIL:** Error returned → Check migration

---

## 9️⃣ Foreign Keys Verification

### Check Foreign Key Constraints

```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
  JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('user_profiles', 'user_requests', 'blog_posts')
ORDER BY tc.table_name, kcu.column_name;
```

**Expected Foreign Keys:**

**user_profiles:**
- id → auth.users(id) ON DELETE CASCADE

**user_requests:**
- admin_id → auth.users(id) ON DELETE SET NULL or NO ACTION
- user_id → auth.users(id) ON DELETE CASCADE

**blog_posts:**
- author_id → auth.users(id) ON DELETE CASCADE

✅ **PASS:** All foreign keys exist with correct cascade
❌ **FAIL:** Missing constraints → Re-run migration

---

## 🔟 Code Configuration Verification

### Admin Emails Check

**File 1: contexts/AuthContext.tsx (Line ~15)**
```typescript
const ADMIN_EMAILS = [
  'YOUR_EMAIL@gmail.com',  // Should be YOUR actual email
]
```

**File 2: middleware.ts (Line ~6)**
```typescript
const ADMIN_EMAILS = [
  'YOUR_EMAIL@gmail.com',  // Should match AuthContext
]
```

✅ **PASS:** Both files have the same admin emails
❌ **FAIL:** Emails don't match or still using placeholder

---

### Environment Variables Check

**Check .env.local exists:**
```bash
# Run in terminal (Git Bash on Windows)
ls -la .env.local
```

**Should contain:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

✅ **PASS:** File exists with correct values
❌ **FAIL:** Missing or incorrect values

---

## 1️⃣1️⃣ Integration Test

### Complete Flow Test

**Run this SQL to test a complete user flow:**

```sql
-- 1. Check if you can query profiles (will be empty if no users yet)
SELECT COUNT(*) as profile_count FROM user_profiles;

-- 2. Check if you can query requests (will be empty if no requests yet)
SELECT COUNT(*) as request_count FROM user_requests;

-- 3. Check if you can query blog posts (will be empty if no posts yet)
SELECT COUNT(*) as blog_count FROM blog_posts;

-- 4. Test view
SELECT * FROM user_request_stats LIMIT 1;

-- 5. Verify all tables can be written to (requires authenticated user)
-- This will fail if RLS is working correctly when run as anon
-- That's expected and good!
```

✅ **PASS:** All queries run without errors
❌ **FAIL:** Errors returned → Check specific error message

---

## ✅ Final Verification Summary

Run this comprehensive check:

```sql
-- FINAL VERIFICATION REPORT
SELECT 'Database Setup' as check_category, 'Tables' as item,
  CASE WHEN COUNT(*) = 3 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'user_requests', 'blog_posts')

UNION ALL

SELECT 'Database Setup', 'RLS Enabled',
  CASE WHEN COUNT(*) = 3 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'user_requests', 'blog_posts')
  AND rowsecurity = true

UNION ALL

SELECT 'Database Setup', 'RLS Policies',
  CASE WHEN COUNT(*) >= 15 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'user_requests', 'blog_posts')

UNION ALL

SELECT 'Storage', 'Bucket Exists',
  CASE WHEN COUNT(*) = 1 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM storage.buckets
WHERE name = 'user-uploads'

UNION ALL

SELECT 'Storage', 'Bucket Public',
  CASE WHEN COUNT(*) = 1 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM storage.buckets
WHERE name = 'user-uploads' AND public = true

UNION ALL

SELECT 'Storage', 'Storage Policies',
  CASE WHEN COUNT(*) >= 5 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'

UNION ALL

SELECT 'Functions', 'Triggers',
  CASE WHEN COUNT(*) = 5 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN ('user_profiles', 'user_requests', 'blog_posts')

UNION ALL

SELECT 'Functions', 'Custom Functions',
  CASE WHEN COUNT(*) = 3 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('update_updated_at_column', 'set_completed_at', 'set_published_at')

UNION ALL

SELECT 'Types', 'Enum Types',
  CASE WHEN COUNT(*) = 2 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM pg_type
WHERE typname IN ('request_type', 'request_status')

ORDER BY check_category, item;
```

**Expected Result:**
```
check_category  | item              | status
----------------|-------------------|----------
Database Setup  | RLS Enabled       | ✅ PASS
Database Setup  | RLS Policies      | ✅ PASS
Database Setup  | Tables            | ✅ PASS
Functions       | Custom Functions  | ✅ PASS
Functions       | Triggers          | ✅ PASS
Storage         | Bucket Exists     | ✅ PASS
Storage         | Bucket Public     | ✅ PASS
Storage         | Storage Policies  | ✅ PASS
Types           | Enum Types        | ✅ PASS
```

**All items should show ✅ PASS**

---

## 🚨 Troubleshooting Failed Checks

### If Tables Check Fails
1. Re-run `COMPLETE_DATABASE_MIGRATION.sql`
2. Check for error messages in SQL Editor
3. Verify Supabase connection

### If RLS Check Fails
1. Run: `ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;`
2. Re-run migration file
3. Check Supabase dashboard → Database → Policies

### If Storage Check Fails
1. Go to Storage → Create bucket named `user-uploads`
2. Check "Public bucket" checkbox
3. Re-run `COMPLETE_STORAGE_SETUP.sql`

### If Policies Check Fails
1. Drop existing policies: `DROP POLICY [policy_name] ON [table_name];`
2. Re-run migration file
3. Verify admin emails are correct in SQL

### If Triggers/Functions Check Fails
1. Drop triggers: `DROP TRIGGER [trigger_name] ON [table_name];`
2. Drop functions: `DROP FUNCTION [function_name]();`
3. Re-run migration file

---

## ✅ Manual Testing Checklist

After SQL verification passes, test in the app:

### Authentication Flow
- [ ] Register new user
- [ ] Login with email/password
- [ ] Login with Google
- [ ] Logout
- [ ] Admin can access /admin
- [ ] Non-admin redirected from /admin

### User Profile
- [ ] View profile
- [ ] Upload avatar (< 5MB works)
- [ ] Upload avatar (> 5MB fails correctly)
- [ ] Edit profile fields
- [ ] Save changes
- [ ] Data persists after refresh

### Request System
- [ ] Create request
- [ ] Upload 1-5 images
- [ ] Upload > 5 images (fails correctly)
- [ ] Submit request
- [ ] View in requests list
- [ ] Filter by status
- [ ] Delete pending request

### Blog System (Admin Only)
- [ ] Create blog post
- [ ] Use rich text editor
- [ ] Preview mode
- [ ] Publish post
- [ ] View published post

---

**Status:** ✅ Ready for Production

**Last Updated:** 2026-01-16

**Run this checklist after every deployment to ensure everything is working correctly!**
