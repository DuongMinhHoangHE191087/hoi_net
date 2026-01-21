-- ============================================
-- COMPLETE FIX: user_requests table
-- Fixes: Missing columns + Wrong index names
-- Created: 2026-01-19
-- ============================================

-- Step 1: Add missing columns
-- ============================================

-- Add original_images column (Cloudinary URLs)
ALTER TABLE user_requests
ADD COLUMN IF NOT EXISTS original_images TEXT[] NOT NULL DEFAULT '{}';

-- Add restored_images column (Admin uploads)
ALTER TABLE user_requests
ADD COLUMN IF NOT EXISTS restored_images TEXT[];

-- Add admin_notes column
ALTER TABLE user_requests
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add admin_id column
ALTER TABLE user_requests
ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES auth.users(id);

-- Add completed_at column
ALTER TABLE user_requests
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Step 2: Fix/Add indexes with CORRECT column names
-- ============================================

-- Drop old indexes if they exist (with wrong column names)
DROP INDEX IF EXISTS idx_user_requests_type;

-- Index for filtering by user_id and status (most common query)
CREATE INDEX IF NOT EXISTS idx_user_requests_user_status
ON user_requests(user_id, status);

-- Index for sorting by created_at (DESC order for recent first)
CREATE INDEX IF NOT EXISTS idx_user_requests_created
ON user_requests(created_at DESC);

-- Index for status filtering (admin panel)
CREATE INDEX IF NOT EXISTS idx_user_requests_status
ON user_requests(status);

-- Composite index for user queries with sorting
CREATE INDEX IF NOT EXISTS idx_user_requests_user_created
ON user_requests(user_id, created_at DESC);

-- Index for filtering by type (CORRECT column name is 'type', not 'request_type')
CREATE INDEX IF NOT EXISTS idx_user_requests_type
ON user_requests(type);

-- Step 3: Add comments for documentation
-- ============================================

COMMENT ON COLUMN user_requests.original_images IS 'Array of Cloudinary URLs for original images';
COMMENT ON COLUMN user_requests.restored_images IS 'Array of Cloudinary URLs for restored images (admin uploads)';
COMMENT ON COLUMN user_requests.admin_notes IS 'Admin notes/feedback for the request';
COMMENT ON COLUMN user_requests.admin_id IS 'Admin who processed the request';
COMMENT ON COLUMN user_requests.completed_at IS 'Timestamp when request was completed';

-- Step 4: Verify the fix
-- ============================================

-- Check columns
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_requests'
ORDER BY column_name;

-- Check indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'user_requests'
ORDER BY indexname;

-- ============================================
-- Expected Output After Running:
-- ============================================
-- Columns should include:
-- - admin_id (uuid)
-- - admin_notes (text)
-- - completed_at (timestamp with time zone)
-- - created_at (timestamp with time zone)
-- - description (text)
-- - id (uuid)
-- - original_images (ARRAY) ✅
-- - restored_images (ARRAY) ✅
-- - status (USER-DEFINED)
-- - type (USER-DEFINED)
-- - updated_at (timestamp with time zone)
-- - user_id (uuid)
--
-- Indexes should include:
-- - idx_user_requests_created
-- - idx_user_requests_status
-- - idx_user_requests_type ✅
-- - idx_user_requests_user_created
-- - idx_user_requests_user_status
-- ============================================
