-- ==========================================
-- MIGRATION 016: FIX AUTH FLOW COMPLETE
-- Khắc phục toàn bộ vấn đề authentication
-- ==========================================

-- ==========================================
-- PART 1: Đảm bảo cả 2 tables tồn tại
-- ==========================================

-- Table 1: users (cho app logic)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: user_profiles (cho profile data)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  facebook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- PART 2: Enable RLS
-- ==========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PART 3: RLS Policies cho users table
-- ==========================================

DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
CREATE POLICY "Users can insert their own data"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- ==========================================
-- PART 4: RLS Policies cho user_profiles table
-- ==========================================

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.user_profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- ==========================================
-- PART 5: Trigger Function - Sync both tables
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  user_avatar TEXT;
BEGIN
  -- Extract data from auth.users metadata
  user_email := NEW.email;
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1));
  user_avatar := NEW.raw_user_meta_data->>'avatar_url';

  -- Insert into users table (for app logic)
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    user_email,
    user_name,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    updated_at = NOW();

  -- Insert into user_profiles table (for profile data)
  INSERT INTO public.user_profiles (id, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    user_name,
    user_avatar,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.user_profiles.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- ==========================================
-- PART 6: Create Trigger
-- ==========================================

DROP TRIGGER IF EXISTS on_auth_user_created_complete ON auth.users;
CREATE TRIGGER on_auth_user_created_complete
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_complete();

-- ==========================================
-- PART 7: Backfill existing users
-- ==========================================

-- Sync existing auth.users to users table
INSERT INTO public.users (id, email, name, created_at, updated_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', SPLIT_PART(email, '@', 1)),
  created_at,
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- Sync existing auth.users to user_profiles table
INSERT INTO public.user_profiles (id, full_name, avatar_url, created_at, updated_at)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', SPLIT_PART(email, '@', 1)),
  raw_user_meta_data->>'avatar_url',
  created_at,
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- PART 8: Admin Users Table
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
-- PART 9: Helper Functions
-- ==========================================

-- Drop existing functions first to avoid parameter name conflicts
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.get_user_role(UUID);

-- Function to check if user is admin
CREATE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = check_user_id
  );
END;
$$;

-- Function to get user role
CREATE FUNCTION public.get_user_role(check_user_id UUID)
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
-- PART 10: Seed first admin (Optional)
-- ==========================================

-- Uncomment và thay email của bạn để tạo admin đầu tiên
-- INSERT INTO public.admin_users (user_id, granted_by)
-- SELECT id, id FROM auth.users WHERE email = 'your-admin@email.com'
-- ON CONFLICT DO NOTHING;

-- ==========================================
-- PART 11: Create indexes for performance
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Run these after migration to verify:
-- SELECT count(*) FROM public.users;
-- SELECT count(*) FROM public.user_profiles;
-- SELECT count(*) FROM auth.users;
-- All counts should match!

-- Check if trigger is working:
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created_complete';

-- Test admin function:
-- SELECT public.is_admin('your-user-id-here');
-- SELECT public.get_user_role('your-user-id-here');
