-- Create features table
CREATE TABLE IF NOT EXISTS features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_type TEXT NOT NULL DEFAULT 'lucide' CHECK (icon_type IN ('lucide', 'image')),
  icon_value TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add avatar_url column to team_members if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE team_members ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Create index on display_order for better performance
CREATE INDEX IF NOT EXISTS features_display_order_idx ON features(display_order);
CREATE INDEX IF NOT EXISTS features_is_active_idx ON features(is_active);

-- Enable RLS on features table
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read active features" ON features;
DROP POLICY IF EXISTS "Anyone can read all features" ON features;
DROP POLICY IF EXISTS "Authenticated users can insert features" ON features;
DROP POLICY IF EXISTS "Authenticated users can update features" ON features;
DROP POLICY IF EXISTS "Authenticated users can delete features" ON features;

-- Create policies for features table
-- Anyone can read active features
CREATE POLICY "Anyone can read active features"
  ON features FOR SELECT
  USING (is_active = true);

-- Anyone can read all features (for admin preview)
CREATE POLICY "Anyone can read all features"
  ON features FOR SELECT
  USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can insert features"
  ON features FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update features"
  ON features FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete features"
  ON features FOR DELETE
  TO authenticated
  USING (true);

-- Insert default features (expanded with more photo restoration features)
INSERT INTO features (title, description, icon_type, icon_value, display_order, is_active)
VALUES
  ('Khôi Phục Ảnh Bằng AI', 'Sử dụng công nghệ AI tiên tiến để khôi phục ảnh cũ, phai màu, hư hỏng một cách hoàn hảo.', 'lucide', 'Sparkles', 0, true),
  ('Ghép Ảnh Gia Đình', 'Ghép ảnh của bạn vào các bức ảnh gia đình một cách tự nhiên và chuyên nghiệp.', 'lucide', 'ImagePlus', 1, true),
  ('Tăng Cường Độ Phân Giải', 'Nâng cao độ phân giải ảnh lên 4K/8K với công nghệ AI upscaling hiện đại.', 'lucide', 'TrendingUp', 2, true),
  ('Xử Lý Nhanh Chóng', 'Nhận kết quả trong vài phút với hệ thống xử lý AI tốc độ cao.', 'lucide', 'Zap', 3, true),
  ('Màu Sắc Tự Nhiên', 'Tô màu tự động cho ảnh đen trắng với độ chính xác cao, màu sắc tự nhiên.', 'lucide', 'Palette', 4, true),
  ('Loại Bỏ Nhiễu & Vết', 'Tự động phát hiện và loại bỏ nhiễu, vết xước, vết bẩn trên ảnh cũ.', 'lucide', 'Filter', 5, true),
  ('Dễ Dàng Sử Dụng', 'Giao diện đơn giản, chỉ cần tải ảnh lên và AI làm phần còn lại.', 'lucide', 'Users', 6, true),
  ('Bảo Mật Tuyệt Đối', 'Ảnh của bạn được mã hóa và bảo vệ an toàn, tự động xóa sau khi xử lý.', 'lucide', 'Shield', 7, true),
  ('Chỉnh Sửa Thông Minh', 'AI tự động phát hiện khuôn mặt, điều chỉnh ánh sáng, cân bằng màu sắc.', 'lucide', 'Wand2', 8, false),
  ('Lưu Trữ Cloud', 'Lưu trữ ảnh đã khôi phục an toàn trên cloud, truy cập mọi lúc mọi nơi.', 'lucide', 'Database', 9, false),
  ('Xóa Phông Nền', 'Tự động xóa phông nền ảnh một cách chính xác với công nghệ AI.', 'lucide', 'Eye', 10, false),
  ('Chất Lượng Cao', 'Kết quả đầu ra chất lượng cao, phù hợp cho in ấn và lưu giữ lâu dài.', 'lucide', 'Award', 11, false)
ON CONFLICT DO NOTHING;

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS features_updated_at_trigger ON features;
DROP FUNCTION IF EXISTS update_features_updated_at();

CREATE OR REPLACE FUNCTION update_features_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER features_updated_at_trigger
  BEFORE UPDATE ON features
  FOR EACH ROW
  EXECUTE FUNCTION update_features_updated_at();
