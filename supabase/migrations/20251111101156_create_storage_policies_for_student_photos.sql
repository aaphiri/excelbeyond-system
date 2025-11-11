/*
  # Create Storage Policies for Student Photos Bucket

  1. Policies Created
    - Allow all authenticated users to upload files
    - Allow public read access to all files
    - Allow authenticated users to update their uploads
    - Allow authenticated users to delete files

  2. Security
    - Public bucket for easy access to student photos
    - Authenticated users can manage photos
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view student photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload student photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update student photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete student photos" ON storage.objects;

-- Allow public read access
CREATE POLICY "Anyone can view student photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'student-photos');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload student photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'student-photos');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update student photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'student-photos')
WITH CHECK (bucket_id = 'student-photos');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete student photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'student-photos');
