-- ============================================
-- Migration 012: Site Settings Expansion
-- Dynamic Footer Links, Navigation Links, and Extended Site Settings
-- ============================================

-- ============================================
-- 0. Ensure user_profiles has role column (from migration 011)
-- ============================================
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
END $$;

-- Create helper function if not exists
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check by role column first
  IF EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Fallback: Check by email (for backwards compatibility)
  RETURN auth.email() IN (
    'admin@photoai.com',
    'duonghoang@gmail.com',
    'duongminhhoanggame@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 1. Create feedback table (fix 404 error)
-- ============================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Feedback policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can create feedback" ON public.feedback;
CREATE POLICY "Anyone can create feedback" ON public.feedback
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read all feedback" ON public.feedback;
CREATE POLICY "Admins can read all feedback" ON public.feedback
  FOR SELECT USING (is_admin_user());

DROP POLICY IF EXISTS "Admins can update feedback" ON public.feedback;
CREATE POLICY "Admins can update feedback" ON public.feedback
  FOR UPDATE USING (is_admin_user());

DROP POLICY IF EXISTS "Admins can delete feedback" ON public.feedback;
CREATE POLICY "Admins can delete feedback" ON public.feedback
  FOR DELETE USING (is_admin_user());

-- ============================================
-- 2. Create footer_links table
-- ============================================
CREATE TABLE IF NOT EXISTS public.footer_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_name TEXT NOT NULL,          -- 'products', 'company', 'legal'
  column_title TEXT NOT NULL,          -- Display title (Vietnamese)
  label TEXT NOT NULL,                 -- Link text
  href TEXT NOT NULL,                  -- URL
  is_external BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on footer_links
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;

-- Footer links policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can read active footer links" ON public.footer_links;
CREATE POLICY "Anyone can read active footer links" ON public.footer_links
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage footer links" ON public.footer_links;
CREATE POLICY "Admins can manage footer links" ON public.footer_links
  FOR ALL USING (is_admin_user());

-- Indexes for footer_links
CREATE INDEX IF NOT EXISTS idx_footer_links_column ON public.footer_links(column_name);
CREATE INDEX IF NOT EXISTS idx_footer_links_order ON public.footer_links(display_order);
CREATE INDEX IF NOT EXISTS idx_footer_links_active ON public.footer_links(is_active);

-- ============================================
-- 3. Create navigation_links table
-- ============================================
CREATE TABLE IF NOT EXISTS public.navigation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  is_external BOOLEAN DEFAULT FALSE,
  icon TEXT,                           -- Lucide icon name
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  show_in_mobile BOOLEAN DEFAULT TRUE,
  requires_auth BOOLEAN DEFAULT FALSE,
  requires_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on navigation_links
ALTER TABLE public.navigation_links ENABLE ROW LEVEL SECURITY;

-- Navigation links policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can read active navigation links" ON public.navigation_links;
CREATE POLICY "Anyone can read active navigation links" ON public.navigation_links
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage navigation links" ON public.navigation_links;
CREATE POLICY "Admins can manage navigation links" ON public.navigation_links
  FOR ALL USING (is_admin_user());

-- Indexes for navigation_links
CREATE INDEX IF NOT EXISTS idx_navigation_links_order ON public.navigation_links(display_order);
CREATE INDEX IF NOT EXISTS idx_navigation_links_active ON public.navigation_links(is_active);

-- ============================================
-- 4. Create site_settings table if not exists
-- ============================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add description column if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'description') THEN
    ALTER TABLE public.site_settings ADD COLUMN description TEXT;
  END IF;
END $$;

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Site settings policies
DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;
CREATE POLICY "Anyone can read site settings" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL USING (is_admin_user());

-- ============================================
-- 5. Insert default site_settings keys
-- ============================================
INSERT INTO public.site_settings (key, value, description) VALUES
  ('brand_name', '"Photo Restore"', 'Tên thương hiệu'),
  ('brand_slogan', '"Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI - Mang lại kỷ niệm tươi đẹp."', 'Slogan thương hiệu'),
  ('brand_logo_url', '""', 'URL logo thương hiệu'),
  ('brand_logo_type', '"icon"', 'Loại logo: icon hoặc image'),
  ('footer_description', '"Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI - Mang lại kỷ niệm tươi đẹp."', 'Mô tả footer'),
  ('footer_copyright', '"© 2026 Photo Restore. Made with ❤️ All rights reserved."', 'Text bản quyền footer'),
  ('contact_email', '"support@photorestore.com"', 'Email liên hệ'),
  ('contact_phone', '""', 'Số điện thoại liên hệ'),
  ('contact_address', '""', 'Địa chỉ liên hệ'),
  ('contact_facebook', '""', 'URL Facebook'),
  ('social_links', '{}', 'JSON chứa tất cả social media URLs'),
  ('seo_title', '"Photo Restoration App"', 'Tiêu đề SEO mặc định'),
  ('seo_description', '"Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI"', 'Meta description mặc định')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 6. Seed default footer links (only if table is empty)
-- ============================================
INSERT INTO public.footer_links (column_name, column_title, label, href, display_order)
SELECT * FROM (VALUES
  ('products', 'Sản Phẩm', 'Blog', '/blog', 1),
  ('products', 'Sản Phẩm', 'Liên Hệ', '/contact', 2),
  ('company', 'Công Ty', 'Về Chúng Tôi & Đội Ngũ', '/about', 1),
  ('legal', 'Pháp Lý', 'Điều Khoản', '/terms', 1),
  ('legal', 'Pháp Lý', 'Bảo Mật', '/privacy', 2)
) AS v(column_name, column_title, label, href, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.footer_links LIMIT 1);

-- ============================================
-- 7. Seed default navigation links (only if table is empty)
-- ============================================
INSERT INTO public.navigation_links (label, href, icon, display_order, show_in_mobile, requires_auth, requires_admin)
SELECT * FROM (VALUES
  ('Blog', '/blog', 'BookOpen', 1, true, false, false),
  ('Về Chúng Tôi', '/about', 'Users', 2, true, false, false),
  ('Liên Hệ', '/contact', 'Mail', 3, true, false, false)
) AS v(label, href, icon, display_order, show_in_mobile, requires_auth, requires_admin)
WHERE NOT EXISTS (SELECT 1 FROM public.navigation_links LIMIT 1);

-- ============================================
-- 8. Create updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to footer_links
DROP TRIGGER IF EXISTS update_footer_links_updated_at ON public.footer_links;
CREATE TRIGGER update_footer_links_updated_at
  BEFORE UPDATE ON public.footer_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to navigation_links
DROP TRIGGER IF EXISTS update_navigation_links_updated_at ON public.navigation_links;
CREATE TRIGGER update_navigation_links_updated_at
  BEFORE UPDATE ON public.navigation_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to feedback
DROP TRIGGER IF EXISTS update_feedback_updated_at ON public.feedback;
CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to site_settings
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. Grant permissions
-- ============================================
GRANT ALL ON public.footer_links TO authenticated;
GRANT SELECT ON public.footer_links TO anon;
GRANT ALL ON public.navigation_links TO authenticated;
GRANT SELECT ON public.navigation_links TO anon;
GRANT ALL ON public.feedback TO authenticated;
GRANT INSERT ON public.feedback TO anon;
GRANT ALL ON public.site_settings TO authenticated;
GRANT SELECT ON public.site_settings TO anon;

-- ============================================
-- DONE!
-- ============================================
