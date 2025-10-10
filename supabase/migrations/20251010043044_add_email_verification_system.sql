/*
  # Add Email Verification System
  
  1. New Tables
    - `email_verifications` - Stores email verification tokens
      - `id` (uuid, primary key)
      - `staff_id` (text, references staff)
      - `token` (text, unique)
      - `expires_at` (timestamptz)
      - `verified` (boolean)
      - `verified_at` (timestamptz)
      - `created_at` (timestamptz)
  
  2. New Functions
    - `create_verification_token` - Creates verification token for new staff
    - `verify_email_token` - Verifies email using token
  
  3. Schema Changes
    - Add `email_verified` column to staff table
    - Add `email_verified_at` column to staff table
  
  4. Security
    - Enable RLS on email_verifications table
    - Tokens expire after 24 hours
    - Tokens can only be used once
*/

-- Add email verification columns to staff table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE staff ADD COLUMN email_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff' AND column_name = 'email_verified_at'
  ) THEN
    ALTER TABLE staff ADD COLUMN email_verified_at timestamptz;
  END IF;
END $$;

-- Create email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id text NOT NULL REFERENCES staff(staff_id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view own verification tokens"
  ON email_verifications FOR SELECT
  TO authenticated
  USING (staff_id = current_setting('app.staff_id', true));

CREATE POLICY "System can manage verification tokens"
  ON email_verifications FOR ALL
  TO authenticated
  USING (true);

-- Function to create verification token
CREATE OR REPLACE FUNCTION create_verification_token(p_staff_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_token text;
  v_expires_at timestamptz;
BEGIN
  v_token := encode(gen_random_bytes(32), 'hex');
  v_expires_at := NOW() + interval '24 hours';

  UPDATE email_verifications
  SET verified = true
  WHERE staff_id = p_staff_id AND verified = false;

  INSERT INTO email_verifications (staff_id, token, expires_at)
  VALUES (p_staff_id, v_token, v_expires_at);

  RETURN json_build_object(
    'success', true,
    'token', v_token,
    'expires_at', v_expires_at
  );
END;
$$;

-- Function to verify email token
CREATE OR REPLACE FUNCTION verify_email_token(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_verification record;
  v_staff record;
BEGIN
  SELECT * INTO v_verification
  FROM email_verifications
  WHERE token = p_token
    AND verified = false
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid or expired verification token.'
    );
  END IF;

  SELECT * INTO v_staff
  FROM staff
  WHERE staff_id = v_verification.staff_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Staff account not found.'
    );
  END IF;

  UPDATE staff
  SET 
    email_verified = true,
    email_verified_at = NOW()
  WHERE staff_id = v_staff.staff_id;

  UPDATE email_verifications
  SET 
    verified = true,
    verified_at = NOW()
  WHERE id = v_verification.id;

  RETURN json_build_object(
    'success', true,
    'message', 'Email verified successfully.',
    'staff_id', v_staff.staff_id,
    'email', v_staff.email
  );
END;
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_staff_id ON email_verifications(staff_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);

-- Update staff_register function to create verification token
CREATE OR REPLACE FUNCTION staff_register(
  p_staff_id text,
  p_email text,
  p_password text,
  p_name text,
  p_role text,
  p_department text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_password_hash text;
  v_staff record;
  v_verification_token json;
  v_valid_roles text[] := ARRAY['admin', 'deputy_manager', 'program_officer', 'user'];
BEGIN
  IF p_staff_id IS NULL OR p_staff_id = '' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Staff ID is required'
    );
  END IF;

  IF p_email IS NULL OR p_email = '' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Email is required'
    );
  END IF;

  IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid email format'
    );
  END IF;

  IF p_password IS NULL OR length(p_password) < 6 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Password must be at least 6 characters long'
    );
  END IF;

  IF p_name IS NULL OR p_name = '' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Name is required'
    );
  END IF;

  IF NOT (p_role = ANY(v_valid_roles)) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid role. Must be one of: admin, deputy_manager, program_officer, user'
    );
  END IF;

  IF EXISTS (SELECT 1 FROM staff WHERE staff_id = p_staff_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Staff ID already exists'
    );
  END IF;

  IF EXISTS (SELECT 1 FROM staff WHERE email = p_email) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Email already exists'
    );
  END IF;

  v_password_hash := crypt(p_password, gen_salt('bf'));

  INSERT INTO staff (
    staff_id,
    email,
    password_hash,
    name,
    role,
    department,
    is_active,
    is_locked,
    failed_login_attempts,
    password_reset_required,
    onboarding_completed,
    last_password_change,
    email_verified
  )
  VALUES (
    p_staff_id,
    p_email,
    v_password_hash,
    p_name,
    p_role,
    p_department,
    true,
    false,
    0,
    false,
    false,
    NOW(),
    false
  )
  RETURNING * INTO v_staff;

  v_verification_token := create_verification_token(v_staff.staff_id);

  RETURN json_build_object(
    'success', true,
    'staff', json_build_object(
      'id', v_staff.id,
      'staff_id', v_staff.staff_id,
      'email', v_staff.email,
      'name', v_staff.name,
      'role', v_staff.role,
      'department', v_staff.department,
      'is_active', v_staff.is_active,
      'created_at', v_staff.created_at
    ),
    'verification_token', v_verification_token->>'token',
    'message', 'Account created successfully. Please verify your email.'
  );
END;
$$;
