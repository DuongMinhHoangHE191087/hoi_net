-- ============================================================
-- Migration 041: Nội dung trang About song ngữ (VI/EN)
-- ------------------------------------------------------------
-- CHỈ THÊM MỚI (additive): tạo 4 bảng riêng + seed dữ liệu mock.
--   * Không DROP / ALTER / UPDATE bất kỳ bảng hay dòng dữ liệu hiện có
--     (chỉ DROP POLICY/TRIGGER của chính 4 bảng company_* mới tạo, để chạy lại được).
--   * Idempotent: chạy lại nhiều lần an toàn (IF NOT EXISTS, ON CONFLICT DO NOTHING).
--   * Phụ thuộc: hàm is_admin_user() và update_updated_at_column() đã có sẵn.
-- Sinh tự động từ lib/about-content.ts. Tất cả dữ liệu seed là [MOCK] —
-- sửa trực tiếp trong Supabase Table Editor (cột *_vi = Tiếng Việt, *_en = English).
-- Website đọc các bảng này; nếu bảng trống hoặc lỗi, website tự dùng bản hardcode dự phòng.
-- ============================================================

BEGIN;

-- 1. Mốc phát triển ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  period TEXT NOT NULL CHECK (period ~ '^[0-9]{4}-[0-9]{2}$'),
  title_vi TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_vi TEXT NOT NULL,
  description_en TEXT NOT NULL,
  is_upcoming BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.company_milestones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "company_milestones_public_read" ON public.company_milestones;
CREATE POLICY "company_milestones_public_read" ON public.company_milestones FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "company_milestones_admin_all" ON public.company_milestones;
CREATE POLICY "company_milestones_admin_all" ON public.company_milestones FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());
DROP TRIGGER IF EXISTS trg_company_milestones_updated_at ON public.company_milestones;
CREATE TRIGGER trg_company_milestones_updated_at BEFORE UPDATE ON public.company_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
GRANT SELECT ON public.company_milestones TO anon;
GRANT ALL ON public.company_milestones TO authenticated;

-- 2. Thành tựu & ghi nhận ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  year INTEGER NOT NULL,
  tone TEXT NOT NULL DEFAULT 'pink' CHECK (tone IN ('pink','blue','green','orange','purple','cyan')),
  rank_vi TEXT NOT NULL,
  rank_en TEXT NOT NULL,
  title_vi TEXT NOT NULL,
  title_en TEXT NOT NULL,
  issuer_vi TEXT NOT NULL,
  issuer_en TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.company_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "company_achievements_public_read" ON public.company_achievements;
CREATE POLICY "company_achievements_public_read" ON public.company_achievements FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "company_achievements_admin_all" ON public.company_achievements;
CREATE POLICY "company_achievements_admin_all" ON public.company_achievements FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());
DROP TRIGGER IF EXISTS trg_company_achievements_updated_at ON public.company_achievements;
CREATE TRIGGER trg_company_achievements_updated_at BEFORE UPDATE ON public.company_achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
GRANT SELECT ON public.company_achievements TO anon;
GRANT ALL ON public.company_achievements TO authenticated;

-- 3. Ban lãnh đạo ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_leaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'pink' CHECK (tone IN ('pink','blue','green','orange','purple','cyan')),
  role_vi TEXT NOT NULL,
  role_en TEXT NOT NULL,
  bio_vi TEXT NOT NULL,
  bio_en TEXT NOT NULL,
  avatar_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.company_leaders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "company_leaders_public_read" ON public.company_leaders;
CREATE POLICY "company_leaders_public_read" ON public.company_leaders FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "company_leaders_admin_all" ON public.company_leaders;
CREATE POLICY "company_leaders_admin_all" ON public.company_leaders FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());
DROP TRIGGER IF EXISTS trg_company_leaders_updated_at ON public.company_leaders;
CREATE TRIGGER trg_company_leaders_updated_at BEFORE UPDATE ON public.company_leaders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
GRANT SELECT ON public.company_leaders TO anon;
GRANT ALL ON public.company_leaders TO authenticated;

-- 4. Số liệu nổi bật ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  value NUMERIC NOT NULL,
  prefix TEXT,
  suffix_vi TEXT,
  suffix_en TEXT,
  icon TEXT NOT NULL DEFAULT 'image' CHECK (icon IN ('image','users','map','smile','clock','calendar')),
  label_vi TEXT NOT NULL,
  label_en TEXT NOT NULL,
  description_vi TEXT NOT NULL,
  description_en TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.company_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "company_stats_public_read" ON public.company_stats;
CREATE POLICY "company_stats_public_read" ON public.company_stats FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "company_stats_admin_all" ON public.company_stats;
CREATE POLICY "company_stats_admin_all" ON public.company_stats FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());
DROP TRIGGER IF EXISTS trg_company_stats_updated_at ON public.company_stats;
CREATE TRIGGER trg_company_stats_updated_at BEFORE UPDATE ON public.company_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
GRANT SELECT ON public.company_stats TO anon;
GRANT ALL ON public.company_stats TO authenticated;

-- 5. Seed dữ liệu mock -------------------------------------------------------
INSERT INTO public.company_milestones (slug, period, title_vi, title_en, description_vi, description_en, is_upcoming, display_order) VALUES
  ('ms-2025-09', '2025-09', 'Thành lập', 'Company founded', 'Công ty TNHH Công nghệ Hồi Nét được thành lập tại Hà Nội và khởi động dự án Hồi Nét — dự án phi lợi nhuận phục chế ảnh cũ bằng AI.', 'Hoi Net Technology Co., Ltd. is founded in Hanoi and launches Hoi Net — a non-profit AI photo-restoration project.', false, 10),
  ('ms-2025-10', '2025-10', 'Nghiên cứu & thử nghiệm', 'Research & experiments', 'Xây dựng bộ ảnh mẫu, thử nghiệm và so sánh các mô hình AI cho bài toán khử nhiễu, làm nét và phục hồi chi tiết khuôn mặt.', 'Built a sample dataset and benchmarked AI models for denoising, sharpening and face-detail recovery.', false, 20),
  ('ms-2025-12', '2025-12', 'Closed beta', 'Closed beta', 'Mở thử nghiệm kín cho 200 người dùng đầu tiên, bổ sung tính năng tô màu ảnh trắng đen dựa trên phản hồi thực tế.', 'Opened a closed beta to the first 200 users and added B&W colorization based on real feedback.', false, 30),
  ('ms-2026-02', '2026-02', 'Ra mắt công khai', 'Public launch', 'Chính thức ra mắt website hoinet.tech với dịch vụ phục chế, làm nét và tô màu ảnh cũ miễn phí cho mọi người.', 'Officially launched hoinet.tech with free photo restoration, sharpening and colorization for everyone.', false, 40),
  ('ms-2026-04', '2026-04', 'Ghép ảnh gia đình & Studio', 'Family collage & Studio', 'Thêm tính năng ghép ảnh gia đình và Studio chỉnh sửa trực tuyến, tách nền ngay trên trình duyệt.', 'Added family photo compositing and an online Studio with in-browser background removal.', false, 50),
  ('ms-2026-06', '2026-06', 'Mốc 25.000 ảnh', '25,000 photos', 'Hoàn thành phục chế hơn 25.000 bức ảnh; nâng cấp hàng đợi xử lý để rút ngắn thời gian chờ xuống còn vài phút.', 'Restored more than 25,000 photos and upgraded the processing queue to cut waiting time to minutes.', false, 60),
  ('ms-2026-08', '2026-08', 'Cộng đồng đóng góp', 'Community contributions', 'Ra mắt trang đóng góp minh bạch để duy trì chi phí hạ tầng, giữ dịch vụ cơ bản luôn miễn phí.', 'Launched a transparent contribution page to sustain infrastructure costs and keep core services free.', false, 70),
  ('ms-2026-09', '2026-09', 'Tròn 1 năm hoạt động', 'One year milestone', 'Vượt mốc 100.000 ảnh phục chế và 30.000 người dùng; đội ngũ mở rộng thêm các vị trí kỹ thuật và vận hành tại Hà Nội.', 'Passed 100,000 restored photos and 30,000 users; the Hanoi team grew with new engineering and operations roles.', false, 80),
  ('ms-2026-12', '2026-12', 'Lộ trình sắp tới', 'Coming next', 'Nâng cấp chất lượng phục chế, hỗ trợ xử lý hàng loạt và mở rộng chương trình phục chế ảnh tư liệu cho cộng đồng.', 'Higher restoration quality, batch processing, and an expanded archival-photo programme for the community.', true, 90)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.company_achievements (slug, year, tone, rank_vi, rank_en, title_vi, title_en, issuer_vi, issuer_en, display_order) VALUES
  ('ach-technology-for-community-projects', 2026, 'pink', 'Top 10', 'Top 10', 'Dự án Công nghệ vì Cộng đồng', 'Technology for Community Projects', 'Hội đồng Đổi mới Sáng tạo Cộng đồng', 'Community Innovation Council', 10),
  ('ach-fastest-growing-social-startup', 2026, 'orange', 'Hạng nhất', '1st place', 'Startup Xã hội Tăng trưởng Nhanh nhất', 'Fastest-Growing Social Startup', 'Giải thưởng Startup Việt Tác động', 'Vietnam Impact Startup Awards', 20),
  ('ach-humane-ai-application-of-the-year', 2026, 'purple', 'Bình chọn', 'People’s choice', 'Ứng dụng AI Nhân văn của năm', 'Humane AI Application of the Year', 'Bình chọn Cộng đồng Công nghệ', 'Tech Community Vote', 30),
  ('ach-ai-product-for-families', 2026, 'blue', 'Giải Bạc', 'Silver award', 'Sản phẩm AI dành cho Gia đình', 'AI Product for Families', 'Diễn đàn Sản phẩm Số Việt Nam', 'Vietnam Digital Product Forum', 40),
  ('ach-promising-startup-project', 2025, 'green', 'Xuất sắc', 'Outstanding', 'Dự án Khởi nghiệp Tiềm năng', 'Promising Startup Project', 'Chương trình Khởi nghiệp Sáng tạo Hà Nội', 'Hanoi Creative Startup Programme', 50),
  ('ach-100-000-photos-brought-back-to-life', 2026, 'cyan', 'Cột mốc', 'Milestone', '100.000 bức ảnh được hồi sinh', '100,000 photos brought back to life', 'Cộng đồng Hồi Nét', 'The Hoi Net community', 60)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.company_leaders (slug, name, tone, role_vi, role_en, bio_vi, bio_en, display_order) VALUES
  ('lead-duong-minh-hoang', 'Dương Minh Hoàng', 'pink', 'Nhà sáng lập & Giám đốc dự án', 'Founder & Project Director', 'Người khởi xướng Hồi Nét. Định hướng sản phẩm và chiến lược phát triển cộng đồng.', 'Initiator of Hoi Net. Leads product direction and community growth strategy.', 10),
  ('lead-nguyen-minh-anh', 'Nguyễn Minh Anh', 'blue', 'Giám đốc Công nghệ (CTO)', 'Chief Technology Officer (CTO)', 'Hơn 10 năm xây dựng hệ thống phân tán và hạ tầng AI quy mô lớn.', '10+ years building distributed systems and large-scale AI infrastructure.', 20),
  ('lead-tran-quoc-bao', 'Trần Quốc Bảo', 'purple', 'Trưởng nhóm Nghiên cứu AI', 'Head of AI Research', 'Chuyên gia thị giác máy tính, phụ trách các mô hình phục hồi và tô màu ảnh.', 'Computer-vision specialist leading restoration and colorization models.', 30),
  ('lead-le-thu-ha', 'Lê Thu Hà', 'orange', 'Trưởng nhóm Sản phẩm & Thiết kế', 'Head of Product & Design', 'Thiết kế trải nghiệm đơn giản để mọi thế hệ đều có thể phục chế ảnh.', 'Designs simple experiences so every generation can restore their photos.', 40),
  ('lead-pham-gia-huy', 'Phạm Gia Huy', 'green', 'Trưởng nhóm Cộng đồng & Vận hành', 'Head of Community & Operations', 'Kết nối cộng đồng, nhà tài trợ và đảm bảo vận hành minh bạch.', 'Connects the community and sponsors and keeps operations transparent.', 50)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.company_stats (slug, value, prefix, suffix_vi, suffix_en, icon, label_vi, label_en, description_vi, description_en, display_order) VALUES
  ('stat-image', 128000, NULL, '+', '+', 'image', 'Ảnh đã phục chế', 'Photos restored', 'Từ ngày ra mắt công khai tháng 2/2026', 'Since public launch in Feb 2026', 10),
  ('stat-users', 36000, NULL, '+', '+', 'users', 'Người dùng', 'Users', 'Gia đình và cá nhân tin dùng mỗi tháng', 'Families and individuals every month', 20),
  ('stat-map', 34, NULL, '/34', '/34', 'map', 'Tỉnh, thành phố', 'Provinces & cities', 'Có người dùng trên khắp cả nước', 'With users across the country', 30),
  ('stat-smile', 98, NULL, '%', '%', 'smile', 'Hài lòng', 'Satisfaction', 'Theo khảo sát sau mỗi lượt phục chế', 'From post-restoration surveys', 40),
  ('stat-clock', 3, '~', ' phút', ' min', 'clock', 'Thời gian xử lý', 'Processing time', 'Trung bình cho một bức ảnh', 'Average per photo', 50),
  ('stat-calendar', 13, NULL, ' tháng', ' months', 'calendar', 'Đồng hành cùng bạn', 'Months of service', 'Kể từ khi thành lập tháng 9/2025', 'Since founding in Sep 2025', 60)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
