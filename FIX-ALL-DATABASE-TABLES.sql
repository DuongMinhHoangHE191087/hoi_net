-- ================================================
-- FIX ALL MISSING DATABASE TABLES
-- Run this ENTIRE file in Supabase SQL Editor
-- ================================================

-- ================================================
-- 1. CREATE blog_posts TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  featured_image TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 2. CREATE team_members TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  avatar TEXT,
  social_links JSONB,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 3. CREATE value_sections TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS value_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  gradient TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- CREATE INDEXES
-- ================================================
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_team_members_order ON team_members(display_order);

CREATE INDEX IF NOT EXISTS idx_value_sections_order ON value_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_value_sections_active ON value_sections(is_active);

-- ================================================
-- CREATE TRIGGER FUNCTION (if not exists)
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- CREATE TRIGGERS
-- ================================================
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_value_sections_updated_at ON value_sections;
CREATE TRIGGER update_value_sections_updated_at
  BEFORE UPDATE ON value_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- ENABLE ROW LEVEL SECURITY
-- ================================================
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_sections ENABLE ROW LEVEL SECURITY;

-- ================================================
-- CREATE RLS POLICIES
-- ================================================

-- Blog Posts Policies
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
CREATE POLICY "Anyone can view published blog posts" ON blog_posts
  FOR SELECT USING (published = true);

-- Team Members Policies
DROP POLICY IF EXISTS "Anyone can view team members" ON team_members;
CREATE POLICY "Anyone can view team members" ON team_members
  FOR SELECT USING (true);

-- Value Sections Policies
DROP POLICY IF EXISTS "Anyone can view active value sections" ON value_sections;
CREATE POLICY "Anyone can view active value sections" ON value_sections
  FOR SELECT USING (is_active = true);

-- ================================================
-- GRANT PERMISSIONS
-- ================================================
GRANT ALL ON blog_posts TO authenticated;
GRANT SELECT ON blog_posts TO anon;

GRANT ALL ON team_members TO authenticated;
GRANT SELECT ON team_members TO anon;

GRANT ALL ON value_sections TO authenticated;
GRANT SELECT ON value_sections TO anon;

-- ================================================
-- INSERT SAMPLE DATA
-- ================================================

-- Insert sample blog post
INSERT INTO blog_posts (title, slug, excerpt, content, author_name, featured_image, published)
VALUES (
  'Khôi Phục Ảnh Cũ Với AI - Tương Lai Của Lưu Giữ Kỷ Niệm',
  'khoi-phuc-anh-cu-voi-ai',
  'Khám phá công nghệ AI tiên tiến giúp khôi phục những bức ảnh gia đình quý giá của bạn, mang lại màu sắc mới cho ký ức xưa.',
  '<h2>Giới Thiệu</h2><p>Công nghệ AI đã thay đổi cách chúng ta lưu giữ và khôi phục những kỷ niệm quý giá. Với Photo AI, bạn có thể dễ dàng khôi phục những bức ảnh cũ, phai màu của gia đình.</p><h2>Tính Năng Nổi Bật</h2><ul><li>Khôi phục ảnh cũ chất lượng cao</li><li>Tự động tô màu ảnh đen trắng</li><li>Sửa chữa vết rách, vết mốc</li><li>Tăng độ phân giải lên 4K</li></ul><h2>Kết Luận</h2><p>Hãy để chúng tôi giúp bạn bảo tồn những kỷ niệm quý giá!</p>',
  'Photo AI Team',
  'https://images.unsplash.com/photo-1551847812-b84d5985a8fc?w=800',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample team members
INSERT INTO team_members (name, role, bio, avatar, display_order)
VALUES
  (
    'Nguyễn Văn A',
    'CEO & Founder',
    'Chuyên gia AI với 10+ năm kinh nghiệm trong lĩnh vực xử lý ảnh',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    1
  ),
  (
    'Trần Thị B',
    'CTO',
    'Kỹ sư phần mềm hàng đầu, chuyên về Machine Learning',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    2
  ),
  (
    'Lê Văn C',
    'Lead AI Engineer',
    'Chuyên gia về Deep Learning và Computer Vision',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    3
  )
ON CONFLICT DO NOTHING;

-- Insert sample value sections
INSERT INTO value_sections (title, description, icon, gradient, display_order, is_active)
VALUES
  (
    'Sứ Mệnh',
    'Mang lại giá trị cho khách hàng thông qua công nghệ AI tiên tiến, giúp khôi phục và lưu giữ những kỷ niệm quý giá của mọi gia đình.',
    'Target',
    'from-pink-500 via-rose-500 to-red-500',
    1,
    true
  ),
  (
    'Tầm Nhìn',
    'Trở thành nền tảng hàng đầu về khôi phục ảnh AI tại Việt Nam, mang đến trải nghiệm tốt nhất cho người dùng.',
    'Eye',
    'from-yellow-500 via-orange-500 to-amber-500',
    2,
    true
  ),
  (
    'Giá Trị Cốt Lõi',
    'Chất lượng - Đổi mới - Khách hàng là trung tâm - Minh bạch - Tận tâm với từng sản phẩm.',
    'Heart',
    'from-purple-500 via-pink-500 to-rose-500',
    3,
    true
  )
ON CONFLICT DO NOTHING;

-- ================================================
-- 4. CREATE about_sections TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS about_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  image_url TEXT,
  image_position TEXT CHECK (image_position IN ('left', 'right')) DEFAULT 'right',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for about_sections
CREATE INDEX IF NOT EXISTS idx_about_sections_display_order ON about_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_about_sections_is_active ON about_sections(is_active);

-- Create trigger for about_sections
DROP TRIGGER IF EXISTS update_about_sections_updated_at ON about_sections;
CREATE TRIGGER update_about_sections_updated_at
BEFORE UPDATE ON about_sections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for about_sections
INSERT INTO about_sections (title, subtitle, description, image_url, image_position, display_order, is_active)
VALUES
  (
    'Sứ Mệnh Của Chúng Tôi',
    'Mang lại giá trị cho khách hàng',
    'Chúng tôi cam kết mang đến dịch vụ khôi phục ảnh chất lượng cao nhất, giúp lưu giữ những kỷ niệm quý giá của mọi gia đình. Với công nghệ AI tiên tiến và đội ngũ chuyên nghiệp, chúng tôi biến những bức ảnh cũ phai màu thành những tác phẩm nghệ thuật sống động.',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    'right',
    1,
    true
  ),
  (
    'Tầm Nhìn',
    'Trở thành nền tảng hàng đầu',
    'Chúng tôi hướng tới việc trở thành nền tảng khôi phục ảnh AI hàng đầu tại Việt Nam, mang đến trải nghiệm tốt nhất cho người dùng. Chúng tôi không ngừng đổi mới công nghệ và cải thiện chất lượng dịch vụ để đáp ứng nhu cầu ngày càng cao của khách hàng.',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    'left',
    2,
    true
  ),
  (
    'Giá Trị Cốt Lõi',
    'Những gì chúng tôi tin tưởng',
    'Chất lượng là ưu tiên hàng đầu - Đổi mới không ngừng - Khách hàng là trung tâm - Minh bạch trong mọi giao dịch - Tận tâm với từng sản phẩm. Đây là những giá trị định hướng mọi hoạt động của chúng tôi.',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800',
    'right',
    3,
    true
  )
ON CONFLICT DO NOTHING;

-- ================================================
-- 5. CREATE user_profiles TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Create trigger for user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ================================================
-- 6. CREATE user_requests TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS user_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('restore', 'colorize', 'enhance', 'family')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  description TEXT,
  image_urls TEXT[],
  result_url TEXT,
  prompt_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for user_requests
CREATE INDEX IF NOT EXISTS idx_user_requests_user_id ON user_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_requests_status ON user_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_requests_created_at ON user_requests(created_at DESC);

-- Create trigger for user_requests
DROP TRIGGER IF EXISTS update_user_requests_updated_at ON user_requests;
CREATE TRIGGER update_user_requests_updated_at
BEFORE UPDATE ON user_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on user_requests
ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_requests
DROP POLICY IF EXISTS "Users can view own requests" ON user_requests;
CREATE POLICY "Users can view own requests" ON user_requests
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own requests" ON user_requests;
CREATE POLICY "Users can create own requests" ON user_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own requests" ON user_requests;
CREATE POLICY "Users can update own requests" ON user_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- ================================================
-- 7. CREATE system_prompts TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS system_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT,
  description TEXT,
  parameters JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for system_prompts
CREATE INDEX IF NOT EXISTS idx_system_prompts_category ON system_prompts(category);
CREATE INDEX IF NOT EXISTS idx_system_prompts_is_active ON system_prompts(is_active);
CREATE INDEX IF NOT EXISTS idx_system_prompts_display_order ON system_prompts(display_order);

-- Create trigger for system_prompts
DROP TRIGGER IF EXISTS update_system_prompts_updated_at ON system_prompts;
CREATE TRIGGER update_system_prompts_updated_at
BEFORE UPDATE ON system_prompts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert sample system prompts
INSERT INTO system_prompts (name, display_name, category, system_prompt, description, parameters, is_active, is_default, display_order)
VALUES
  (
    'photo_restore_basic',
    'Khôi Phục Ảnh Cơ Bản',
    'restore',
    'You are an AI photo restoration expert. Analyze the uploaded image and restore it to its original quality. Remove scratches, fix fading, and enhance clarity while preserving the original characteristics.',
    'Khôi phục ảnh cũ bị hư hỏng, phai màu',
    '{"upscale": 2, "denoise": true, "enhanceFaces": true}',
    true,
    true,
    1
  ),
  (
    'photo_colorize',
    'Tô Màu Ảnh Đen Trắng',
    'colorize',
    'You are an AI colorization expert. Analyze this black and white photo and apply realistic, historically accurate colors. Pay special attention to skin tones, clothing, and environmental elements.',
    'Tô màu ảnh đen trắng thành ảnh màu',
    '{"colorAccuracy": 0.9, "saturation": 1.0}',
    true,
    false,
    2
  ),
  (
    'photo_enhance',
    'Nâng Cao Chất Lượng',
    'enhance',
    'You are an AI image enhancement expert. Improve the quality of this photo by increasing resolution, enhancing details, and optimizing colors while maintaining natural appearance.',
    'Nâng cao độ phân giải và chất lượng ảnh',
    '{"upscale": 4, "sharpness": 1.2, "contrast": 1.1}',
    true,
    false,
    3
  )
ON CONFLICT (name) DO NOTHING;

-- ================================================
-- VERIFY TABLES CREATED
-- ================================================
SELECT
  'blog_posts' as table_name,
  COUNT(*) as row_count
FROM blog_posts
UNION ALL
SELECT
  'team_members' as table_name,
  COUNT(*) as row_count
FROM team_members
UNION ALL
SELECT
  'value_sections' as table_name,
  COUNT(*) as row_count
FROM value_sections
UNION ALL
SELECT
  'about_sections' as table_name,
  COUNT(*) as row_count
FROM about_sections
UNION ALL
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
  'system_prompts' as table_name,
  COUNT(*) as row_count
FROM system_prompts;

-- ================================================
-- SUCCESS MESSAGE
-- ================================================
DO $$
BEGIN
  RAISE NOTICE '✅ All tables created successfully!';
  RAISE NOTICE '✅ Sample data inserted!';
  RAISE NOTICE '✅ Your app should now work perfectly!';
END $$;
