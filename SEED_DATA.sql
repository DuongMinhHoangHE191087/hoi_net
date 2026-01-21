-- ==============================================
-- SEED DATA FOR TESTING
-- Run AFTER completing database migration
-- ==============================================

-- IMPORTANT: These are sample data for testing purposes
-- Do NOT run this in production with real user data

-- ==============================================
-- SAMPLE USER PROFILES
-- ==============================================

-- Note: Users must be created via Supabase Auth first
-- This adds profile data for existing auth users

-- Sample profile for admin user
-- Replace 'YOUR_ADMIN_USER_ID' with actual user ID from auth.users
INSERT INTO user_profiles (id, full_name, phone, address, facebook_url, avatar_url, created_at, updated_at)
VALUES
  (
    'YOUR_ADMIN_USER_ID',
    'Nguyễn Văn Admin',
    '0901234567',
    '123 Đường Lê Lợi, Quận 1, TP.HCM',
    'https://facebook.com/admin.photoai',
    'https://i.pravatar.cc/150?img=1',
    NOW() - INTERVAL '30 days',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Sample profile for test user 1
INSERT INTO user_profiles (id, full_name, phone, address, facebook_url, avatar_url, created_at, updated_at)
VALUES
  (
    'USER_ID_1',
    'Trần Thị Mai',
    '0912345678',
    '456 Nguyễn Huệ, Quận 1, TP.HCM',
    'https://facebook.com/tran.mai',
    'https://i.pravatar.cc/150?img=5',
    NOW() - INTERVAL '20 days',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Sample profile for test user 2
INSERT INTO user_profiles (id, full_name, phone, address, facebook_url, avatar_url, created_at, updated_at)
VALUES
  (
    'USER_ID_2',
    'Lê Văn Hùng',
    '0923456789',
    '789 Trần Hưng Đạo, Quận 5, TP.HCM',
    'https://facebook.com/le.hung',
    'https://i.pravatar.cc/150?img=12',
    NOW() - INTERVAL '15 days',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- SAMPLE USER REQUESTS
-- ==============================================

-- Pending request (restore old photo)
INSERT INTO user_requests (
  user_id,
  type,
  description,
  status,
  original_images,
  created_at,
  updated_at
)
VALUES (
  'USER_ID_1',
  'restore',
  'Xin chào, tôi có một bức ảnh cũ của gia đình từ năm 1980. Ảnh đã bị phai màu và có vài vết rách nhỏ. Tôi muốn phục hồi lại ảnh này để làm quà tặng cho bố mẹ vào dịp kỷ niệm ngày cưới.',
  'pending',
  ARRAY[
    'https://picsum.photos/seed/old1/800/600',
    'https://picsum.photos/seed/old2/800/600'
  ],
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
);

-- Processing request (family photo)
INSERT INTO user_requests (
  user_id,
  type,
  description,
  status,
  original_images,
  admin_notes,
  admin_id,
  created_at,
  updated_at
)
VALUES (
  'USER_ID_2',
  'family',
  'Tôi muốn ghép 3 bức ảnh riêng lẻ của các thành viên gia đình thành một bức ảnh chung. Mỗi người được chụp ở thời điểm khác nhau nhưng tôi muốn có một bức ảnh gia đình hoàn chỉnh.',
  'processing',
  ARRAY[
    'https://picsum.photos/seed/family1/800/600',
    'https://picsum.photos/seed/family2/800/600',
    'https://picsum.photos/seed/family3/800/600'
  ],
  'Đang xử lý ghép ảnh. Dự kiến hoàn thành trong 2 ngày.',
  'YOUR_ADMIN_USER_ID',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '1 day'
);

-- Completed request
INSERT INTO user_requests (
  user_id,
  type,
  description,
  status,
  original_images,
  restored_images,
  admin_notes,
  admin_id,
  created_at,
  updated_at,
  completed_at
)
VALUES (
  'USER_ID_1',
  'restore',
  'Phục hồi ảnh cưới của ông bà. Ảnh bị nhòe và mất màu nghiêm trọng.',
  'completed',
  ARRAY[
    'https://picsum.photos/seed/wedding1/800/600'
  ],
  ARRAY[
    'https://picsum.photos/seed/restored1/800/600'
  ],
  'Đã hoàn thành phục hồi. Ảnh đã được làm sắc nét, tô màu lại và sửa các khuyết điểm.',
  'YOUR_ADMIN_USER_ID',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);

-- Rejected request (invalid images)
INSERT INTO user_requests (
  user_id,
  type,
  description,
  status,
  original_images,
  admin_notes,
  admin_id,
  created_at,
  updated_at
)
VALUES (
  'USER_ID_2',
  'restore',
  'Phục hồi ảnh chân dung.',
  'rejected',
  ARRAY[
    'https://picsum.photos/seed/invalid/800/600'
  ],
  'Xin lỗi, ảnh gốc quá mờ và thiếu chi tiết. Vui lòng cung cấp ảnh có độ phân giải cao hơn hoặc ảnh gốc scan trực tiếp.',
  'YOUR_ADMIN_USER_ID',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '6 days'
);

-- Multiple images restore request
INSERT INTO user_requests (
  user_id,
  type,
  description,
  status,
  original_images,
  created_at,
  updated_at
)
VALUES (
  'USER_ID_1',
  'restore',
  'Tôi có một album ảnh cũ gồm 5 bức ảnh từ thời niên thiếu. Tất cả đều bị phai màu và có vết ố vàng. Tôi muốn phục hồi lại để lưu giữ kỷ niệm.',
  'pending',
  ARRAY[
    'https://picsum.photos/seed/album1/800/600',
    'https://picsum.photos/seed/album2/800/600',
    'https://picsum.photos/seed/album3/800/600',
    'https://picsum.photos/seed/album4/800/600',
    'https://picsum.photos/seed/album5/800/600'
  ],
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

-- ==============================================
-- SAMPLE BLOG POSTS
-- ==============================================

-- Published blog post 1
INSERT INTO blog_posts (
  author_id,
  title,
  slug,
  excerpt,
  content,
  author_name,
  featured_image,
  published,
  meta_title,
  meta_description,
  views,
  created_at,
  updated_at,
  published_at
)
VALUES (
  'YOUR_ADMIN_USER_ID',
  'Cách Bảo Quản Ảnh Cũ Đúng Cách',
  'cach-bao-quan-anh-cu-dung-cach',
  'Hướng dẫn chi tiết cách bảo quản và lưu trữ ảnh cũ để tránh hư hỏng theo thời gian.',
  '<h1>Cách Bảo Quản Ảnh Cũ Đúng Cách</h1>

<p>Những bức ảnh cũ không chỉ là kỷ niệm mà còn là tài sản vô giá của gia đình. Dưới đây là những cách bảo quản ảnh cũ hiệu quả nhất:</p>

<h2>1. Lưu Trữ Ở Nơi Khô Ráo</h2>
<p>Độ ẩm là kẻ thù lớn nhất của ảnh cũ. Hãy lưu trữ ảnh ở nơi:</p>
<ul>
  <li>Khô ráo, thoáng mát</li>
  <li>Tránh ánh nắng trực tiếp</li>
  <li>Nhiệt độ ổn định (18-20°C)</li>
  <li>Độ ẩm dưới 50%</li>
</ul>

<h2>2. Sử Dụng Album Chất Lượng</h2>
<p>Đầu tư vào album ảnh chất lượng cao với:</p>
<ul>
  <li>Trang giấy không axit</li>
  <li>Bìa cứng bảo vệ</li>
  <li>Túi nhựa trong suốt không PVC</li>
</ul>

<h2>3. Số Hóa Ảnh Cũ</h2>
<p>Cách tốt nhất để bảo quản lâu dài là số hóa:</p>
<ul>
  <li>Scan với độ phân giải cao (300-600 DPI)</li>
  <li>Lưu nhiều bản sao</li>
  <li>Sử dụng cloud storage</li>
  <li>Backup định kỳ</li>
</ul>

<h2>4. Xử Lý Cẩn Thận</h2>
<p>Khi cầm ảnh:</p>
<ul>
  <li>Rửa tay sạch và làm khô</li>
  <li>Cầm ở mép ảnh</li>
  <li>Không uốn cong</li>
  <li>Không viết trực tiếp lên ảnh</li>
</ul>

<p><strong>Kết luận:</strong> Bảo quản ảnh cũ đúng cách giúp lưu giữ kỷ niệm qua nhiều thế hệ. Đừng quên số hóa để an toàn hơn!</p>',
  'Nguyễn Văn Admin',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
  true,
  'Cách Bảo Quản Ảnh Cũ - Hướng Dẫn Chi Tiết',
  'Học cách bảo quản ảnh cũ đúng cách để tránh hư hỏng. Hướng dẫn từ chuyên gia về lưu trữ, số hóa và bảo vệ ảnh gia đình.',
  245,
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '15 days'
);

-- Published blog post 2
INSERT INTO blog_posts (
  author_id,
  title,
  slug,
  excerpt,
  content,
  author_name,
  featured_image,
  published,
  meta_title,
  meta_description,
  views,
  created_at,
  updated_at,
  published_at
)
VALUES (
  'YOUR_ADMIN_USER_ID',
  'AI Phục Hồi Ảnh Cũ - Công Nghệ Tương Lai',
  'ai-phuc-hoi-anh-cu-cong-nghe-tuong-lai',
  'Khám phá cách AI và machine learning đang cách mạng hóa việc phục hồi ảnh cũ.',
  '<h1>AI Phục Hồi Ảnh Cũ - Công Nghệ Tương Lai</h1>

<p>Trí tuệ nhân tạo (AI) đang thay đổi hoàn toàn cách chúng ta phục hồi và tái tạo ảnh cũ.</p>

<h2>Công Nghệ AI Trong Phục Hồi Ảnh</h2>

<h3>1. Colorization (Tô Màu Tự Động)</h3>
<p>AI có thể:</p>
<ul>
  <li>Phân tích ảnh đen trắng</li>
  <li>Dự đoán màu sắc chính xác</li>
  <li>Tô màu tự nhiên dựa trên ngữ cảnh</li>
  <li>Học từ hàng triệu ảnh mẫu</li>
</ul>

<h3>2. Super Resolution (Tăng Độ Phân Giải)</h3>
<p>Công nghệ AI giúp:</p>
<ul>
  <li>Tăng kích thước ảnh gấp 4-8 lần</li>
  <li>Tái tạo chi tiết đã mất</li>
  <li>Làm sắc nét ảnh mờ</li>
  <li>Giữ nguyên chất lượng</li>
</ul>

<h3>3. Face Restoration (Phục Hồi Khuôn Mặt)</h3>
<p>AI chuyên biệt cho khuôn mặt:</p>
<ul>
  <li>Nhận diện và sửa lỗi</li>
  <li>Tái tạo chi tiết khuôn mặt</li>
  <li>Xóa vết xước, vết ố</li>
  <li>Cải thiện độ sắc nét</li>
</ul>

<h2>Ưu Điểm Của AI</h2>
<ol>
  <li><strong>Tốc độ nhanh:</strong> Xử lý trong vài giây thay vì vài giờ</li>
  <li><strong>Chất lượng cao:</strong> Kết quả tự nhiên, chuyên nghiệp</li>
  <li><strong>Chi phí thấp:</strong> Giảm thời gian và công sức thủ công</li>
  <li><strong>Khả năng mở rộng:</strong> Xử lý hàng loạt ảnh cùng lúc</li>
</ol>

<h2>Hạn Chế Cần Lưu Ý</h2>
<ul>
  <li>AI không thể tạo ra thông tin không tồn tại</li>
  <li>Cần kiểm tra và điều chỉnh thủ công</li>
  <li>Ảnh quá hỏng có thể không phục hồi được</li>
</ul>

<p><strong>Kết luận:</strong> AI là công cụ mạnh mẽ nhưng vẫn cần sự giám sát của con người để đảm bảo chất lượng tốt nhất.</p>',
  'Nguyễn Văn Admin',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
  true,
  'AI Phục Hồi Ảnh Cũ - Công Nghệ Và Ứng Dụng',
  'Tìm hiểu cách AI và machine learning đang cách mạng hóa việc phục hồi ảnh cũ với độ chính xác cao.',
  189,
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days'
);

-- Draft blog post
INSERT INTO blog_posts (
  author_id,
  title,
  slug,
  excerpt,
  content,
  author_name,
  featured_image,
  published,
  created_at,
  updated_at
)
VALUES (
  'YOUR_ADMIN_USER_ID',
  '5 Lỗi Thường Gặp Khi Phục Hồi Ảnh',
  '5-loi-thuong-gap-khi-phuc-hoi-anh',
  'Tìm hiểu những lỗi phổ biến và cách khắc phục khi tự phục hồi ảnh tại nhà.',
  '<h1>5 Lỗi Thường Gặp Khi Phục Hồi Ảnh</h1>

<p>Nhiều người thử tự phục hồi ảnh nhưng gặp phải những lỗi phổ biến sau:</p>

<h2>1. Lạm Dụng Filters</h2>
<p>Sử dụng quá nhiều filter làm ảnh trở nên không tự nhiên...</p>

<p><em>(Draft - Cần hoàn thiện thêm nội dung)</em></p>',
  'Nguyễn Văn Admin',
  'https://images.unsplash.com/photo-1611329532992-0b6f4c7d5e3c?w=800',
  false,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day'
);

-- ==============================================
-- VERIFY SEED DATA
-- ==============================================

-- Check user profiles
SELECT
  'User Profiles' as table_name,
  COUNT(*) as row_count
FROM user_profiles
UNION ALL
-- Check user requests
SELECT
  'User Requests' as table_name,
  COUNT(*) as row_count
FROM user_requests
UNION ALL
-- Check blog posts
SELECT
  'Blog Posts' as table_name,
  COUNT(*) as row_count
FROM blog_posts;

-- Show request statistics by status
SELECT
  status,
  COUNT(*) as count
FROM user_requests
GROUP BY status
ORDER BY status;

-- Show blog post statistics
SELECT
  'Published' as status,
  COUNT(*) as count
FROM blog_posts
WHERE published = true
UNION ALL
SELECT
  'Drafts' as status,
  COUNT(*) as count
FROM blog_posts
WHERE published = false;

-- ==============================================
-- NOTES
-- ==============================================

/*
BEFORE USING THIS FILE:

1. Create actual users via Supabase Auth:
   - Go to Authentication → Users
   - Add users manually OR
   - Register through the app

2. Replace placeholder IDs:
   - YOUR_ADMIN_USER_ID → Your actual admin user ID
   - USER_ID_1 → First test user ID
   - USER_ID_2 → Second test user ID

3. Update image URLs:
   - Replace placeholder URLs with actual Supabase Storage URLs
   - Or use the placeholder URLs for testing

4. Run this file:
   - In Supabase SQL Editor
   - After running COMPLETE_DATABASE_MIGRATION.sql

5. Verify data:
   - Check user_profiles table
   - Check user_requests table
   - Check blog_posts table
*/

-- SEED DATA SETUP COMPLETE!
