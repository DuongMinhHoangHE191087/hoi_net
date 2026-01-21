-- =====================================================
-- FIX: site_settings JSON Error
-- Issue: Column type mismatch causing JSON parse error
-- Solution: Ensure TEXT type for value column
-- =====================================================

-- 1. Check if site_settings exists
DO $$
BEGIN
  -- Drop and recreate site_settings with correct type
  DROP TABLE IF EXISTS public.site_settings CASCADE;

  CREATE TABLE public.site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT '',
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  RAISE NOTICE '✅ site_settings table created with TEXT value column';
END $$;

-- 2. Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON public.site_settings;
DROP POLICY IF EXISTS "Only admins can modify site settings" ON public.site_settings;

CREATE POLICY "Site settings are viewable by everyone"
ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Only admins can modify site settings"
ON public.site_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- 4. Grant permissions
GRANT ALL ON public.site_settings TO authenticated;
GRANT SELECT ON public.site_settings TO anon;

-- 5. Insert default settings (with proper escaping)
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
  ('ui_settings', '{}', 'UI customization settings (JSON stored as text)')
ON CONFLICT (key) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ site_settings table fixed successfully';
  RAISE NOTICE '✅ Default values inserted';
END $$;
