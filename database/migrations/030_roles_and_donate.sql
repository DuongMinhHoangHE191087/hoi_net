-- ============================================
-- MIGRATION: User Roles & Donate Settings
-- Hồi Nét - Photo Restoration Platform
-- ============================================

-- ============================================
-- 1. USER ROLES TABLE
-- ============================================
-- Roles: admin, moderator, editor, user

-- Add role column to user_profiles if not exists
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Create roles enum (optional, for reference)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'editor', 'user');
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'user_role type already exists or error: %', SQLERRM;
END $$;

-- Update role column to use constraints (wrap in DO block to handle existing constraint)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_role' AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles
    ADD CONSTRAINT valid_role 
    CHECK (role IN ('admin', 'moderator', 'editor', 'user'));
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Constraint valid_role error: %', SQLERRM;
END $$;

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- ============================================
-- 2. ROLE PERMISSIONS
-- ============================================
-- admin: Full access
-- moderator: Process requests, manage blog posts (pending review)
-- editor: Create/edit blog posts (pending review)
-- user: Submit requests, view own content

CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(20) NOT NULL,
  permission VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, permission)
);

-- Insert default permissions
INSERT INTO role_permissions (role, permission) VALUES
  -- Admin permissions
  ('admin', 'admin.access'),
  ('admin', 'admin.users.manage'),
  ('admin', 'admin.settings.manage'),
  ('admin', 'admin.roles.manage'),
  ('admin', 'requests.view_all'),
  ('admin', 'requests.process'),
  ('admin', 'requests.delete'),
  ('admin', 'blog.create'),
  ('admin', 'blog.edit'),
  ('admin', 'blog.delete'),
  ('admin', 'blog.publish'),
  ('admin', 'feedback.view'),
  ('admin', 'feedback.respond'),
  ('admin', 'media.manage'),
  
  -- Moderator permissions
  ('moderator', 'requests.view_all'),
  ('moderator', 'requests.process'),
  ('moderator', 'blog.create'),
  ('moderator', 'blog.edit'),
  ('moderator', 'feedback.view'),
  ('moderator', 'feedback.respond'),
  
  -- Editor permissions
  ('editor', 'blog.create'),
  ('editor', 'blog.edit'),
  
  -- User permissions (basic, enforced by RLS)
  ('user', 'requests.create'),
  ('user', 'requests.view_own')
ON CONFLICT (role, permission) DO NOTHING;

-- ============================================
-- 3. DONATE SETTINGS
-- ============================================

-- Add donate settings to site_settings
-- Using DO block to handle both TEXT and JSON value types
DO $$
BEGIN
  -- MoMo
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_momo_qr', '', 'URL ảnh QR MoMo')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_momo_account', '0394497949', 'Số điện thoại MoMo')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_momo_name', 'DUONG MINH HOANG', 'Tên tài khoản MoMo')
  ON CONFLICT (key) DO NOTHING;
  
  -- Bank
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_bank_qr', '', 'URL ảnh QR Ngân hàng')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_bank_account', '0394497949', 'Số tài khoản ngân hàng')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_bank_name', 'DUONG MINH HOANG', 'Tên tài khoản ngân hàng')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_bank_bank_name', 'MB Bank', 'Tên ngân hàng')
  ON CONFLICT (key) DO NOTHING;
  
  -- ZaloPay
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_zalopay_qr', '', 'URL ảnh QR ZaloPay')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_zalopay_account', '0394497949', 'Số điện thoại ZaloPay')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_zalopay_name', 'DUONG MINH HOANG', 'Tên tài khoản ZaloPay')
  ON CONFLICT (key) DO NOTHING;
  
  -- PayPal
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_paypal_link', '', 'Link PayPal.me')
  ON CONFLICT (key) DO NOTHING;
  
  -- Custom Content (thay thế Buy Me a Coffee - cho phép đăng nội dung tùy chỉnh)
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_custom_title', 'Hỗ trợ khác', 'Tiêu đề phần nội dung tùy chỉnh')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_custom_content', '', 'Nội dung tùy chỉnh (HTML/Markdown)')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_custom_enabled', 'false', 'Bật/tắt phần nội dung tùy chỉnh')
  ON CONFLICT (key) DO NOTHING;
  
  -- Enable/Disable
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_enabled', 'true', 'Bật/tắt trang donate')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_message', 'Cảm ơn bạn đã ủng hộ Hồi Nét!', 'Thông điệp cảm ơn')
  ON CONFLICT (key) DO NOTHING;
  
  -- Hero Section
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_hero_title', 'Ủng Hộ Hồi Nét', 'Tiêu đề trang donate')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_hero_subtitle', 'Dự án phi lợi nhuận giúp khôi phục ảnh cũ miễn phí cho cộng đồng. Mỗi đóng góp của bạn giúp chúng tôi duy trì và phát triển dịch vụ.', 'Mô tả trang donate')
  ON CONFLICT (key) DO NOTHING;
  
  -- Stats
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_stats_photos', '1000+', 'Số ảnh đã phục hồi')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_stats_users', '500+', 'Số người dùng')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_stats_free', '100%', 'Phần trăm miễn phí')
  ON CONFLICT (key) DO NOTHING;
  
  -- Why Donate Section
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_why_title', 'Đóng góp của bạn giúp chúng tôi', 'Tiêu đề phần Why Donate')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_why_1_title', 'Duy trì server', 'Why 1 title')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_why_1_desc', 'Chi phí hosting, domain và các dịch vụ cloud để website luôn hoạt động', 'Why 1 description')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_why_2_title', 'Nâng cấp AI', 'Why 2 title')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_why_2_desc', 'Chi phí API AI để cải thiện chất lượng khôi phục ảnh', 'Why 2 description')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_why_3_title', 'Phục vụ cộng đồng', 'Why 3 title')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_why_3_desc', 'Giữ dịch vụ miễn phí cho mọi người, đặc biệt các gia đình có ảnh cũ', 'Why 3 description')
  ON CONFLICT (key) DO NOTHING;
  
  -- Thank You Section
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_thanks_title', 'Cảm ơn bạn!', 'Tiêu đề phần cảm ơn')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_thanks_desc', 'Mỗi đóng góp dù nhỏ đều giúp chúng tôi tiếp tục sứ mệnh bảo tồn ký ức cho cộng đồng. Hồi Nét cam kết sử dụng 100% tiền ủng hộ cho việc phát triển dịch vụ.', 'Mô tả phần cảm ơn')
  ON CONFLICT (key) DO NOTHING;
  
  -- Transfer Content
  INSERT INTO site_settings (key, value, description) 
  VALUES ('donate_transfer_content', 'Ung ho Hoi Net', 'Nội dung chuyển khoản')
  ON CONFLICT (key) DO NOTHING;
  
  RAISE NOTICE 'Donate settings inserted successfully';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error inserting donate settings: %', SQLERRM;
END $$;

-- ============================================
-- 4. FEEDBACK TABLE UPDATES
-- ============================================

-- Add user_id and source columns if not exist
ALTER TABLE feedback
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'anonymous',
ADD COLUMN IF NOT EXISTS ip_hash VARCHAR(30),
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_assigned_to ON feedback(assigned_to);

-- ============================================
-- 5. BLOG POSTS UPDATES FOR MODERATION
-- ============================================

-- Add moderation columns if not exist
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add constraint (wrap in DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_moderation_status' AND table_name = 'blog_posts'
  ) THEN
    ALTER TABLE blog_posts
    ADD CONSTRAINT valid_moderation_status 
    CHECK (moderation_status IN ('pending', 'approved', 'rejected'));
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Constraint valid_moderation_status error: %', SQLERRM;
END $$;

-- Index for moderation
CREATE INDEX IF NOT EXISTS idx_blog_posts_moderation ON blog_posts(moderation_status);

-- ============================================
-- 6. RLS POLICIES FOR ROLES
-- ============================================

-- Drop existing functions first to avoid return type conflict
DO $$
BEGIN
  DROP FUNCTION IF EXISTS get_user_role(UUID);
  DROP FUNCTION IF EXISTS has_permission(UUID, VARCHAR);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Function drop error (can be ignored): %', SQLERRM;
END $$;

-- Function to check user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role FROM user_profiles WHERE id = user_id;
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION has_permission(user_id UUID, perm VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR;
  has_perm BOOLEAN;
BEGIN
  SELECT role INTO user_role FROM user_profiles WHERE id = user_id;
  user_role := COALESCE(user_role, 'user');
  
  SELECT EXISTS(
    SELECT 1 FROM role_permissions 
    WHERE role = user_role AND permission = perm
  ) INTO has_perm;
  
  RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. CREATE MODERATOR ACTIONS LOG
-- ============================================

CREATE TABLE IF NOT EXISTS moderator_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_moderator_actions_moderator ON moderator_actions(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderator_actions_target ON moderator_actions(target_type, target_id);

-- ============================================
-- 8. GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON role_permissions TO authenticated;
GRANT SELECT ON moderator_actions TO authenticated;
GRANT INSERT ON moderator_actions TO authenticated;

-- ============================================
-- DONE
-- ============================================
