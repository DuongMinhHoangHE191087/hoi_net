-- ==========================================
-- COMPLETE DATABASE SCHEMA UPGRADE
-- File: 021_complete_schema_upgrade.sql
-- Run in Supabase SQL Editor
-- ==========================================

-- ==========================================
-- STEP 1: ENSURE ALL REQUIRED TABLES EXIST
-- ==========================================

-- Services table (for features/services displayed on homepage)
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

-- User requests table (if not exists)
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

-- User profiles table (extended)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'version') THEN
    ALTER TABLE user_profiles ADD COLUMN version INTEGER DEFAULT 1;
  END IF;
END $$;

-- ==========================================
-- STEP 2: ADD MISSING COLUMNS TO EXISTING TABLES
-- ==========================================

-- Add is_public to feedback table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedback' AND column_name = 'is_public') THEN
    ALTER TABLE feedback ADD COLUMN is_public BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_public column to feedback';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedback' AND column_name = 'is_featured') THEN
    ALTER TABLE feedback ADD COLUMN is_featured BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_featured column to feedback';
  END IF;
END $$;

-- Add is_active to team_members
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'is_active') THEN
    ALTER TABLE team_members ADD COLUMN is_active BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added is_active column to team_members';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'avatar_url') THEN
    ALTER TABLE team_members ADD COLUMN avatar_url TEXT;
    RAISE NOTICE 'Added avatar_url column to team_members';
  END IF;
END $$;

-- Add category and tags to blog_posts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'category') THEN
    ALTER TABLE blog_posts ADD COLUMN category TEXT DEFAULT 'general';
    RAISE NOTICE 'Added category column to blog_posts';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'tags') THEN
    ALTER TABLE blog_posts ADD COLUMN tags TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Added tags column to blog_posts';
  END IF;
END $$;

-- ==========================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ==========================================

-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_order ON services(display_order);

-- About sections indexes
CREATE INDEX IF NOT EXISTS idx_about_sections_active ON about_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_about_sections_order ON about_sections(display_order);

-- Navigation links indexes
CREATE INDEX IF NOT EXISTS idx_nav_links_active ON navigation_links(is_active);
CREATE INDEX IF NOT EXISTS idx_nav_links_order ON navigation_links(display_order);

-- Footer links indexes
CREATE INDEX IF NOT EXISTS idx_footer_links_active ON footer_links(is_active);
CREATE INDEX IF NOT EXISTS idx_footer_links_order ON footer_links(display_order);
CREATE INDEX IF NOT EXISTS idx_footer_links_column ON footer_links(column_name);

-- AI prompts indexes
CREATE INDEX IF NOT EXISTS idx_ai_prompts_active ON ai_system_prompts(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_category ON ai_system_prompts(category);

-- User requests indexes
CREATE INDEX IF NOT EXISTS idx_user_requests_user ON user_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_requests_status ON user_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_requests_type ON user_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_user_requests_created ON user_requests(created_at DESC);

-- ==========================================
-- STEP 4: CREATE TRIGGERS FOR NEW TABLES
-- ==========================================

-- Updated at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DO $$
DECLARE
  tables_to_trigger TEXT[] := ARRAY[
    'services', 'about_sections', 'navigation_links', 
    'footer_links', 'ai_system_prompts', 'user_requests'
  ];
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY tables_to_trigger LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', tbl, tbl);
      EXECUTE format('
        CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
      ', tbl, tbl);
      RAISE NOTICE 'Created updated_at trigger for %', tbl;
    END IF;
  END LOOP;
END $$;

-- ==========================================
-- STEP 5: ENABLE RLS ON NEW TABLES
-- ==========================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_system_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 6: CREATE RLS POLICIES FOR NEW TABLES
-- ==========================================

-- Services: Public read, admin write
DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_services" ON services;
CREATE POLICY "admin_manage_services" ON services
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- About sections: Public read, admin write
DROP POLICY IF EXISTS "public_read_about_sections" ON about_sections;
CREATE POLICY "public_read_about_sections" ON about_sections
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_about_sections" ON about_sections;
CREATE POLICY "admin_manage_about_sections" ON about_sections
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Navigation links: Public read, admin write
DROP POLICY IF EXISTS "public_read_nav_links" ON navigation_links;
CREATE POLICY "public_read_nav_links" ON navigation_links
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_nav_links" ON navigation_links;
CREATE POLICY "admin_manage_nav_links" ON navigation_links
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Footer links: Public read, admin write
DROP POLICY IF EXISTS "public_read_footer_links" ON footer_links;
CREATE POLICY "public_read_footer_links" ON footer_links
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_footer_links" ON footer_links;
CREATE POLICY "admin_manage_footer_links" ON footer_links
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- AI prompts: Admin only
DROP POLICY IF EXISTS "admin_manage_ai_prompts" ON ai_system_prompts;
CREATE POLICY "admin_manage_ai_prompts" ON ai_system_prompts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- User requests: Own requests + admin all
DROP POLICY IF EXISTS "users_own_requests" ON user_requests;
CREATE POLICY "users_own_requests" ON user_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_create_requests" ON user_requests;
CREATE POLICY "users_create_requests" ON user_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_requests" ON user_requests;
CREATE POLICY "users_update_own_requests" ON user_requests
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status = 'pending');

DROP POLICY IF EXISTS "admin_manage_all_requests" ON user_requests;
CREATE POLICY "admin_manage_all_requests" ON user_requests
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- ==========================================
-- STEP 7: INSERT DEFAULT DATA (OPTIONAL)
-- ==========================================

-- Default navigation links
INSERT INTO navigation_links (label, href, display_order, is_active)
SELECT * FROM (VALUES
  ('Trang chủ', '/', 1, true),
  ('Dịch vụ', '/services', 2, true),
  ('Blog', '/blog', 3, true),
  ('Về chúng tôi', '/about', 4, true),
  ('Liên hệ', '/contact', 5, true)
) AS v(label, href, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM navigation_links LIMIT 1);

-- Default footer links
INSERT INTO footer_links (column_name, column_title, label, href, display_order, is_active)
SELECT * FROM (VALUES
  ('company', 'Công ty', 'Về chúng tôi', '/about', 1, true),
  ('company', 'Công ty', 'Blog', '/blog', 2, true),
  ('company', 'Công ty', 'Đội ngũ', '/team', 3, true),
  ('legal', 'Pháp lý', 'Điều khoản sử dụng', '/terms', 1, true),
  ('legal', 'Pháp lý', 'Chính sách bảo mật', '/privacy', 2, true),
  ('support', 'Hỗ trợ', 'Liên hệ', '/contact', 1, true),
  ('support', 'Hỗ trợ', 'FAQ', '/faq', 2, true)
) AS v(column_name, column_title, label, href, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM footer_links LIMIT 1);

-- ==========================================
-- VERIFICATION
-- ==========================================

DO $$
DECLARE
  table_count INTEGER;
  policy_count INTEGER;
  index_count INTEGER;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('services', 'about_sections', 'navigation_links', 
                       'footer_links', 'ai_system_prompts', 'user_requests');
  
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('services', 'about_sections', 'navigation_links', 
                      'footer_links', 'ai_system_prompts', 'user_requests');
  
  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SCHEMA UPGRADE COMPLETED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 New tables created: %', table_count;
  RAISE NOTICE '🔒 RLS policies created: %', policy_count;
  RAISE NOTICE '⚡ Indexes created: %', index_count;
  RAISE NOTICE '========================================';
END $$;
