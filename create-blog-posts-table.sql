-- ================================================
-- CREATE BLOG_POSTS TABLE
-- Run this in Supabase SQL Editor
-- ================================================

-- Create blog_posts table (matches the app's TypeScript type)
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_posts
-- Anyone can view published blog posts
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
CREATE POLICY "Anyone can view published blog posts" ON blog_posts
  FOR SELECT USING (published = true);

-- Grant permissions
GRANT ALL ON blog_posts TO authenticated;
GRANT SELECT ON blog_posts TO anon;

-- Insert sample blog post (optional - remove if not needed)
INSERT INTO blog_posts (title, slug, excerpt, content, author_name, author_avatar, featured_image, published)
VALUES (
  'Khôi Phục Ảnh Cũ Với AI - Tương Lai Của Lưu Giữ Kỷ Niệm',
  'khoi-phuc-anh-cu-voi-ai',
  'Khám phá công nghệ AI tiên tiến giúp khôi phục những bức ảnh gia đình quý giá của bạn, mang lại màu sắc mới cho ký ức xưa.',
  '<h2>Giới Thiệu</h2><p>Công nghệ AI đã thay đổi cách chúng ta lưu giữ và khôi phục những kỷ niệm quý giá. Với Photo AI, bạn có thể...</p>',
  'Photo AI Team',
  NULL,
  'https://images.unsplash.com/photo-1551847812-b84d5985a8fc?w=800',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Verify table created successfully
SELECT
  'blog_posts' as table_name,
  COUNT(*) as row_count,
  string_agg(DISTINCT CASE WHEN published THEN 'published' ELSE 'draft' END, ', ') as status_types
FROM blog_posts;

-- Show table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'blog_posts'
ORDER BY ordinal_position;
