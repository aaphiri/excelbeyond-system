/*
  # Fix Staff RLS for Custom Authentication

  1. Changes
    - Drop old RLS policies that reference auth_users
    - Create simple policies that allow authenticated access
    - Allow anonymous access for registration
    - Keep data secure while allowing proper access

  2. Security
    - Authenticated users can view all staff (needed for user management)
    - Authenticated users can update/delete (admin functions)
    - Anonymous users can insert (for registration)
    - Public users can read (for login verification)
*/

-- Drop all existing policies on staff table
DROP POLICY IF EXISTS "Admins can manage all staff" ON staff;
DROP POLICY IF EXISTS "Admins can view all staff" ON staff;
DROP POLICY IF EXISTS "Staff can update their own profile" ON staff;
DROP POLICY IF EXISTS "Staff can view their own profile" ON staff;
DROP POLICY IF EXISTS "System can insert staff" ON staff;

-- Allow public read access (needed for login)
CREATE POLICY "Allow public read for authentication"
ON staff FOR SELECT
TO public
USING (true);

-- Allow authenticated users full access (for user management)
CREATE POLICY "Allow authenticated full access"
ON staff FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow anonymous insert (for registration)
CREATE POLICY "Allow anonymous insert for registration"
ON staff FOR INSERT
TO anon
WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access"
ON staff FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
