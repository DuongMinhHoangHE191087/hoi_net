-- =====================================================
-- COMPLETE ADMIN PANEL UPGRADE
-- Features: Avatar upload, Team members management
-- Created: 2026-01-18
-- =====================================================

-- 1. Ensure team_members table exists with all necessary fields
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  avatar TEXT, -- Cloudinary URL
  social_links JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add avatar column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'team_members'
    AND column_name = 'avatar'
  ) THEN
    ALTER TABLE public.team_members ADD COLUMN avatar TEXT;
  END IF;

  -- Add bio column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'team_members'
    AND column_name = 'bio'
  ) THEN
    ALTER TABLE public.team_members ADD COLUMN bio TEXT;
  END IF;

  -- Add social_links column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'team_members'
    AND column_name = 'social_links'
  ) THEN
    ALTER TABLE public.team_members ADD COLUMN social_links JSONB DEFAULT '{}';
  END IF;

  -- Add display_order column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'team_members'
    AND column_name = 'display_order'
  ) THEN
    ALTER TABLE public.team_members ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;

  -- Add is_active column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'team_members'
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.team_members ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 2. Enable RLS on team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Team members are viewable by everyone" ON public.team_members;
DROP POLICY IF EXISTS "Admins can insert team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can update team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can delete team members" ON public.team_members;

-- Create new policies
CREATE POLICY "Team members are viewable by everyone"
  ON public.team_members FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert team members"
  ON public.team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update team members"
  ON public.team_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete team members"
  ON public.team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- 3. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_display_order
  ON public.team_members(display_order);

CREATE INDEX IF NOT EXISTS idx_team_members_is_active
  ON public.team_members(is_active);

-- 4. Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS team_members_updated_at ON public.team_members;

-- Create trigger
CREATE TRIGGER team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_members_updated_at();

-- 5. Verify user_profiles has avatar_url
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- 6. Create storage bucket for avatars if not exists (run this in Supabase Dashboard)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;

-- 7. Set up storage policies for avatars
-- DELETE FROM storage.policies WHERE bucket_id = 'avatars';

-- INSERT INTO storage.policies (bucket_id, name, definition)
-- VALUES
--   ('avatars', 'Public Access',
--    '{"bucketId": "avatars", "operation": "SELECT"}'),
--   ('avatars', 'Authenticated users can upload avatars',
--    '{"bucketId": "avatars", "operation": "INSERT", "with": {"authenticated": true}}'),
--   ('avatars', 'Users can update their own avatars',
--    '{"bucketId": "avatars", "operation": "UPDATE", "with": {"authenticated": true}}'),
--   ('avatars', 'Users can delete their own avatars',
--    '{"bucketId": "avatars", "operation": "DELETE", "with": {"authenticated": true}}');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Admin panel database upgrade completed successfully!';
  RAISE NOTICE '✅ team_members table updated with avatar support';
  RAISE NOTICE '✅ user_profiles table updated with avatar_url';
  RAISE NOTICE '✅ RLS policies configured';
  RAISE NOTICE '✅ Performance indexes created';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '1. Upload avatars through /admin panel';
  RAISE NOTICE '2. Manage team members in Team tab';
  RAISE NOTICE '3. Edit user profiles in Users tab';
END $$;
