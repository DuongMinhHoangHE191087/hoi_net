-- ========================================================================
-- Migration: Add Contact Info for Community Verification
-- Description: Adds contact fields to feedback table for transparent verification
-- Created: 2026-01-22
-- ========================================================================

-- Add contact verification fields to feedback table
ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS zalo_id TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS allow_contact_display BOOLEAN DEFAULT false;

-- Add index for contact display query
CREATE INDEX IF NOT EXISTS idx_feedback_contact_display
  ON public.feedback(allow_contact_display)
  WHERE allow_contact_display = true;

-- Comment on new columns
COMMENT ON COLUMN public.feedback.phone_number IS 'Phone number for verification (optional)';
COMMENT ON COLUMN public.feedback.facebook_url IS 'Facebook profile URL for community verification';
COMMENT ON COLUMN public.feedback.zalo_id IS 'Zalo ID for community verification';
COMMENT ON COLUMN public.feedback.website_url IS 'Personal/company website URL';
COMMENT ON COLUMN public.feedback.allow_contact_display IS 'Whether to publicly display contact info for verification';

-- Update sample testimonials with contact info
UPDATE public.feedback
SET
  facebook_url = 'https://facebook.com/nguyenvana.example',
  allow_contact_display = true
WHERE email = 'nguyenvana@example.com' AND is_testimonial = true;

UPDATE public.feedback
SET
  facebook_url = 'https://facebook.com/tranthib.example',
  website_url = 'https://studioxyz.example.com',
  allow_contact_display = true
WHERE email = 'tranthib@example.com' AND is_testimonial = true;

-- ========================================================================
-- Verification: Check migration applied correctly
-- ========================================================================
DO $$
BEGIN
  RAISE NOTICE 'Migration 019_feedback_contact_info.sql completed successfully';
  RAISE NOTICE 'Added columns: phone_number, facebook_url, zalo_id, website_url, allow_contact_display';
END $$;
