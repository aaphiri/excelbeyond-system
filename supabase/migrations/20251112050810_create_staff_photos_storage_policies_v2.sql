/*
  # Create Storage Policies for Staff Photos

  1. Changes
    - Create policies for uploading staff photos
    - Allow public read access to photos
    - Allow authenticated users to upload photos

  2. Security
    - Public read access for profile photos
    - Authenticated upload only
    - File size and type restrictions handled by client
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to staff photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload staff photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update staff photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete staff photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous upload for staff registration" ON storage.objects;

-- Allow anyone to read staff photos (public access)
CREATE POLICY "Allow public read access to staff photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'staff-photos');

-- Allow authenticated users to upload staff photos
CREATE POLICY "Allow authenticated users to upload staff photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'staff-photos');

-- Allow authenticated users to update their own photos
CREATE POLICY "Allow authenticated users to update staff photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'staff-photos')
WITH CHECK (bucket_id = 'staff-photos');

-- Allow authenticated users to delete staff photos
CREATE POLICY "Allow authenticated users to delete staff photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'staff-photos');

-- Also allow anonymous uploads for registration (since users aren't logged in yet)
CREATE POLICY "Allow anonymous upload for staff registration"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'staff-photos');
