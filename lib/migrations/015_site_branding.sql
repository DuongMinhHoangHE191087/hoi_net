-- ============================================
-- Migration 015: Site Branding & Media Library
-- Mở rộng site_settings và tạo media_library
-- ============================================

-- Thêm các settings mới vào site_settings
-- Auto-detect if value column is JSON/JSONB or TEXT and handle accordingly
DO $$
DECLARE
  value_type text;
BEGIN
  -- Get data type of value column
  SELECT data_type INTO value_type
  FROM information_schema.columns
  WHERE table_name = 'site_settings' AND column_name = 'value';

  IF value_type IN ('json', 'jsonb') THEN
    -- Cast to JSONB if column is JSON/JSONB type
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
    RAISE NOTICE 'site_settings table does not exist yet, skipping inserts';
  WHEN others THEN
    RAISE NOTICE 'Error inserting site settings: %', SQLERRM;
END $$;

-- Tạo bảng media_library để quản lý file uploads
CREATE TABLE IF NOT EXISTS media_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'document', 'other')),
  file_size INTEGER, -- Size in bytes
  mime_type TEXT,
  alt_text TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('logo', 'favicon', 'banner', 'content', 'general')),
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for media_library
CREATE INDEX IF NOT EXISTS idx_media_library_user_id ON media_library(user_id);
CREATE INDEX IF NOT EXISTS idx_media_library_category ON media_library(category);
CREATE INDEX IF NOT EXISTS idx_media_library_file_type ON media_library(file_type);
CREATE INDEX IF NOT EXISTS idx_media_library_created_at ON media_library(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_media_library_updated_at
  BEFORE UPDATE ON media_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

-- Policies for media_library
-- Admins can do everything
CREATE POLICY "Admins can view all media" ON media_library
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()::text
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert media" ON media_library
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()::text
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update media" ON media_library
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()::text
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete media" ON media_library
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()::text
      AND user_profiles.role = 'admin'
    )
  );

-- Anyone can view public media (for displaying logos, etc.)
CREATE POLICY "Anyone can view public media" ON media_library
  FOR SELECT USING (category IN ('logo', 'favicon', 'banner'));

-- Comment
COMMENT ON TABLE media_library IS 'Centralized media library for all file uploads';
COMMENT ON COLUMN media_library.category IS 'logo, favicon, banner, content, general';
COMMENT ON COLUMN media_library.file_type IS 'image, video, document, other';
