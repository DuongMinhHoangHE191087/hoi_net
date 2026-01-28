-- ============================================
-- PROTECTION: Prevent Users from Deleting Submitted Requests & Feedback
-- Date: 2026-01-28
-- ============================================

-- 1. Update user_requests policy - Chỉ cho phép xóa requests ở trạng thái 'pending'
-- ============================================

-- Drop old policy
DROP POLICY IF EXISTS "Users can delete own pending requests" ON public.user_requests;

-- Create new policy với check strict hơn
CREATE POLICY "Users can delete own pending requests" 
  ON public.user_requests
  FOR DELETE
  USING (
    auth.uid() = user_id 
    AND status = 'pending'  -- ✅ Chỉ pending mới xóa được
  );

-- 2. Ensure feedback can only be deleted by admins
-- ============================================

-- Drop any user delete policies on feedback
DROP POLICY IF EXISTS "Users can delete own feedback" ON public.feedback;
DROP POLICY IF EXISTS "public_delete_feedback" ON public.feedback;

-- Ensure only admin delete policy exists
DROP POLICY IF EXISTS "Admins can delete feedback" ON public.feedback;

CREATE POLICY "Admins can delete feedback" 
  ON public.feedback
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- 3. Add helpful comments
-- ============================================

COMMENT ON POLICY "Users can delete own pending requests" ON public.user_requests 
  IS 'Users can only delete their own requests that are in pending status. Once processing/completed/rejected, requests cannot be deleted to maintain audit trail.';

COMMENT ON POLICY "Admins can delete feedback" ON public.feedback 
  IS 'Only admins can delete feedback. Regular users cannot delete their submitted feedback to prevent manipulation and maintain testimonial integrity.';

-- 4. Verify policies
-- ============================================

-- Show all policies on user_requests
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_requests' 
  AND schemaname = 'public'
ORDER BY policyname;

-- Show all policies on feedback
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'feedback' 
  AND schemaname = 'public'
ORDER BY policyname;
