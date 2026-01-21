-- =====================================================
-- SIMPLE AVATAR UPGRADE ONLY
-- Just the essential avatar upload features
-- No other table modifications
-- =====================================================

-- 1. Add avatar column to team_members if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'team_members'
    AND column_name = 'avatar'
  ) THEN
    ALTER TABLE public.team_members ADD COLUMN avatar TEXT;
    RAISE NOTICE '✅ Added avatar column to team_members';
  ELSE
    RAISE NOTICE '✅ avatar column already exists in team_members';
  END IF;
END $$;

-- 2. Add avatar_url column to user_profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN avatar_url TEXT;
    RAISE NOTICE '✅ Added avatar_url column to user_profiles';
  ELSE
    RAISE NOTICE '✅ avatar_url column already exists in user_profiles';
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Avatar upload feature is ready!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '1. Go to /admin panel';
  RAISE NOTICE '2. Tab "Đội Ngũ" → Upload avatar for team members';
  RAISE NOTICE '3. Tab "Người Dùng" → Edit profile → Upload avatar';
  RAISE NOTICE '';
  RAISE NOTICE '✨ Features:';
  RAISE NOTICE '- Upload from computer';
  RAISE NOTICE '- Auto resize to 500x500px';
  RAISE NOTICE '- Smart crop (face detection)';
  RAISE NOTICE '- Thumbnails: 150x150 and 50x50';
  RAISE NOTICE '- Max size: 5MB';
  RAISE NOTICE '- Formats: JPG, PNG, WEBP';
END $$;
