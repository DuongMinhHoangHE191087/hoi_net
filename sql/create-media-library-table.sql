-- ============================================
-- Create Media Library Table
-- Run this in Supabase SQL Editor
-- ============================================

-- Create the media_library table
CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- File information
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'image', -- image, video, document, audio
  mime_type TEXT,
  file_size INTEGER, -- in bytes
  
  -- URLs
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  public_id TEXT, -- Cloudinary public ID for deletion
  
  -- Metadata
  alt_text TEXT,
  category TEXT DEFAULT 'general', -- logo, hero, blog, team, testimonial, general
  tags TEXT[],
  
  -- Dimensions (for images/videos)
  width INTEGER,
  height INTEGER,
  
  -- Audit
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_media_library_category ON media_library(category);
CREATE INDEX IF NOT EXISTS idx_media_library_file_type ON media_library(file_type);
CREATE INDEX IF NOT EXISTS idx_media_library_created_at ON media_library(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_library_uploaded_by ON media_library(uploaded_by);

-- Enable RLS
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow authenticated admins to do everything
CREATE POLICY "Admins can manage media" ON media_library
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'moderator')
    )
  );

-- Allow public read for published media (optional)
CREATE POLICY "Public can view media" ON media_library
  FOR SELECT
  USING (true);

-- Grant permissions
GRANT ALL ON media_library TO authenticated;
GRANT SELECT ON media_library TO anon;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_media_library_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_media_library_updated_at ON media_library;
CREATE TRIGGER trigger_media_library_updated_at
  BEFORE UPDATE ON media_library
  FOR EACH ROW
  EXECUTE FUNCTION update_media_library_updated_at();

-- ============================================
-- Success message
-- ============================================
SELECT 'media_library table created successfully!' AS result;
