-- Blog Posts Table
-- Stores blog posts with rich text content

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,

  author_name TEXT NOT NULL,
  featured_image TEXT,

  published BOOLEAN DEFAULT false,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  -- Stats
  views INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_posts

-- Anyone can view published posts
CREATE POLICY "Anyone can view published posts"
  ON blog_posts
  FOR SELECT
  USING (published = true);

-- Admins can view all posts
CREATE POLICY "Admins can view all posts"
  ON blog_posts
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN (
        'admin@photoai.com',
        'duonghoang@gmail.com'
        -- Add your admin emails here
      )
    )
  );

-- Admins can insert posts
CREATE POLICY "Admins can insert posts"
  ON blog_posts
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN (
        'admin@photoai.com',
        'duonghoang@gmail.com'
      )
    )
  );

-- Admins can update posts
CREATE POLICY "Admins can update posts"
  ON blog_posts
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN (
        'admin@photoai.com',
        'duonghoang@gmail.com'
      )
    )
  );

-- Admins can delete posts
CREATE POLICY "Admins can delete posts"
  ON blog_posts
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN (
        'admin@photoai.com',
        'duonghoang@gmail.com'
      )
    )
  );

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to set published_at when published
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.published = true AND OLD.published = false THEN
    NEW.published_at = NOW();
  ELSIF NEW.published = false THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_blog_post_published_at ON blog_posts;
CREATE TRIGGER set_blog_post_published_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_published_at();

-- Grant permissions
GRANT ALL ON blog_posts TO authenticated;
GRANT SELECT ON blog_posts TO anon;

-- Comments for documentation
COMMENT ON TABLE blog_posts IS 'Blog posts with rich text content';
COMMENT ON COLUMN blog_posts.id IS 'Unique post ID';
COMMENT ON COLUMN blog_posts.author_id IS 'User who created the post';
COMMENT ON COLUMN blog_posts.title IS 'Post title (5-200 characters)';
COMMENT ON COLUMN blog_posts.slug IS 'URL-friendly slug (unique)';
COMMENT ON COLUMN blog_posts.excerpt IS 'Short summary (10-500 characters)';
COMMENT ON COLUMN blog_posts.content IS 'HTML content from rich text editor';
COMMENT ON COLUMN blog_posts.author_name IS 'Display name for author';
COMMENT ON COLUMN blog_posts.featured_image IS 'URL of featured image';
COMMENT ON COLUMN blog_posts.published IS 'Whether post is published';
COMMENT ON COLUMN blog_posts.published_at IS 'Timestamp when post was published';
COMMENT ON COLUMN blog_posts.views IS 'Number of views';
