-- ==============================================
-- STORAGE SETUP FOR PHOTO RESTORE APP
-- For user-uploads bucket (requests, blog images)
-- ==============================================
-- NOTE: For AVATAR uploads, use CREATE_STORAGE_BUCKET.sql
-- which sets up the 'avatars' bucket with per-user folder policies
-- ==============================================

-- IMPORTANT: Before running this SQL
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "Create new bucket"
-- 3. Name: user-uploads
-- 4. Public: YES (check the box)
-- 5. Click "Create bucket"
-- THEN run this SQL

-- ==============================================
-- STORAGE POLICIES
-- ==============================================

-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload own files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-uploads' AND
    (
      (storage.foldername(name))[1] = 'avatars' OR
      (storage.foldername(name))[1] = 'requests'
    )
  );

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user-uploads' AND
    (
      (storage.foldername(name))[1] = 'avatars' OR
      (storage.foldername(name))[1] = 'requests'
    )
  );

-- Allow public read access to all files
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
    (
      (storage.foldername(name))[1] = 'avatars' OR
      (storage.foldername(name))[1] = 'requests'
    )
  );

-- Admins can upload blog images
CREATE POLICY "Admins can upload blog images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = 'blog' AND
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE email IN ('admin@photoai.com', 'duonghoang@gmail.com')
    )
  );

-- ==============================================
-- VERIFY STORAGE SETUP
-- ==============================================

-- List all storage buckets
SELECT
  id,
  name,
  public,
  created_at
FROM storage.buckets
WHERE name = 'user-uploads';

-- List all storage policies
SELECT
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;

-- ==============================================
-- FOLDER STRUCTURE
-- ==============================================
-- The bucket will contain these folders:
-- - avatars/      (user profile pictures)
-- - requests/     (request images - before)
-- - blog/         (blog post images)
--
-- Files are named with pattern:
-- - avatars:  {userId}-{timestamp}.{ext}
-- - requests: {userId}-{timestamp}-{random}.{ext}
-- - blog:     blog/{timestamp}-{filename}
-- ==============================================

-- STORAGE SETUP COMPLETE!
