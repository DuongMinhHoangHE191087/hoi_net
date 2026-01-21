-- ==============================================
-- COMPLETE DATABASE MIGRATION FOR PHOTO RESTORE APP
-- Run this ENTIRE file in Supabase SQL Editor
-- ==============================================

-- ==============================================
-- STEP 1: USER PROFILES
-- ==============================================

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  facebook_url TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN ('admin@photoai.com', 'duonghoang@gmail.com')
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;

-- ==============================================
-- STEP 2: USER REQUESTS
-- ==============================================

-- Request Types and Statuses
CREATE TYPE request_type AS ENUM ('restore', 'family');
CREATE TYPE request_status AS ENUM ('pending', 'processing', 'completed', 'rejected');

-- User Requests Table
CREATE TABLE IF NOT EXISTS user_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type request_type NOT NULL,
  description TEXT NOT NULL,
  status request_status DEFAULT 'pending',
  original_images TEXT[] NOT NULL,
  restored_images TEXT[],
  admin_notes TEXT,
  admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own requests"
  ON user_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own requests"
  ON user_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending requests"
  ON user_requests FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users can delete own pending requests"
  ON user_requests FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all requests"
  ON user_requests FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN ('admin@photoai.com', 'duonghoang@gmail.com')
    )
  );

CREATE POLICY "Admins can update all requests"
  ON user_requests FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN ('admin@photoai.com', 'duonghoang@gmail.com')
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_requests_user_id ON user_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_requests_status ON user_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_requests_created_at ON user_requests(created_at DESC);

-- Triggers
DROP TRIGGER IF EXISTS update_user_requests_updated_at ON user_requests;
CREATE TRIGGER update_user_requests_updated_at
  BEFORE UPDATE ON user_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_request_completed_at ON user_requests;
CREATE TRIGGER set_request_completed_at
  BEFORE UPDATE ON user_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_completed_at();

-- Statistics View
CREATE OR REPLACE VIEW user_request_stats AS
SELECT
  user_id,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
  COUNT(*) FILTER (WHERE status = 'processing') as processing_requests,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_requests,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_requests
FROM user_requests
GROUP BY user_id;

-- Permissions
GRANT ALL ON user_requests TO authenticated;
GRANT SELECT ON user_requests TO anon;
GRANT SELECT ON user_request_stats TO authenticated;

-- ==============================================
-- STEP 3: BLOG POSTS
-- ==============================================

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  featured_image TEXT,
  published BOOLEAN DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view published posts"
  ON blog_posts FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can view all posts"
  ON blog_posts FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN ('admin@photoai.com', 'duonghoang@gmail.com')
    )
  );

CREATE POLICY "Admins can insert posts"
  ON blog_posts FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN ('admin@photoai.com', 'duonghoang@gmail.com')
    )
  );

CREATE POLICY "Admins can update posts"
  ON blog_posts FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN ('admin@photoai.com', 'duonghoang@gmail.com')
    )
  );

CREATE POLICY "Admins can delete posts"
  ON blog_posts FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN ('admin@photoai.com', 'duonghoang@gmail.com')
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);

-- Triggers
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.published = true AND OLD.published = false THEN
    NEW.published_at = NOW();
  ELSIF NEW.published = false THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_blog_post_published_at ON blog_posts;
CREATE TRIGGER set_blog_post_published_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_published_at();

-- Permissions
GRANT ALL ON blog_posts TO authenticated;
GRANT SELECT ON blog_posts TO anon;

-- ==============================================
-- MIGRATION COMPLETE!
-- ==============================================

-- Verify tables created
SELECT
  'user_profiles' as table_name,
  COUNT(*) as row_count
FROM user_profiles
UNION ALL
SELECT
  'user_requests' as table_name,
  COUNT(*) as row_count
FROM user_requests
UNION ALL
SELECT
  'blog_posts' as table_name,
  COUNT(*) as row_count
FROM blog_posts;

-- Show all RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
