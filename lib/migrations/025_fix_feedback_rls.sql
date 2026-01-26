-- ============================================
-- Fix Feedback RLS Policies
-- Allow anonymous users to submit feedback
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create feedback" ON public.feedback;
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can create feedback" ON public.feedback;
DROP POLICY IF EXISTS "public_insert_feedback" ON public.feedback;

-- Create policy to allow anyone (including anonymous) to insert feedback
CREATE POLICY "public_insert_feedback" ON public.feedback
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Also allow anon role specifically
GRANT INSERT ON public.feedback TO anon;
GRANT INSERT ON public.feedback TO authenticated;

-- Verify
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'feedback';

-- Success message
SELECT 'Feedback RLS policies updated - anonymous inserts allowed!' AS result;
