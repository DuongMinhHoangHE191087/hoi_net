-- ==========================================
-- COMPLETE DATABASE SETUP FOR WEB-SSG
-- Chạy script này trên Supabase SQL Editor
-- ==========================================

-- ==========================================
-- PART 1: TRIGGER FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- PART 2: CREATE ALL TABLES
-- ==========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('restore', 'family')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  description TEXT NOT NULL,
  image_urls TEXT[] NOT NULL,
  result_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts table
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

-- Team members table
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

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Value sections table (Mission, Vision, Values)
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

-- ==========================================
-- PART 3: CREATE INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_team_members_order ON team_members(display_order);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_value_sections_order ON value_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_value_sections_active ON value_sections(is_active);

-- ==========================================
-- PART 4: CREATE TRIGGERS
-- ==========================================

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_value_sections_updated_at
  BEFORE UPDATE ON value_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- PART 5: ENABLE ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_sections ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PART 6: CREATE POLICIES
-- ==========================================

-- Users policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Requests policies
CREATE POLICY "Users can view own requests" ON requests
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own requests" ON requests
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own requests" ON requests
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Blog posts policies
CREATE POLICY "Anyone can view published blog posts" ON blog_posts
  FOR SELECT USING (published = true);

-- Allow all operations for now (add admin check later)
CREATE POLICY "Allow all blog operations" ON blog_posts
  FOR ALL USING (true) WITH CHECK (true);

-- Team members policies
CREATE POLICY "Anyone can view team members" ON team_members
  FOR SELECT USING (true);

-- Allow all operations for now
CREATE POLICY "Allow all team operations" ON team_members
  FOR ALL USING (true) WITH CHECK (true);

-- Feedback policies
CREATE POLICY "Users can create feedback" ON feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Allow viewing all for admin
CREATE POLICY "Allow viewing all feedback" ON feedback
  FOR SELECT USING (true);

-- Site settings policies
CREATE POLICY "Anyone can view site settings" ON site_settings
  FOR SELECT USING (true);

-- Allow all operations for now
CREATE POLICY "Allow all settings operations" ON site_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Value sections policies
CREATE POLICY "Anyone can view active value sections" ON value_sections
  FOR SELECT USING (is_active = true);

-- Allow viewing all sections
CREATE POLICY "Allow viewing all sections" ON value_sections
  FOR SELECT USING (true);

-- Allow all operations for now
CREATE POLICY "Allow all sections operations" ON value_sections
  FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- PART 7: INSERT SAMPLE DATA
-- ==========================================

-- Insert site settings
INSERT INTO site_settings (key, value, description) VALUES
  ('mission', 'Sứ mệnh của chúng tôi là mang công nghệ AI đến gần hơn với mọi người, giúp khôi phục những kỷ niệm quý giá.', 'Mission statement'),
  ('vision', 'Trở thành nền tảng khôi phục ảnh hàng đầu Việt Nam.', 'Vision statement'),
  ('about', 'Chúng tôi là đội ngũ chuyên gia về AI và xử lý ảnh, với hơn 10 năm kinh nghiệm.', 'About us description'),
  ('company_name', 'PhotoAI Restore', 'Company name'),
  ('email', 'contact@photoai.com', 'Contact email'),
  ('phone', '0123 456 789', 'Contact phone')
ON CONFLICT (key) DO NOTHING;

-- Insert value sections
INSERT INTO value_sections (title, description, icon, gradient, display_order, is_active) VALUES
  ('Sứ Mệnh', 'Mang lại giá trị cho khách hàng thông qua công nghệ AI tiên tiến, giúp khôi phục và lưu giữ những kỷ niệm quý giá của mọi gia đình.', 'Target', 'from-pink-500 via-rose-500 to-red-500', 1, true),
  ('Tầm Nhìn', 'Trở thành nền tảng hàng đầu về khôi phục ảnh AI tại Việt Nam, mang đến trải nghiệm tốt nhất cho người dùng.', 'Eye', 'from-yellow-500 via-orange-500 to-amber-500', 2, true),
  ('Giá Trị Cốt Lõi', 'Chất lượng - Đổi mới - Khách hàng là trung tâm - Minh bạch - Tận tâm với từng sản phẩm.', 'Heart', 'from-purple-500 via-pink-500 to-rose-500', 3, true)
ON CONFLICT DO NOTHING;

-- Insert team members
INSERT INTO team_members (name, role, bio, avatar, display_order, social_links) VALUES
  (
    'Nguyễn Văn A',
    'CEO & Founder',
    'Chuyên gia AI với hơn 10 năm kinh nghiệm trong lĩnh vực xử lý ảnh và machine learning. Đam mê mang công nghệ đến gần hơn với mọi người.',
    'https://i.pravatar.cc/300?img=12',
    1,
    '{"linkedin": "https://linkedin.com", "twitter": "https://twitter.com"}'::jsonb
  ),
  (
    'Trần Thị B',
    'CTO',
    'Kỹ sư phần mềm senior với chuyên môn sâu về Computer Vision và Deep Learning. Đã phát triển nhiều hệ thống AI quy mô lớn.',
    'https://i.pravatar.cc/300?img=5',
    2,
    '{"linkedin": "https://linkedin.com", "github": "https://github.com"}'::jsonb
  ),
  (
    'Lê Văn C',
    'Lead Developer',
    'Full-stack developer đam mê công nghệ AI/ML. Có kinh nghiệm xây dựng các ứng dụng web hiệu năng cao và thân thiện với người dùng.',
    'https://i.pravatar.cc/300?img=33',
    3,
    '{"github": "https://github.com", "twitter": "https://twitter.com"}'::jsonb
  ),
  (
    'Phạm Thị D',
    'UI/UX Designer',
    'Designer sáng tạo với kinh nghiệm thiết kế giao diện người dùng cho các ứng dụng công nghệ. Tập trung vào trải nghiệm người dùng tối ưu.',
    'https://i.pravatar.cc/300?img=47',
    4,
    '{"linkedin": "https://linkedin.com"}'::jsonb
  );

-- Insert blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, author_name, author_avatar, featured_image, published) VALUES
  (
    'Công Nghệ AI Trong Khôi Phục Ảnh - Tương Lai Đã Đến',
    'cong-nghe-ai-khoi-phuc-anh',
    'Khám phá cách công nghệ AI đang cách mạng hóa lĩnh vực khôi phục ảnh cũ, mang lại những kết quả đáng kinh ngạc.',
    '<h2>Giới Thiệu</h2>
    <p>Trong những năm gần đây, công nghệ trí tuệ nhân tạo (AI) đã có những bước tiến vượt bậc trong nhiều lĩnh vực, và khôi phục ảnh cũ là một trong những ứng dụng nổi bật nhất.</p>

    <h2>Cách AI Hoạt Động</h2>
    <p>AI sử dụng các mạng neural sâu (Deep Neural Networks) được huấn luyện trên hàng triệu bức ảnh để học cách:</p>
    <ul>
      <li>Nhận diện và phục hồi vùng bị hư hỏng</li>
      <li>Tăng cường độ phân giải và chi tiết</li>
      <li>Khôi phục màu sắc tự nhiên</li>
      <li>Loại bỏ nhiễu và vết xước</li>
    </ul>

    <h2>Kết Quả Ấn Tượng</h2>
    <p>Với công nghệ AI hiện đại, chúng ta có thể biến những bức ảnh cũ kỹ, phai màu thành những kỷ niệm sống động như mới chụp.</p>',
    'Nguyễn Văn A',
    'https://i.pravatar.cc/150?img=12',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
    true
  ),
  (
    'Hướng Dẫn Ghép Ảnh Gia Đình Hoàn Hảo',
    'huong-dan-ghep-anh-gia-dinh',
    'Những bí quyết và kỹ thuật để tạo ra những bức ảnh gia đình đẹp và tự nhiên nhất.',
    '<h2>Chuẩn Bị</h2>
    <p>Để có được bức ảnh gia đình đẹp khi ghép, bạn cần chú ý đến:</p>

    <h3>1. Chất Lượng Ảnh Gốc</h3>
    <ul>
      <li>Độ phân giải cao nhất có thể</li>
      <li>Ánh sáng đồng đều</li>
      <li>Góc chụp phù hợp</li>
    </ul>

    <h3>2. Sự Tương Đồng</h3>
    <ul>
      <li>Cùng điều kiện ánh sáng</li>
      <li>Tỷ lệ kích thước phù hợp</li>
      <li>Tông màu hài hòa</li>
    </ul>

    <h2>Quy Trình Ghép</h2>
    <p>AI của chúng tôi sẽ tự động:</p>
    <ol>
      <li>Phân tích và điều chỉnh tông màu</li>
      <li>Cân bằng ánh sáng</li>
      <li>Làm mượt ranh giới ghép nối</li>
      <li>Tối ưu hóa kết quả cuối cùng</li>
    </ol>',
    'Trần Thị B',
    'https://i.pravatar.cc/150?img=5',
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800',
    true
  ),
  (
    '5 Mẹo Bảo Quản Ảnh Cũ Tốt Nhất',
    '5-meo-bao-quan-anh-cu',
    'Hướng dẫn chi tiết cách bảo quản và lưu trữ ảnh cũ để giữ được lâu dài.',
    '<h2>Tại Sao Cần Bảo Quản Ảnh Cũ?</h2>
    <p>Ảnh giấy truyền thống dễ bị hư hỏng theo thời gian do nhiều yếu tố như độ ẩm, ánh sáng, nhiệt độ...</p>

    <h2>5 Mẹo Quan Trọng</h2>

    <h3>1. Tránh Ánh Sáng Trực Tiếp</h3>
    <p>Bảo quản ảnh ở nơi tối, tránh ánh sáng mặt trời và đèn huỳnh quang.</p>

    <h3>2. Kiểm Soát Độ Ẩm</h3>
    <p>Độ ẩm lý tưởng từ 30-40%. Quá ẩm sẽ gây mốc, quá khô sẽ làm ảnh giòn.</p>

    <h3>3. Nhiệt Độ Ổn Định</h3>
    <p>Nhiệt độ tốt nhất từ 15-20°C, tránh biến đổi nhiệt độ đột ngột.</p>

    <h3>4. Sử Dụng Album Chất Lượng</h3>
    <p>Chọn album không chứa acid (acid-free) để bảo vệ ảnh lâu dài.</p>

    <h3>5. Số Hóa Ảnh</h3>
    <p>Cách tốt nhất là scan và lưu trữ kỹ thuật số, có thể dùng dịch vụ AI để khôi phục và tăng chất lượng.</p>',
    'Lê Văn C',
    'https://i.pravatar.cc/150?img=33',
    'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=800',
    true
  );

-- ==========================================
-- COMPLETION MESSAGE
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database setup completed successfully!';
  RAISE NOTICE '📊 Created tables: users, requests, blog_posts, team_members, feedback, site_settings, value_sections';
  RAISE NOTICE '🔒 Row Level Security enabled';
  RAISE NOTICE '📝 Sample data inserted';
  RAISE NOTICE '🚀 You can now use the application!';
END $$;
