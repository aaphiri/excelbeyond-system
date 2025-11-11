/*
  # Allow Anonymous Storage Uploads for Student Photos

  1. Changes
    - Update storage policies to allow anon role uploads
    - This works with our custom authentication system
    
  2. Security
    - Public bucket for easy access
    - Allow uploads from both authenticated and anon users
    - Application-level access control handles permissions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view student photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload student photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update student photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete student photos" ON storage.objects;

-- Allow public read access
CREATE POLICY "Anyone can view student photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'student-photos');

-- Allow all users (including anon) to upload
CREATE POLICY "Allow all uploads to student photos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'student-photos');

-- Allow all users to update
CREATE POLICY "Allow all updates to student photos"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'student-photos')
WITH CHECK (bucket_id = 'student-photos');

-- Allow all users to delete
CREATE POLICY "Allow all deletes from student photos"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'student-photos');
