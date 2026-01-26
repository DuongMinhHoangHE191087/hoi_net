-- ========================================================================
-- Migration: Add CTA (Call-to-Action) Settings
-- Description: Adds CTA content settings to site_settings table
-- Created: 2026-01-22
-- ========================================================================

-- Insert CTA settings if they don't exist
-- Note: Values must be JSON-encoded strings (wrapped in double quotes)
INSERT INTO public.site_settings (key, value, description) VALUES
  ('hero_title', '"Khôi Phục Ảnh Cũ Bằng Công Nghệ AI"', 'Tiêu đề chính của hero section'),
  ('hero_subtitle', '"Biến những bức ảnh cũ, phai màu thành những kỷ niệm sống động. Ghép ảnh gia đình một cách tự nhiên và chuyên nghiệp."', 'Mô tả phụ của hero section'),
  ('hero_cta_primary_text', '"Bắt Đầu Ngay"', 'Text của nút CTA chính trong hero'),
  ('hero_cta_primary_link', '"/register"', 'Link của nút CTA chính trong hero'),
  ('hero_cta_secondary_text', '"Tìm Hiểu Thêm"', 'Text của nút CTA phụ trong hero'),
  ('hero_cta_secondary_link', '"/about"', 'Link của nút CTA phụ trong hero'),

  ('final_cta_title', '"Sẵn Sàng Khôi Phục Ảnh?"', 'Tiêu đề của CTA cuối trang'),
  ('final_cta_subtitle', '"Tham gia cùng hàng ngàn người dùng đã tin tưởng chúng tôi để lưu giữ kỷ niệm quý giá."', 'Mô tả của CTA cuối trang'),
  ('final_cta_button_text', '"Đăng Ký Miễn Phí Ngay"', 'Text của nút CTA cuối trang'),
  ('final_cta_button_link', '"/register"', 'Link của nút CTA cuối trang')
ON CONFLICT (key) DO NOTHING;
