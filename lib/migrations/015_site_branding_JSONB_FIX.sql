-- ============================================
-- QUICK FIX: Check Site Settings Schema First
-- ============================================

-- Check schema của bảng site_settings
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'site_settings'
ORDER BY ordinal_position;

-- Nếu value là JSONB/JSON, chạy migration này:
-- ============================================
-- Migration 015: Site Branding & Media Library (FIXED for JSONB)
-- ============================================

-- Thêm các settings mới vào site_settings
-- Cast TEXT values sang JSONB
DO $$
BEGIN
  INSERT INTO site_settings (key, value, description) VALUES
    ('site_name', to_jsonb('Photo Restore'::text), 'Tên website'),
    ('site_tagline', to_jsonb('Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI'::text), 'Slogan/tagline của website'),
    ('site_logo_url', to_jsonb(''::text), 'URL logo chính'),
    ('site_logo_dark_url', to_jsonb(''::text), 'URL logo dark mode'),
    ('site_favicon_url', to_jsonb(''::text), 'URL favicon'),
    ('site_meta_title', to_jsonb('Photo Restoration App - Khôi phục ảnh bằng AI'::text), 'Meta title cho SEO'),
    ('site_meta_description', to_jsonb('Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI - Mang lại kỷ niệm tươi đẹp'::text), 'Meta description cho SEO'),
    ('site_meta_keywords', to_jsonb('khôi phục ảnh, AI, photo restoration, ghép ảnh gia đình'::text), 'Meta keywords'),
    ('site_og_image', to_jsonb(''::text), 'Open Graph image cho social media'),
    ('theme_primary_color', to_jsonb('#ec4899'::text), 'Màu chủ đạo (pink-500)'),
    ('theme_secondary_color', to_jsonb('#f59e0b'::text), 'Màu phụ (amber-500)'),
    ('google_analytics_id', to_jsonb(''::text), 'Google Analytics ID'),
    ('google_tag_manager_id', to_jsonb(''::text), 'Google Tag Manager ID'),
    ('custom_css', to_jsonb(''::text), 'Custom CSS code'),
    ('custom_js', to_jsonb(''::text), 'Custom JavaScript code'),
    ('maintenance_mode', to_jsonb('false'::text), 'Chế độ bảo trì (true/false)'),
    ('announcement_bar_enabled', to_jsonb('false'::text), 'Hiển thị announcement bar'),
    ('announcement_bar_text', to_jsonb(''::text), 'Nội dung announcement bar'),
    ('announcement_bar_color', to_jsonb('blue'::text), 'Màu announcement bar (blue/green/yellow/red)')
  ON CONFLICT (key) DO NOTHING;
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'site_settings table does not exist yet, skipping inserts';
  WHEN others THEN
    RAISE NOTICE 'Error inserting site settings: %', SQLERRM;
END $$;

-- Nếu value là TEXT (không phải JSON), chạy migration này:
-- ============================================
-- Alternative: If value is TEXT type
-- ============================================

DO $$
DECLARE
  value_type text;
BEGIN
  -- Get data type of value column
  SELECT data_type INTO value_type
  FROM information_schema.columns
  WHERE table_name = 'site_settings' AND column_name = 'value';

  IF value_type IN ('json', 'jsonb') THEN
    -- Cast to JSON
    INSERT INTO site_settings (key, value, description) VALUES
      ('site_name', to_jsonb('Photo Restore'::text), 'Tên website'),
      ('site_tagline', to_jsonb('Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI'::text), 'Slogan/tagline của website'),
      ('site_logo_url', to_jsonb(''::text), 'URL logo chính'),
      ('site_logo_dark_url', to_jsonb(''::text), 'URL logo dark mode'),
      ('site_favicon_url', to_jsonb(''::text), 'URL favicon'),
      ('site_meta_title', to_jsonb('Photo Restoration App - Khôi phục ảnh bằng AI'::text), 'Meta title cho SEO'),
      ('site_meta_description', to_jsonb('Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI - Mang lại kỷ niệm tươi đẹp'::text), 'Meta description cho SEO'),
      ('site_meta_keywords', to_jsonb('khôi phục ảnh, AI, photo restoration, ghép ảnh gia đình'::text), 'Meta keywords'),
      ('site_og_image', to_jsonb(''::text), 'Open Graph image cho social media'),
      ('theme_primary_color', to_jsonb('#ec4899'::text), 'Màu chủ đạo (pink-500)'),
      ('theme_secondary_color', to_jsonb('#f59e0b'::text), 'Màu phụ (amber-500)'),
      ('google_analytics_id', to_jsonb(''::text), 'Google Analytics ID'),
      ('google_tag_manager_id', to_jsonb(''::text), 'Google Tag Manager ID'),
      ('custom_css', to_jsonb(''::text), 'Custom CSS code'),
      ('custom_js', to_jsonb(''::text), 'Custom JavaScript code'),
      ('maintenance_mode', to_jsonb('false'::text), 'Chế độ bảo trì (true/false)'),
      ('announcement_bar_enabled', to_jsonb('false'::text), 'Hiển thị announcement bar'),
      ('announcement_bar_text', to_jsonb(''::text), 'Nội dung announcement bar'),
      ('announcement_bar_color', to_jsonb('blue'::text), 'Màu announcement bar (blue/green/yellow/red)')
    ON CONFLICT (key) DO NOTHING;
  ELSE
    -- Plain TEXT type
    INSERT INTO site_settings (key, value, description) VALUES
      ('site_name', 'Photo Restore', 'Tên website'),
      ('site_tagline', 'Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI', 'Slogan/tagline của website'),
      ('site_logo_url', '', 'URL logo chính'),
      ('site_logo_dark_url', '', 'URL logo dark mode'),
      ('site_favicon_url', '', 'URL favicon'),
      ('site_meta_title', 'Photo Restoration App - Khôi phục ảnh bằng AI', 'Meta title cho SEO'),
      ('site_meta_description', 'Khôi phục ảnh cũ và ghép ảnh gia đình bằng AI - Mang lại kỷ niệm tươi đẹp', 'Meta description cho SEO'),
      ('site_meta_keywords', 'khôi phục ảnh, AI, photo restoration, ghép ảnh gia đình', 'Meta keywords'),
      ('site_og_image', '', 'Open Graph image cho social media'),
      ('theme_primary_color', '#ec4899', 'Màu chủ đạo (pink-500)'),
      ('theme_secondary_color', '#f59e0b', 'Màu phụ (amber-500)'),
      ('google_analytics_id', '', 'Google Analytics ID'),
      ('google_tag_manager_id', '', 'Google Tag Manager ID'),
      ('custom_css', '', 'Custom CSS code'),
      ('custom_js', '', 'Custom JavaScript code'),
      ('maintenance_mode', 'false', 'Chế độ bảo trì (true/false)'),
      ('announcement_bar_enabled', 'false', 'Hiển thị announcement bar'),
      ('announcement_bar_text', '', 'Nội dung announcement bar'),
      ('announcement_bar_color', 'blue', 'Màu announcement bar (blue/green/yellow/red)')
    ON CONFLICT (key) DO NOTHING;
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'site_settings table does not exist yet';
  WHEN others THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END $$;
