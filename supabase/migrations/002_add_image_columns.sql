-- ============================================
-- Add Missing Columns to user_requests
-- Migration: Add original_images and restored_images
-- Created: 2026-01-19
-- ============================================

-- Add original_images column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_requests'
    AND column_name = 'original_images'
  ) THEN
    ALTER TABLE user_requests
    ADD COLUMN original_images TEXT[] NOT NULL DEFAULT '{}';
  END IF;
END $$;

-- Add restored_images column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_requests'
    AND column_name = 'restored_images'
  ) THEN
    ALTER TABLE user_requests
    ADD COLUMN restored_images TEXT[];
  END IF;
END $$;

-- Add admin_notes column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_requests'
    AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE user_requests
    ADD COLUMN admin_notes TEXT;
  END IF;
END $$;

-- Add admin_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_requests'
    AND column_name = 'admin_id'
  ) THEN
    ALTER TABLE user_requests
    ADD COLUMN admin_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Add completed_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_requests'
    AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE user_requests
    ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN user_requests.original_images IS 'Array of Cloudinary URLs for original images';
COMMENT ON COLUMN user_requests.restored_images IS 'Array of Cloudinary URLs for restored images (admin uploads)';
COMMENT ON COLUMN user_requests.admin_notes IS 'Admin notes/feedback for the request';
COMMENT ON COLUMN user_requests.admin_id IS 'Admin who processed the request';
COMMENT ON COLUMN user_requests.completed_at IS 'Timestamp when request was completed';

-- ============================================
-- To apply this migration in Supabase:
-- ============================================
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Create a new query
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
-- 5. Verify with:
--    SELECT column_name, data_type
--    FROM information_schema.columns
--    WHERE table_name = 'user_requests';
-- ============================================
