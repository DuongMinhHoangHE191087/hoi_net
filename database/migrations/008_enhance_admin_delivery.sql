-- Migration 008: Enhance Admin Delivery (SAFE VERSION)
-- Date: 2026-01-17
-- NOTE: This is safe to run, uses idempotent checks

-- 1. Add delivered_at timestamp for tracking
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_requests' AND column_name = 'delivered_at'
  ) THEN
    ALTER TABLE public.user_requests ADD COLUMN delivered_at TIMESTAMPTZ;
  END IF;
END $$;

-- 2. Add restored_images if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_requests' AND column_name = 'restored_images'
  ) THEN
    ALTER TABLE public.user_requests ADD COLUMN restored_images TEXT[];
  END IF;
END $$;

-- 3. Add admin_id if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_requests' AND column_name = 'admin_id'
  ) THEN
    ALTER TABLE public.user_requests ADD COLUMN admin_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- 4. Create is_admin_user function
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

-- 5. Update RLS policies for admins
DROP POLICY IF EXISTS "Admins can view all requests" ON public.user_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON public.user_requests;

CREATE POLICY "Admins can view all requests" 
ON public.user_requests FOR SELECT
USING (is_admin_user());

CREATE POLICY "Admins can update all requests" 
ON public.user_requests FOR UPDATE
USING (is_admin_user());

-- 6. Create index for admin_id (safe - only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_requests' AND column_name = 'admin_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_user_requests_admin_id ON public.user_requests(admin_id);
  END IF;
END $$;

-- 7. Site settings table
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

-- 8. Seed default settings
INSERT INTO public.site_settings (key, value)
VALUES 
  ('gemini_config', '{"model": "gemini-2.5-flash-lite", "rpm_limit": 15, "rpd_limit": 1000}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 9. Permissions
GRANT ALL ON public.site_settings TO authenticated;
GRANT SELECT ON public.site_settings TO anon;
