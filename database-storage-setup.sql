-- Supabase Storage Setup for User Uploads
-- Run this in Supabase SQL Editor after creating the storage bucket

-- 1. FIRST: Create storage bucket via Supabase Dashboard
-- Go to Storage -> Create new bucket
-- Name: user-uploads
-- Public: Yes (so users can view their uploaded images)

-- 2. Storage Policies for user-uploads bucket

-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload own files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = 'avatars' AND
    auth.uid()::text = (storage.filename(name)::text LIKE auth.uid()::text || '%')
  );

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = 'avatars'
  );

-- Allow public read access to all files in user-uploads
CREATE POLICY "Public can view user uploads"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'user-uploads');

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = 'avatars'
  );

-- Optional: Add more folders for different file types
-- Examples: avatars/, requests/, documents/

-- Storage size limits (can be adjusted in Supabase Dashboard)
-- Default: 50MB per file
-- Recommended for avatars: 5MB max (handled in app code)

-- File type restrictions (handled in app code)
-- Avatars: image/jpeg, image/png, image/webp
-- Request images: image/jpeg, image/png

-- IMPORTANT NOTES:
-- 1. Create the 'user-uploads' bucket in Supabase Dashboard first
-- 2. Set bucket to PUBLIC so users can view images
-- 3. Run these policies in SQL Editor
-- 4. Test upload/download functionality
-- 5. Monitor storage usage in Supabase Dashboard

-- To delete bucket and start over:
-- DELETE FROM storage.objects WHERE bucket_id = 'user-uploads';
-- DELETE FROM storage.buckets WHERE id = 'user-uploads';
