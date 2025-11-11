/*
  # Update Staff Register Function

  1. Changes
    - Add support for all staff roles (flmi_senior_advisor, program_manager)
    - Add phone_number parameter
    - Update role validation
    - Improve error messages

  2. Security
    - Maintains password hashing
    - Email validation
    - Duplicate checks
*/

-- Drop existing function
DROP FUNCTION IF EXISTS staff_register(text, text, text, text, text, text);

-- Create updated staff_register function with all roles and phone support
CREATE OR REPLACE FUNCTION staff_register(
  p_staff_id text,
  p_email text,
  p_password text,
  p_name text,
  p_role text DEFAULT 'program_officer',
  p_department text DEFAULT NULL,
  p_phone_number text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_password_hash text;
  v_staff record;
  v_valid_roles text[] := ARRAY['admin', 'deputy_manager', 'program_officer', 'flmi_senior_advisor', 'program_manager', 'user'];
BEGIN
  -- Validate staff_id
  IF p_staff_id IS NULL OR p_staff_id = '' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Staff ID is required'
    );
  END IF;

  -- Validate email
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

  -- Validate password
  IF p_password IS NULL OR length(p_password) < 6 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Password must be at least 6 characters long'
    );
  END IF;

  -- Validate name
  IF p_name IS NULL OR p_name = '' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Name is required'
    );
  END IF;

  -- Validate role
  IF NOT (p_role = ANY(v_valid_roles)) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid role. Must be one of: admin, deputy_manager, program_officer, flmi_senior_advisor, program_manager, user'
    );
  END IF;

  -- Check for duplicate staff_id
  IF EXISTS (SELECT 1 FROM staff WHERE staff_id = p_staff_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Staff ID already exists'
    );
  END IF;

  -- Check for duplicate email
  IF EXISTS (SELECT 1 FROM staff WHERE email = p_email) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Email already exists'
    );
  END IF;

  -- Hash the password
  v_password_hash := extensions.crypt(p_password, extensions.gen_salt('bf'));

  -- Insert new staff member
  INSERT INTO staff (
    staff_id,
    email,
    password_hash,
    name,
    role,
    department,
    phone_number,
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
    p_phone_number,
    true,
    false,
    0,
    false,
    false,
    NOW(),
    false
  )
  RETURNING * INTO v_staff;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'staff', json_build_object(
      'id', v_staff.id,
      'staff_id', v_staff.staff_id,
      'email', v_staff.email,
      'name', v_staff.name,
      'role', v_staff.role,
      'department', v_staff.department,
      'phone_number', v_staff.phone_number,
      'is_active', v_staff.is_active,
      'created_at', v_staff.created_at
    ),
    'message', 'User created successfully'
  );
END;
$$;
