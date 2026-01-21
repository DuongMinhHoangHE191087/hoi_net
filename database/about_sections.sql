-- Create about_sections table
CREATE TABLE IF NOT EXISTS about_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  image_url TEXT,
  image_position TEXT CHECK (image_position IN ('left', 'right')) DEFAULT 'right',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_about_sections_display_order ON about_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_about_sections_is_active ON about_sections(is_active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_about_sections_updated_at
BEFORE UPDATE ON about_sections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO about_sections (title, subtitle, description, image_url, image_position, display_order, is_active) VALUES
('Sứ Mệnh Của Chúng Tôi', 'Mang lại giá trị cho khách hàng', 'Chúng tôi cam kết mang đến dịch vụ khôi phục ảnh chất lượng cao nhất, giúp lưu giữ những kỷ niệm quý giá của mọi gia đình. Với công nghệ AI tiên tiến và đội ngũ chuyên nghiệp, chúng tôi biến những bức ảnh cũ phai màu thành những tác phẩm nghệ thuật sống động.', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800', 'right', 1, true),
('Tầm Nhìn', 'Trở thành nền tảng hàng đầu', 'Chúng tôi hướng tới việc trở thành nền tảng khôi phục ảnh AI hàng đầu tại Việt Nam, mang đến trải nghiệm tốt nhất cho người dùng. Chúng tôi không ngừng đổi mới công nghệ và cải thiện chất lượng dịch vụ để đáp ứng nhu cầu ngày càng cao của khách hàng.', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', 'left', 2, true),
('Giá Trị Cốt Lõi', 'Những gì chúng tôi tin tưởng', 'Chất lượng là ưu tiên hàng đầu - Đổi mới không ngừng - Khách hàng là trung tâm - Minh bạch trong mọi giao dịch - Tận tâm với từng sản phẩm. Đây là những giá trị định hướng mọi hoạt động của chúng tôi.', 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800', 'right', 3, true);
