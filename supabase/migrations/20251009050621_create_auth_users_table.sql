/*
  # Create Authentication Users Table

  1. New Tables
    - `auth_users`
      - `id` (uuid, primary key) - Unique identifier
      - `auth_id` (text, unique) - Supabase Auth user ID
      - `email` (text, unique) - User email
      - `name` (text) - Full name
      - `photo_url` (text) - Profile photo URL
      - `role` (text) - User role (admin, deputy_manager, program_officer, user)
      - `is_active` (boolean) - Account active status
      - `last_login` (timestamptz) - Last login timestamp
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable Row Level Security (RLS)
    - Users can view their own profile
    - Only admins can manage all users
    - Authenticated users can view active users

  3. Indexes
    - Index on auth_id for quick lookups
    - Index on email for searches
    - Index on role for filtering

  4. Notes
    - Only @familylegacyzambia.org emails are allowed
    - Default role is 'user'
    - Auto-created on first Google Sign-In
    - Tracks login activity
*/

CREATE TABLE IF NOT EXISTS auth_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  photo_url text,
  role text CHECK (role IN ('admin', 'deputy_manager', 'program_officer', 'user')) DEFAULT 'user',
  is_active boolean DEFAULT true,
  last_login timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_email CHECK (email LIKE '%@familylegacyzambia.org')
);

CREATE INDEX IF NOT EXISTS idx_auth_users_auth_id ON auth_users(auth_id);
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);
CREATE INDEX IF NOT EXISTS idx_auth_users_role ON auth_users(role);
CREATE INDEX IF NOT EXISTS idx_auth_users_active ON auth_users(is_active);

ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON auth_users FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid()::text);

CREATE POLICY "Users can update their own profile"
  ON auth_users FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid()::text)
  WITH CHECK (auth_id = auth.uid()::text);

CREATE POLICY "Authenticated users can view active users"
  ON auth_users FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "System can insert new users"
  ON auth_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage all users"
  ON auth_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth_users
      WHERE auth_users.auth_id = auth.uid()::text
      AND auth_users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth_users
      WHERE auth_users.auth_id = auth.uid()::text
      AND auth_users.role = 'admin'
    )
  );

CREATE OR REPLACE FUNCTION update_auth_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auth_users_updated_at
  BEFORE UPDATE ON auth_users
  FOR EACH ROW
  EXECUTE FUNCTION update_auth_users_updated_at();