-- ========================================================================
-- PHOTO RESTORE AI - COMPLETE DATABASE FIX
-- Run this ONCE in Supabase SQL Editor
-- Date: 2026-01-17
-- ========================================================================

-- ========================================================================
-- PART 1: HELPER FUNCTIONS
-- ========================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.email() IN (
    'admin@photoai.com',
    'duonghoang@gmail.com',
    'duongminhhoanggame@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================================
-- PART 2: USER_PROFILES TABLE (Complete Setup)
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  facebook_url TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add any missing columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'phone') THEN
    ALTER TABLE public.user_profiles ADD COLUMN phone TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'facebook_url') THEN
    ALTER TABLE public.user_profiles ADD COLUMN facebook_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'address') THEN
    ALTER TABLE public.user_profiles ADD COLUMN address TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE public.user_profiles ADD COLUMN avatar_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'full_name') THEN
    ALTER TABLE public.user_profiles ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Create policies
CREATE POLICY "Users can view own profile"
ON public.user_profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.user_profiles FOR SELECT USING (is_admin_user());

-- Trigger
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

-- ========================================================================
-- PART 3: USER_REQUESTS TABLE (Complete Setup)
-- ========================================================================

-- Create enum types if not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_type') THEN
    CREATE TYPE request_type AS ENUM ('restore', 'family');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
    CREATE TYPE request_status AS ENUM ('pending', 'processing', 'completed', 'rejected');
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create table
CREATE TABLE IF NOT EXISTS public.user_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'restore',
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  original_images TEXT[] NOT NULL,
  restored_images TEXT[],
  admin_notes TEXT,
  admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- Add any missing columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_requests' AND column_name = 'restored_images') THEN
    ALTER TABLE public.user_requests ADD COLUMN restored_images TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_requests' AND column_name = 'admin_notes') THEN
    ALTER TABLE public.user_requests ADD COLUMN admin_notes TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_requests' AND column_name = 'admin_id') THEN
    ALTER TABLE public.user_requests ADD COLUMN admin_id UUID REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_requests' AND column_name = 'completed_at') THEN
    ALTER TABLE public.user_requests ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_requests' AND column_name = 'delivered_at') THEN
    ALTER TABLE public.user_requests ADD COLUMN delivered_at TIMESTAMPTZ;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_requests ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own requests" ON public.user_requests;
DROP POLICY IF EXISTS "Users can insert own requests" ON public.user_requests;
DROP POLICY IF EXISTS "Users can update own pending requests" ON public.user_requests;
DROP POLICY IF EXISTS "Users can delete own pending requests" ON public.user_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.user_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON public.user_requests;

-- Create user policies
CREATE POLICY "Users can view own requests"
ON public.user_requests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own requests"
ON public.user_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending requests"
ON public.user_requests FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users can delete own pending requests"
ON public.user_requests FOR DELETE USING (auth.uid() = user_id AND status = 'pending');

-- Create admin policies
CREATE POLICY "Admins can view all requests"
ON public.user_requests FOR SELECT USING (is_admin_user());

CREATE POLICY "Admins can update all requests"
ON public.user_requests FOR UPDATE USING (is_admin_user());

-- Create indexes (safe - won't fail if already exist)
CREATE INDEX IF NOT EXISTS idx_user_requests_user_id ON public.user_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_requests_status ON public.user_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_requests_created_at ON public.user_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_requests_admin_id ON public.user_requests(admin_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_user_requests_updated_at ON public.user_requests;
CREATE TRIGGER update_user_requests_updated_at
BEFORE UPDATE ON public.user_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for completed_at
CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_request_completed_at ON public.user_requests;
CREATE TRIGGER set_request_completed_at
BEFORE UPDATE ON public.user_requests
FOR EACH ROW EXECUTE FUNCTION set_completed_at();

-- Permissions
GRANT ALL ON public.user_requests TO authenticated;
GRANT SELECT ON public.user_requests TO anon;

-- ========================================================================
-- PART 4: SITE_SETTINGS TABLE
-- ========================================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON public.site_settings;
CREATE POLICY "Site settings are viewable by everyone" 
ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify site settings" ON public.site_settings;
CREATE POLICY "Only admins can modify site settings" 
ON public.site_settings FOR ALL USING (is_admin_user());

GRANT ALL ON public.site_settings TO authenticated;
GRANT SELECT ON public.site_settings TO anon;

-- Seed default settings
INSERT INTO public.site_settings (key, value)
VALUES 
  ('gemini_config', '{"model": "gemini-2.5-flash-lite", "rpm_limit": 15, "rpd_limit": 1000}'::jsonb),
  ('contact_required', '{"phone_or_facebook": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ========================================================================
-- DONE! Notify PostgREST to reload schema
-- ========================================================================
NOTIFY pgrst, 'reload schema';

-- Output success message
DO $$ BEGIN RAISE NOTICE 'Database setup complete!'; END $$;
