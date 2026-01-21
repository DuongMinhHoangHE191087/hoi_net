-- ========================================================================
-- PHOTO RESTORE AI - COMPLETE SYSTEM UPGRADE
-- Run this in Supabase SQL Editor
-- Date: 2025-01-17
-- ========================================================================

-- ========================================================================
-- PART 1: HELPER FUNCTIONS
-- ========================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.email() IN (
    'admin@photoai.com',
    'duonghoang@gmail.com',
    'duongminhhoanggame@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.user_profiles
  WHERE id = auth.uid();

  -- Admin check by email
  IF auth.email() IN (
    'admin@photoai.com',
    'duonghoang@gmail.com',
    'duongminhhoanggame@gmail.com'
  ) THEN
    RETURN 'admin';
  END IF;

  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is moderator or higher
CREATE OR REPLACE FUNCTION is_moderator_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() IN ('admin', 'moderator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================================
-- PART 2: USER_PROFILES TABLE (with roles)
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  facebook_url TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_at TIMESTAMPTZ,
  blocked_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add any missing columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'role') THEN
    ALTER TABLE public.user_profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'is_blocked') THEN
    ALTER TABLE public.user_profiles ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'blocked_at') THEN
    ALTER TABLE public.user_profiles ADD COLUMN blocked_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'blocked_reason') THEN
    ALTER TABLE public.user_profiles ADD COLUMN blocked_reason TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'email') THEN
    ALTER TABLE public.user_profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.user_profiles;

-- Create policies
CREATE POLICY "Users can view own profile"
ON public.user_profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.user_profiles FOR SELECT USING (is_admin_user());

CREATE POLICY "Admins can update all profiles"
ON public.user_profiles FOR UPDATE USING (is_admin_user());

CREATE POLICY "Admins can delete profiles"
ON public.user_profiles FOR DELETE USING (is_admin_user());

-- Trigger
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

-- ========================================================================
-- PART 3: USER_REQUESTS TABLE
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.user_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'restore',
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  original_images TEXT[] NOT NULL,
  restored_images TEXT[],
  admin_notes TEXT,
  admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.user_requests ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own requests" ON public.user_requests;
DROP POLICY IF EXISTS "Users can insert own requests" ON public.user_requests;
DROP POLICY IF EXISTS "Users can update own pending requests" ON public.user_requests;
DROP POLICY IF EXISTS "Users can delete own pending requests" ON public.user_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.user_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON public.user_requests;
DROP POLICY IF EXISTS "Moderators can view all requests" ON public.user_requests;

-- Create user policies
CREATE POLICY "Users can view own requests"
ON public.user_requests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own requests"
ON public.user_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending requests"
ON public.user_requests FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users can delete own pending requests"
ON public.user_requests FOR DELETE USING (auth.uid() = user_id AND status = 'pending');

-- Create admin policies
CREATE POLICY "Admins can view all requests"
ON public.user_requests FOR SELECT USING (is_admin_user());

CREATE POLICY "Admins can update all requests"
ON public.user_requests FOR UPDATE USING (is_admin_user());

-- Create moderator policies
CREATE POLICY "Moderators can view all requests"
ON public.user_requests FOR SELECT USING (is_moderator_or_admin());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_requests_user_id ON public.user_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_requests_status ON public.user_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_requests_created_at ON public.user_requests(created_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_user_requests_updated_at ON public.user_requests;
CREATE TRIGGER update_user_requests_updated_at
BEFORE UPDATE ON public.user_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Permissions
GRANT ALL ON public.user_requests TO authenticated;
GRANT SELECT ON public.user_requests TO anon;

-- ========================================================================
-- PART 4: FEEDBACK TABLE
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived', 'replied')),
  admin_reply TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can update feedback" ON public.feedback;
DROP POLICY IF EXISTS "Moderators can view feedback" ON public.feedback;
DROP POLICY IF EXISTS "Moderators can update feedback" ON public.feedback;

CREATE POLICY "Anyone can submit feedback"
ON public.feedback FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all feedback"
ON public.feedback FOR SELECT USING (is_admin_user());

CREATE POLICY "Admins can update feedback"
ON public.feedback FOR UPDATE USING (is_admin_user());

CREATE POLICY "Moderators can view feedback"
ON public.feedback FOR SELECT USING (is_moderator_or_admin());

CREATE POLICY "Moderators can update feedback"
ON public.feedback FOR UPDATE USING (is_moderator_or_admin());

CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

DROP TRIGGER IF EXISTS update_feedback_updated_at ON public.feedback;
CREATE TRIGGER update_feedback_updated_at
BEFORE UPDATE ON public.feedback
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

GRANT ALL ON public.feedback TO authenticated;
GRANT INSERT ON public.feedback TO anon;

-- ========================================================================
-- PART 5: SITE_SETTINGS TABLE
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON public.site_settings;
DROP POLICY IF EXISTS "Only admins can modify site settings" ON public.site_settings;

CREATE POLICY "Site settings are viewable by everyone"
ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Only admins can modify site settings"
ON public.site_settings FOR ALL USING (is_admin_user());

GRANT ALL ON public.site_settings TO authenticated;
GRANT SELECT ON public.site_settings TO anon;

-- Seed default settings (simple text values)
INSERT INTO public.site_settings (key, value, description)
VALUES
  ('mission', 'Khôi phục và bảo tồn những ký ức quý giá của gia đình Việt Nam thông qua công nghệ AI tiên tiến.', 'Mission statement'),
  ('vision', 'Trở thành nền tảng khôi phục ảnh số 1 tại Việt Nam, giúp mọi gia đình lưu giữ kỷ niệm đẹp.', 'Vision statement'),
  ('about', 'Photo Restore AI là dịch vụ khôi phục ảnh cũ sử dụng công nghệ trí tuệ nhân tạo tiên tiến. Chúng tôi giúp bạn phục hồi những bức ảnh cũ, mờ, rách thành ảnh sắc nét và đầy màu sắc.', 'About us text'),
  ('brand_name', 'Photo Restore AI', 'Brand name'),
  ('brand_slogan', 'Khôi phục ký ức - Lưu giữ yêu thương', 'Brand slogan'),
  ('contact_phone', '', 'Contact phone'),
  ('contact_email', '', 'Contact email'),
  ('contact_facebook', '', 'Facebook page URL'),
  ('contact_address', '', 'Physical address'),
  ('footer_copyright', '© 2025 Photo Restore AI. All rights reserved.', 'Footer copyright text'),
  ('ui_settings', '{}', 'UI customization settings (JSON)')
ON CONFLICT (key) DO NOTHING;

-- ========================================================================
-- PART 6: BLOG_POSTS TABLE
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'rejected')),
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'status') THEN
    ALTER TABLE public.blog_posts ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'rejected'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'reviewed_by') THEN
    ALTER TABLE public.blog_posts ADD COLUMN reviewed_by UUID REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'reviewed_at') THEN
    ALTER TABLE public.blog_posts ADD COLUMN reviewed_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'review_notes') THEN
    ALTER TABLE public.blog_posts ADD COLUMN review_notes TEXT;
  END IF;
END $$;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can view own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can insert posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Moderators can view and review posts" ON public.blog_posts;

CREATE POLICY "Published posts are viewable by everyone"
ON public.blog_posts FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can view own posts"
ON public.blog_posts FOR SELECT USING (author_id = auth.uid());

CREATE POLICY "Authors can insert posts"
ON public.blog_posts FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
ON public.blog_posts FOR UPDATE USING (author_id = auth.uid() AND status IN ('draft', 'rejected'));

CREATE POLICY "Admins can manage all posts"
ON public.blog_posts FOR ALL USING (is_admin_user());

CREATE POLICY "Moderators can view and review posts"
ON public.blog_posts FOR SELECT USING (is_moderator_or_admin());

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

GRANT ALL ON public.blog_posts TO authenticated;
GRANT SELECT ON public.blog_posts TO anon;

-- ========================================================================
-- PART 7: UI_SETTINGS TABLE (icons, colors, etc.)
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.ui_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, name)
);

ALTER TABLE public.ui_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "UI settings are viewable by everyone" ON public.ui_settings;
DROP POLICY IF EXISTS "Only admins can modify UI settings" ON public.ui_settings;

CREATE POLICY "UI settings are viewable by everyone"
ON public.ui_settings FOR SELECT USING (true);

CREATE POLICY "Only admins can modify UI settings"
ON public.ui_settings FOR ALL USING (is_admin_user());

CREATE INDEX IF NOT EXISTS idx_ui_settings_category ON public.ui_settings(category);

GRANT ALL ON public.ui_settings TO authenticated;
GRANT SELECT ON public.ui_settings TO anon;

-- Seed default UI settings
INSERT INTO public.ui_settings (category, name, value, display_order)
VALUES
  ('navbar', 'logo', '{"icon": "ImageIcon", "text": "Photo Restore AI"}'::jsonb, 1),
  ('navbar', 'links', '{"items": [{"label": "Trang chu", "href": "/"}, {"label": "Blog", "href": "/blog"}, {"label": "Gioi thieu", "href": "/about"}]}'::jsonb, 2),
  ('footer', 'copyright', '{"text": "2025 Photo Restore AI. All rights reserved."}'::jsonb, 1),
  ('footer', 'social_links', '{"facebook": "", "youtube": "", "tiktok": ""}'::jsonb, 2),
  ('hero', 'content', '{"title": "Khoi phuc anh cu", "subtitle": "Bang cong nghe AI tien tien", "cta_text": "Bat dau ngay"}'::jsonb, 1),
  ('colors', 'primary', '{"value": "#FF6B9D", "name": "Pink"}'::jsonb, 1),
  ('colors', 'secondary', '{"value": "#C44569", "name": "Deep Pink"}'::jsonb, 2)
ON CONFLICT (category, name) DO NOTHING;

-- ========================================================================
-- PART 8: VALUE_SECTIONS TABLE
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.value_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Star',
  gradient TEXT DEFAULT 'from-pink-500 to-rose-500',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.value_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Value sections are viewable by everyone" ON public.value_sections;
DROP POLICY IF EXISTS "Only admins can modify value sections" ON public.value_sections;

CREATE POLICY "Value sections are viewable by everyone"
ON public.value_sections FOR SELECT USING (true);

CREATE POLICY "Only admins can modify value sections"
ON public.value_sections FOR ALL USING (is_admin_user());

GRANT ALL ON public.value_sections TO authenticated;
GRANT SELECT ON public.value_sections TO anon;

-- ========================================================================
-- PART 9: ABOUT_SECTIONS TABLE
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.about_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  image_url TEXT,
  image_position TEXT DEFAULT 'right' CHECK (image_position IN ('left', 'right')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "About sections are viewable by everyone" ON public.about_sections;
DROP POLICY IF EXISTS "Only admins can modify about sections" ON public.about_sections;

CREATE POLICY "About sections are viewable by everyone"
ON public.about_sections FOR SELECT USING (true);

CREATE POLICY "Only admins can modify about sections"
ON public.about_sections FOR ALL USING (is_admin_user());

GRANT ALL ON public.about_sections TO authenticated;
GRANT SELECT ON public.about_sections TO anon;

-- ========================================================================
-- NOTIFY POSTGREST TO RELOAD SCHEMA
-- ========================================================================
NOTIFY pgrst, 'reload schema';

-- Output success message
DO $$ BEGIN RAISE NOTICE 'Database upgrade complete! All tables created successfully.'; END $$;
