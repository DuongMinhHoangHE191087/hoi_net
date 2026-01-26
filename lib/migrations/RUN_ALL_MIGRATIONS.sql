-- ==========================================
-- MASTER MIGRATION SCRIPT
-- File: RUN_ALL_MIGRATIONS.sql
-- ==========================================
-- Chạy file này trong Supabase SQL Editor
-- Nó sẽ thực hiện tất cả các migrations cần thiết
-- ==========================================

-- ==========================================
-- PHẦN 1: KIỂM TRA TRẠNG THÁI HIỆN TẠI
-- ==========================================

DO $$
DECLARE
  table_count INTEGER;
  admin_exists BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_schema = 'public';
  SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') INTO admin_exists;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 KIỂM TRA TRẠNG THÁI HIỆN TẠI';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Số bảng hiện có: %', table_count;
  RAISE NOTICE 'Bảng admin_users: %', CASE WHEN admin_exists THEN 'Có' ELSE 'Chưa có' END;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

-- ==========================================
-- PHẦN 2: TẠO CÁC BẢNG CƠ BẢN
-- ==========================================

-- Admin users table (quan trọng nhất)
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID,
  permissions JSONB DEFAULT '{"full_access": true}'::jsonb
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  facebook_url TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Admin',
  author_avatar TEXT,
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  featured_image TEXT,
  published BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  avatar TEXT,
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived', 'replied')),
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  admin_reply TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Value sections table
CREATE TABLE IF NOT EXISTS value_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  gradient TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  icon_type TEXT DEFAULT 'lucide',
  icon_value TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  features JSONB DEFAULT '[]'::jsonb,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- About sections table
CREATE TABLE IF NOT EXISTS about_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  section_type TEXT DEFAULT 'content',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Navigation links table
CREATE TABLE IF NOT EXISTS navigation_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  icon TEXT,
  is_external BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES navigation_links(id) ON DELETE SET NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Footer links table
CREATE TABLE IF NOT EXISTS footer_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  column_name TEXT NOT NULL,
  column_title TEXT,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  is_external BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI System prompts table
CREATE TABLE IF NOT EXISTS ai_system_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  prompt_text TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  parameters JSONB DEFAULT '{}'::jsonb,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User requests table
CREATE TABLE IF NOT EXISTS user_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('restore', 'colorize', 'enhance', 'family_merge', 'custom')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  title TEXT,
  description TEXT,
  original_images TEXT[] DEFAULT '{}',
  result_images TEXT[] DEFAULT '{}',
  admin_notes TEXT,
  priority INTEGER DEFAULT 0,
  estimated_completion TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Distributed locks table
CREATE TABLE IF NOT EXISTS distributed_locks (
  lock_name TEXT PRIMARY KEY,
  lock_id TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  acquired_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conflict log table
CREATE TABLE IF NOT EXISTS conflict_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  row_id UUID,
  user_id UUID,
  expected_version INTEGER,
  actual_version INTEGER,
  operation TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$ BEGIN RAISE NOTICE '✅ Đã tạo/kiểm tra tất cả các bảng cơ bản'; END $$;

-- ==========================================
-- PHẦN 2.5: THÊM COLUMNS MỚI VÀO TABLES ĐÃ TỒN TẠI
-- ==========================================

DO $$
BEGIN
  -- Feedback table columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedback' AND column_name = 'is_public') THEN
    ALTER TABLE feedback ADD COLUMN is_public BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_public to feedback';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedback' AND column_name = 'is_featured') THEN
    ALTER TABLE feedback ADD COLUMN is_featured BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_featured to feedback';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedback' AND column_name = 'version') THEN
    ALTER TABLE feedback ADD COLUMN version INTEGER DEFAULT 1;
    RAISE NOTICE 'Added version to feedback';
  END IF;

  -- Blog posts columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'version') THEN
    ALTER TABLE blog_posts ADD COLUMN version INTEGER DEFAULT 1;
    RAISE NOTICE 'Added version to blog_posts';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'category') THEN
    ALTER TABLE blog_posts ADD COLUMN category TEXT DEFAULT 'general';
    RAISE NOTICE 'Added category to blog_posts';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'tags') THEN
    ALTER TABLE blog_posts ADD COLUMN tags TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Added tags to blog_posts';
  END IF;

  -- Team members columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'version') THEN
    ALTER TABLE team_members ADD COLUMN version INTEGER DEFAULT 1;
    RAISE NOTICE 'Added version to team_members';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'is_active') THEN
    ALTER TABLE team_members ADD COLUMN is_active BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added is_active to team_members';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'avatar_url') THEN
    ALTER TABLE team_members ADD COLUMN avatar_url TEXT;
    RAISE NOTICE 'Added avatar_url to team_members';
  END IF;

  -- Site settings columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'version') THEN
    ALTER TABLE site_settings ADD COLUMN version INTEGER DEFAULT 1;
    RAISE NOTICE 'Added version to site_settings';
  END IF;

  -- Value sections columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'value_sections' AND column_name = 'version') THEN
    ALTER TABLE value_sections ADD COLUMN version INTEGER DEFAULT 1;
    RAISE NOTICE 'Added version to value_sections';
  END IF;

  -- User profiles columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'version') THEN
    ALTER TABLE user_profiles ADD COLUMN version INTEGER DEFAULT 1;
    RAISE NOTICE 'Added version to user_profiles';
  END IF;

  -- Navigation links columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'navigation_links' AND column_name = 'version') THEN
    ALTER TABLE navigation_links ADD COLUMN version INTEGER DEFAULT 1;
    RAISE NOTICE 'Added version to navigation_links';
  END IF;

  -- Footer links columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'footer_links' AND column_name = 'version') THEN
    ALTER TABLE footer_links ADD COLUMN version INTEGER DEFAULT 1;
    RAISE NOTICE 'Added version to footer_links';
  END IF;

  -- About sections columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'about_sections' AND column_name = 'version') THEN
    ALTER TABLE about_sections ADD COLUMN version INTEGER DEFAULT 1;
    RAISE NOTICE 'Added version to about_sections';
  END IF;

  -- Services columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'version') THEN
    ALTER TABLE services ADD COLUMN version INTEGER DEFAULT 1;
    RAISE NOTICE 'Added version to services';
  END IF;

  -- User requests columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_requests' AND column_name = 'version') THEN
    ALTER TABLE user_requests ADD COLUMN version INTEGER DEFAULT 1;
    RAISE NOTICE 'Added version to user_requests';
  END IF;

  -- AI system prompts columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_system_prompts' AND column_name = 'version') THEN
    ALTER TABLE ai_system_prompts ADD COLUMN version INTEGER DEFAULT 1;
    RAISE NOTICE 'Added version to ai_system_prompts';
  END IF;

  RAISE NOTICE '✅ Đã thêm các columns mới vào tables đã tồn tại';
END $$;

-- ==========================================
-- PHẦN 3: TẠO INDEXES
-- ==========================================

-- Blog posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created ON blog_posts(created_at DESC);

-- Team members indexes
CREATE INDEX IF NOT EXISTS idx_team_members_order ON team_members(display_order);
CREATE INDEX IF NOT EXISTS idx_team_members_active ON team_members(is_active);

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_public ON feedback(is_public);

-- Site settings indexes
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- Value sections indexes
CREATE INDEX IF NOT EXISTS idx_value_sections_order ON value_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_value_sections_active ON value_sections(is_active);

-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_order ON services(display_order);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

-- About sections indexes
CREATE INDEX IF NOT EXISTS idx_about_sections_order ON about_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_about_sections_active ON about_sections(is_active);

-- Navigation links indexes
CREATE INDEX IF NOT EXISTS idx_nav_links_order ON navigation_links(display_order);
CREATE INDEX IF NOT EXISTS idx_nav_links_active ON navigation_links(is_active);

-- Footer links indexes
CREATE INDEX IF NOT EXISTS idx_footer_links_order ON footer_links(display_order);
CREATE INDEX IF NOT EXISTS idx_footer_links_active ON footer_links(is_active);

-- User requests indexes
CREATE INDEX IF NOT EXISTS idx_user_requests_user ON user_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_requests_status ON user_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_requests_created ON user_requests(created_at DESC);

-- Locks indexes
CREATE INDEX IF NOT EXISTS idx_locks_expires ON distributed_locks(expires_at);

-- Conflict log indexes
CREATE INDEX IF NOT EXISTS idx_conflict_log_table ON conflict_log(table_name);
CREATE INDEX IF NOT EXISTS idx_conflict_log_created ON conflict_log(created_at DESC);

DO $$ BEGIN RAISE NOTICE '✅ Đã tạo tất cả indexes'; END $$;

-- ==========================================
-- PHẦN 4: TẠO TRIGGER FUNCTIONS
-- ==========================================

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Version increment trigger
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version := COALESCE(OLD.version, 0) + 1;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cleanup expired locks function
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM distributed_locks WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

DO $$ BEGIN RAISE NOTICE '✅ Đã tạo trigger functions'; END $$;

-- ==========================================
-- PHẦN 5: ÁP DỤNG TRIGGERS
-- ==========================================

DO $$
DECLARE
  tbl TEXT;
  tables_with_version TEXT[] := ARRAY[
    'blog_posts', 'team_members', 'feedback', 'site_settings',
    'value_sections', 'services', 'about_sections', 'navigation_links',
    'footer_links', 'ai_system_prompts', 'user_requests', 'user_profiles'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_with_version LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
      -- Drop existing triggers
      EXECUTE format('DROP TRIGGER IF EXISTS trigger_increment_version_%I ON %I', tbl, tbl);
      EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', tbl, tbl);
      
      -- Create version trigger
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'version') THEN
        EXECUTE format('
          CREATE TRIGGER trigger_increment_version_%I
          BEFORE UPDATE ON %I
          FOR EACH ROW EXECUTE FUNCTION increment_version()
        ', tbl, tbl);
      END IF;
      
      RAISE NOTICE 'Applied triggers to %', tbl;
    END IF;
  END LOOP;
END $$;

DO $$ BEGIN RAISE NOTICE '✅ Đã áp dụng triggers cho tất cả bảng'; END $$;

-- ==========================================
-- PHẦN 6: ENABLE RLS
-- ==========================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_system_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributed_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflict_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN RAISE NOTICE '✅ Đã bật RLS cho tất cả bảng'; END $$;

-- ==========================================
-- PHẦN 7: TẠO RLS POLICIES
-- ==========================================

-- Admin users policies
DROP POLICY IF EXISTS "allow_authenticated_select_admin_users" ON admin_users;
CREATE POLICY "allow_authenticated_select_admin_users" ON admin_users
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "only_admins_can_grant_admin" ON admin_users;
CREATE POLICY "only_admins_can_grant_admin" ON admin_users
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

DROP POLICY IF EXISTS "only_admins_can_update_admin" ON admin_users;
CREATE POLICY "only_admins_can_update_admin" ON admin_users
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

DROP POLICY IF EXISTS "only_admins_can_revoke_admin" ON admin_users;
CREATE POLICY "only_admins_can_revoke_admin" ON admin_users
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- User profiles policies
DROP POLICY IF EXISTS "users_read_own_profile" ON user_profiles;
CREATE POLICY "users_read_own_profile" ON user_profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_profile" ON user_profiles;
CREATE POLICY "users_update_own_profile" ON user_profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "users_insert_own_profile" ON user_profiles;
CREATE POLICY "users_insert_own_profile" ON user_profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "admin_manage_profiles" ON user_profiles;
CREATE POLICY "admin_manage_profiles" ON user_profiles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Blog posts policies
DROP POLICY IF EXISTS "public_read_published_blog" ON blog_posts;
CREATE POLICY "public_read_published_blog" ON blog_posts
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "admin_manage_blog" ON blog_posts;
CREATE POLICY "admin_manage_blog" ON blog_posts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Team members policies
DROP POLICY IF EXISTS "public_read_team" ON team_members;
CREATE POLICY "public_read_team" ON team_members
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_team" ON team_members;
CREATE POLICY "admin_manage_team" ON team_members
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Feedback policies
DROP POLICY IF EXISTS "public_read_public_feedback" ON feedback;
CREATE POLICY "public_read_public_feedback" ON feedback
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "users_create_feedback" ON feedback;
CREATE POLICY "users_create_feedback" ON feedback
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_manage_feedback" ON feedback;
CREATE POLICY "admin_manage_feedback" ON feedback
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Site settings policies
DROP POLICY IF EXISTS "public_read_settings" ON site_settings;
CREATE POLICY "public_read_settings" ON site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_manage_settings" ON site_settings;
CREATE POLICY "admin_manage_settings" ON site_settings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Value sections policies
DROP POLICY IF EXISTS "public_read_values" ON value_sections;
CREATE POLICY "public_read_values" ON value_sections
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_values" ON value_sections;
CREATE POLICY "admin_manage_values" ON value_sections
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Services policies
DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_services" ON services;
CREATE POLICY "admin_manage_services" ON services
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- About sections policies
DROP POLICY IF EXISTS "public_read_about" ON about_sections;
CREATE POLICY "public_read_about" ON about_sections
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_about" ON about_sections;
CREATE POLICY "admin_manage_about" ON about_sections
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Navigation links policies
DROP POLICY IF EXISTS "public_read_nav" ON navigation_links;
CREATE POLICY "public_read_nav" ON navigation_links
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_nav" ON navigation_links;
CREATE POLICY "admin_manage_nav" ON navigation_links
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Footer links policies
DROP POLICY IF EXISTS "public_read_footer" ON footer_links;
CREATE POLICY "public_read_footer" ON footer_links
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_footer" ON footer_links;
CREATE POLICY "admin_manage_footer" ON footer_links
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- AI prompts policies
DROP POLICY IF EXISTS "admin_manage_prompts" ON ai_system_prompts;
CREATE POLICY "admin_manage_prompts" ON ai_system_prompts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- User requests policies
DROP POLICY IF EXISTS "users_read_own_requests" ON user_requests;
CREATE POLICY "users_read_own_requests" ON user_requests
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_create_requests" ON user_requests;
CREATE POLICY "users_create_requests" ON user_requests
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_manage_requests" ON user_requests;
CREATE POLICY "admin_manage_requests" ON user_requests
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Locks policies
DROP POLICY IF EXISTS "authenticated_manage_locks" ON distributed_locks;
CREATE POLICY "authenticated_manage_locks" ON distributed_locks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Conflict log policies
DROP POLICY IF EXISTS "insert_conflict_log" ON conflict_log;
CREATE POLICY "insert_conflict_log" ON conflict_log
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_conflicts" ON conflict_log;
CREATE POLICY "admin_read_conflicts" ON conflict_log
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

DO $$ BEGIN RAISE NOTICE '✅ Đã tạo tất cả RLS policies'; END $$;

-- ==========================================
-- PHẦN 8: XÁC MINH KẾT QUẢ
-- ==========================================

DO $$
DECLARE
  table_count INTEGER;
  policy_count INTEGER;
  index_count INTEGER;
  trigger_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies WHERE schemaname = 'public';
  
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes WHERE schemaname = 'public';
  
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers WHERE trigger_schema = 'public';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 MIGRATION HOÀN TẤT!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 Tổng số bảng: %', table_count;
  RAISE NOTICE '🔒 Tổng số RLS policies: %', policy_count;
  RAISE NOTICE '⚡ Tổng số indexes: %', index_count;
  RAISE NOTICE '🔄 Tổng số triggers: %', trigger_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📝 BƯỚC TIẾP THEO:';
  RAISE NOTICE '1. Thêm admin đầu tiên bằng lệnh:';
  RAISE NOTICE '   INSERT INTO admin_users (user_id) VALUES (''YOUR_USER_ID'');';
  RAISE NOTICE '';
  RAISE NOTICE '2. Hoặc dùng service role key để bypass RLS';
  RAISE NOTICE '';
END $$;
