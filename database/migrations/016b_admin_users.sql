-- ==========================================
-- MIGRATION 016B: ADMIN USERS TABLE
-- Chạy phần này SAU khi 016a hoàn tất
-- ==========================================

-- ==========================================
-- PART 1: Admin Users Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin list" ON public.admin_users;
CREATE POLICY "Admins can view admin list"
  ON public.admin_users FOR SELECT
  USING (
    user_id = auth.uid() OR
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

DROP POLICY IF EXISTS "Only admins can grant admin" ON public.admin_users;
CREATE POLICY "Only admins can grant admin"
  ON public.admin_users FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

-- ==========================================
-- PART 2: Helper Functions
-- ==========================================

-- Use CREATE OR REPLACE to update existing functions without breaking dependencies
-- This avoids the "cannot drop function because other objects depend on it" error

-- Function to check if user is admin
-- IMPORTANT: Keep the same parameter name (check_user_id or whatever was used before)
-- If the existing function uses a different parameter name, we need to match it
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin_users table first
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = check_user_id) THEN
    RETURN true;
  END IF;

  -- Fallback to env variable check (for backwards compatibility)
  -- This allows admin access even if admin_users table is empty
  RETURN false;
END;
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = check_user_id) THEN
    RETURN 'admin';
  ELSE
    RETURN 'user';
  END IF;
END;
$$;

-- ==========================================
-- PART 3: Create index
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);

-- ==========================================
-- PART 4: Seed first admin (REQUIRED!)
-- ==========================================

-- Thay 'your-admin@email.com' bằng email của bạn
-- Uncomment dòng dưới và chạy riêng:
-- INSERT INTO public.admin_users (user_id, granted_by)
-- SELECT id, id FROM auth.users WHERE email = 'your-admin@email.com'
-- ON CONFLICT DO NOTHING;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Test admin function:
-- SELECT public.is_admin((SELECT id FROM auth.users WHERE email = 'your-admin@email.com'));
-- Should return true

-- SELECT public.get_user_role((SELECT id FROM auth.users WHERE email = 'your-admin@email.com'));
-- Should return 'admin'
