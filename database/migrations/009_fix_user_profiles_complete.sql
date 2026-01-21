-- Migration 009: Complete User Profiles Schema Fix (SAFE VERSION)
-- Fixes: PGRST204 "Could not find the 'facebook_url' column"
-- Date: 2026-01-17

-- =====================================================
-- 1. CREATE USER_PROFILES TABLE (IF NOT EXISTS)
-- =====================================================
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

-- =====================================================
-- 2. ADD MISSING COLUMNS (IDEMPOTENT)
-- =====================================================
DO $$ 
BEGIN
  -- Add phone column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'phone') THEN
    ALTER TABLE public.user_profiles ADD COLUMN phone TEXT;
  END IF;

  -- Add facebook_url column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'facebook_url') THEN
    ALTER TABLE public.user_profiles ADD COLUMN facebook_url TEXT;
  END IF;

  -- Add address column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'address') THEN
    ALTER TABLE public.user_profiles ADD COLUMN address TEXT;
  END IF;

  -- Add avatar_url column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE public.user_profiles ADD COLUMN avatar_url TEXT;
  END IF;

  -- Add full_name column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'full_name') THEN
    ALTER TABLE public.user_profiles ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- =====================================================
-- 3. ENABLE RLS
-- =====================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE/UPDATE RLS POLICIES
-- =====================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.user_profiles FOR SELECT
USING (
  auth.email() IN (
    'admin@photoai.com',
    'duonghoang@gmail.com',
    'duongminhhoanggame@gmail.com'
  )
);

-- =====================================================
-- 5. CREATE TRIGGER FOR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

-- Done! This migration only affects user_profiles table.
-- It does NOT touch user_requests table to avoid admin_id errors.
