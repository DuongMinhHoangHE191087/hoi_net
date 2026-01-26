-- ========================================================================
-- Migration: Add Testimonials Support to Feedback Table
-- Description: Adds fields to support using feedback as public testimonials
-- Created: 2026-01-22
-- ========================================================================

-- Add testimonial-specific fields to feedback table
ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS is_testimonial BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_on_homepage BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS testimonial_image_url TEXT,
  ADD COLUMN IF NOT EXISTS position_title TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_feedback_testimonials
  ON public.feedback(is_testimonial, display_on_homepage, display_order)
  WHERE is_testimonial = true;

CREATE INDEX IF NOT EXISTS idx_feedback_featured
  ON public.feedback(is_featured, display_order)
  WHERE is_featured = true;

-- Add policy for public to read published testimonials
DROP POLICY IF EXISTS "Public can view testimonials" ON public.feedback;

CREATE POLICY "Public can view testimonials"
ON public.feedback FOR SELECT
USING (is_testimonial = true AND display_on_homepage = true);

-- Comment on new columns
COMMENT ON COLUMN public.feedback.is_testimonial IS 'Whether this feedback is approved to display as a testimonial';
COMMENT ON COLUMN public.feedback.display_on_homepage IS 'Whether to show this testimonial on the homepage';
COMMENT ON COLUMN public.feedback.testimonial_image_url IS 'Optional custom image URL for the testimonial (defaults to user avatar)';
COMMENT ON COLUMN public.feedback.position_title IS 'Job title/position of the person giving testimonial';
COMMENT ON COLUMN public.feedback.company_name IS 'Company name of the person giving testimonial';
COMMENT ON COLUMN public.feedback.display_order IS 'Order in which testimonials should be displayed (lower = first)';
COMMENT ON COLUMN public.feedback.is_featured IS 'Whether this is a featured/highlighted testimonial';

-- Insert some sample testimonials for demonstration
INSERT INTO public.feedback (
  name,
  email,
  message,
  rating,
  status,
  is_testimonial,
  display_on_homepage,
  position_title,
  company_name,
  display_order
) VALUES
  (
    'Nguyễn Văn A',
    'nguyenvana@example.com',
    'Dịch vụ khôi phục ảnh tuyệt vời! Những bức ảnh gia đình cũ của tôi đã được phục hồi đẹp như mới. Công nghệ AI thật đáng kinh ngạc!',
    5,
    'read',
    true,
    true,
    'Giám đốc',
    'ABC Company',
    1
  ),
  (
    'Trần Thị B',
    'tranthib@example.com',
    'Tôi rất ấn tượng với tốc độ và chất lượng. Chỉ vài phút là có được ảnh đẹp, rõ nét. Chắc chắn sẽ giới thiệu cho bạn bè!',
    5,
    'read',
    true,
    true,
    'Nhiếp ảnh gia',
    'Studio XYZ',
    2
  ),
  (
    'Lê Văn C',
    'levanc@example.com',
    'Công nghệ AI khôi phục ảnh thật tuyệt vời. Ảnh cưới của bố mẹ tôi từ 30 năm trước giờ đã sáng bừng lên!',
    5,
    'read',
    true,
    true,
    'Kỹ sư phần mềm',
    'Tech Corp',
    3
  ),
  (
    'Phạm Thị D',
    'phamthid@example.com',
    'Giao diện dễ sử dụng, kết quả vượt mong đợi. Những kỷ niệm quý giá của gia đình được bảo tồn hoàn hảo!',
    4,
    'read',
    true,
    true,
    'Thiết kế nội thất',
    'Design House',
    4
  ),
  (
    'Hoàng Văn E',
    'hoangvane@example.com',
    'Đội ngũ hỗ trợ nhiệt tình, chuyên nghiệp. Dịch vụ đáng tin cậy cho những ai muốn lưu giữ kỷ niệm gia đình.',
    5,
    'read',
    true,
    true,
    'Quản lý dự án',
    'PMO Solutions',
    5
  ),
  (
    'Vũ Thị F',
    'vuthif@example.com',
    'Chất lượng phục hồi ảnh vượt trội! Tôi đã thử nhiều dịch vụ khác nhưng đây là tốt nhất. Rất hài lòng!',
    5,
    'read',
    true,
    true,
    'Marketing Manager',
    'Digital Agency',
    6
  )
ON CONFLICT DO NOTHING;
