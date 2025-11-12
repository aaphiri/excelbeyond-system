/*
  # Fix gen_random_bytes Function References - V2

  1. Issue
    - Functions are calling gen_random_bytes without proper schema reference
    - pgcrypto extension is installed but functions need to use extensions.gen_random_bytes
    
  2. Solution
    - Ensure pgcrypto extension is enabled
    - Drop existing functions that need parameter updates
    - Recreate all functions to use proper search_path
    - Fix function references to gen_random_bytes and crypt

  3. Functions Updated
    - create_verification_token
    - create_user_invitation
    - accept_invitation
    - staff_register (with all parameters)
*/

-- Ensure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- Grant usage on extensions schema
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;

-- Drop existing functions to recreate with proper parameters
DROP FUNCTION IF EXISTS staff_register(text, text, text, text, text, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS staff_register(text, text, text, text, text, text);

-- Recreate create_verification_token with proper search_path
CREATE OR REPLACE FUNCTION create_verification_token(p_staff_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_token text;
  v_expires_at timestamptz;
BEGIN
  v_token := encode(extensions.gen_random_bytes(32), 'hex');
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

-- Recreate create_user_invitation with proper search_path
CREATE OR REPLACE FUNCTION create_user_invitation(
  p_email text,
  p_staff_id text,
  p_role text,
  p_department text,
  p_invited_by uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_token text;
  v_expires_at timestamptz;
  v_invitation record;
  v_valid_roles text[] := ARRAY['admin', 'deputy_manager', 'program_officer', 'user'];
BEGIN
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

  IF p_staff_id IS NULL OR p_staff_id = '' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Staff ID is required'
    );
  END IF;

  IF NOT (p_role = ANY(v_valid_roles)) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid role. Must be one of: admin, deputy_manager, program_officer, user'
    );
  END IF;

  IF EXISTS (SELECT 1 FROM staff WHERE email = p_email) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'A user with this email already exists'
    );
  END IF;

  IF EXISTS (SELECT 1 FROM staff WHERE staff_id = p_staff_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This Staff ID is already taken'
    );
  END IF;

  IF EXISTS (
    SELECT 1 FROM user_invitations 
    WHERE email = p_email 
    AND status = 'pending' 
    AND expires_at > NOW()
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'An active invitation for this email already exists'
    );
  END IF;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_expires_at := NOW() + interval '7 days';

  INSERT INTO user_invitations (
    email,
    staff_id,
    role,
    department,
    invited_by,
    invitation_token,
    status,
    expires_at
  )
  VALUES (
    p_email,
    p_staff_id,
    p_role,
    p_department,
    p_invited_by,
    v_token,
    'pending',
    v_expires_at
  )
  RETURNING * INTO v_invitation;

  RETURN json_build_object(
    'success', true,
    'invitation', json_build_object(
      'id', v_invitation.id,
      'email', v_invitation.email,
      'staff_id', v_invitation.staff_id,
      'role', v_invitation.role,
      'department', v_invitation.department,
      'invitation_token', v_invitation.invitation_token,
      'expires_at', v_invitation.expires_at,
      'created_at', v_invitation.created_at
    )
  );
END;
$$;

-- Recreate accept_invitation with proper search_path
CREATE OR REPLACE FUNCTION accept_invitation(
  p_token text,
  p_password text,
  p_first_name text,
  p_middle_name text,
  p_last_name text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_invitation record;
  v_password_hash text;
  v_full_name text;
  v_staff record;
BEGIN
  SELECT * INTO v_invitation
  FROM user_invitations
  WHERE invitation_token = p_token
    AND status = 'pending'
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid or expired invitation'
    );
  END IF;

  IF p_password IS NULL OR length(p_password) < 8 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Password must be at least 8 characters long'
    );
  END IF;

  v_full_name := trim(concat_ws(' ', p_first_name, p_middle_name, p_last_name));
  IF v_full_name = '' THEN
    v_full_name := v_invitation.email;
  END IF;

  v_password_hash := extensions.crypt(p_password, extensions.gen_salt('bf'));

  INSERT INTO staff (
    staff_id,
    email,
    password_hash,
    name,
    first_name,
    middle_name,
    last_name,
    role,
    department,
    is_active,
    is_locked,
    failed_login_attempts,
    password_reset_required,
    onboarding_completed,
    last_password_change,
    email_verified,
    email_verified_at
  )
  VALUES (
    v_invitation.staff_id,
    v_invitation.email,
    v_password_hash,
    v_full_name,
    p_first_name,
    p_middle_name,
    p_last_name,
    v_invitation.role,
    v_invitation.department,
    true,
    false,
    0,
    false,
    false,
    NOW(),
    true,
    NOW()
  )
  RETURNING * INTO v_staff;

  UPDATE user_invitations
  SET 
    status = 'accepted',
    accepted_at = NOW(),
    updated_at = NOW()
  WHERE id = v_invitation.id;

  RETURN json_build_object(
    'success', true,
    'message', 'Account created successfully',
    'staff', json_build_object(
      'staff_id', v_staff.staff_id,
      'email', v_staff.email,
      'name', v_staff.name,
      'role', v_staff.role
    )
  );
END;
$$;

-- Recreate staff_register with proper search_path and all parameters
CREATE OR REPLACE FUNCTION staff_register(
  p_staff_id text,
  p_email text,
  p_password text,
  p_name text,
  p_role text,
  p_department text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_middle_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_gender text DEFAULT NULL,
  p_phone_number text DEFAULT NULL,
  p_username text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
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

  v_password_hash := extensions.crypt(p_password, extensions.gen_salt('bf'));

  INSERT INTO staff (
    staff_id,
    email,
    password_hash,
    name,
    first_name,
    middle_name,
    last_name,
    role,
    department,
    gender,
    phone_number,
    username,
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
    p_first_name,
    p_middle_name,
    p_last_name,
    p_role,
    p_department,
    p_gender,
    p_phone_number,
    p_username,
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
