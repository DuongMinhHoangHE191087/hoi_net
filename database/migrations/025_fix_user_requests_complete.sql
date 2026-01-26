-- =============================================
-- COMPLETE USER REQUESTS SETUP
-- Run this in Supabase SQL Editor
-- =============================================

-- Step 1: Create ENUM types if not exist
DO $$ BEGIN
    CREATE TYPE request_type AS ENUM ('restore', 'family');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('pending', 'processing', 'completed', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create user_requests table if not exist
CREATE TABLE IF NOT EXISTS user_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type request_type NOT NULL DEFAULT 'restore',
  description TEXT NOT NULL DEFAULT '',
  status request_status DEFAULT 'pending',
  original_images TEXT[] NOT NULL DEFAULT '{}',
  restored_images TEXT[],
  admin_notes TEXT,
  admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Step 3: Enable Row Level Security
ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop all existing policies and recreate
DROP POLICY IF EXISTS "Users can view own requests" ON user_requests;
DROP POLICY IF EXISTS "Users can insert own requests" ON user_requests;
DROP POLICY IF EXISTS "Users can update own pending requests" ON user_requests;
DROP POLICY IF EXISTS "Users can delete own pending requests" ON user_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON user_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON user_requests;
DROP POLICY IF EXISTS "Service role bypass" ON user_requests;

-- Policy 1: Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON user_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own requests
CREATE POLICY "Users can insert own requests"
  ON user_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own pending requests
CREATE POLICY "Users can update own pending requests"
  ON user_requests
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own pending requests
CREATE POLICY "Users can delete own pending requests"
  ON user_requests
  FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_requests_user_id ON user_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_requests_status ON user_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_requests_created_at ON user_requests(created_at DESC);

-- Step 6: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_requests_updated_at ON user_requests;
CREATE TRIGGER update_user_requests_updated_at
  BEFORE UPDATE ON user_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Grant permissions
GRANT ALL ON user_requests TO authenticated;
GRANT SELECT ON user_requests TO anon;

-- Step 8: Verify table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_requests'
ORDER BY ordinal_position;

-- Step 9: Verify policies
SELECT 
  policyname, 
  cmd, 
  qual
FROM pg_policies 
WHERE tablename = 'user_requests';

-- Step 10: Count existing requests (for verification)
SELECT COUNT(*) as total_requests FROM user_requests;

-- =============================================
-- IMPORTANT NOTES:
-- =============================================
-- 1. After running this, the Service Role Key (SUPABASE_SERVICE_ROLE_KEY)
--    will bypass all RLS policies and can read ALL data
-- 
-- 2. The admin API uses supabaseAdmin which uses Service Role Key
--    So it should see ALL requests regardless of user
--
-- 3. If requests are still not showing, check:
--    - SUPABASE_SERVICE_ROLE_KEY is correct in .env.local
--    - The table name is exactly 'user_requests' (not 'requests')
--    - Realtime is enabled for this table if using subscriptions
