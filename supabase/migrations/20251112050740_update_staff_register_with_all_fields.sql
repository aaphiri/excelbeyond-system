/*
  # Update Staff Register Function with All Fields

  1. Changes
    - Add parameters for first_name, middle_name, last_name, gender
    - Add username parameter
    - Add profile_photo_url parameter
    - Set account_status to 'active' by default
    - Auto-generate username if not provided
    - Combine names into full name field
    - Validate all required fields

  2. Security
    - Maintains password hashing
    - Email and username validation
    - Duplicate checks for username
*/

-- Drop existing function
DROP FUNCTION IF EXISTS staff_register(text, text, text, text, text, text, text);

-- Create updated staff_register function
CREATE OR REPLACE FUNCTION staff_register(
  p_staff_id text,
  p_email text,
  p_password text,
  p_first_name text,
  p_last_name text,
  p_middle_name text DEFAULT NULL,
  p_gender text DEFAULT NULL,
  p_username text DEFAULT NULL,
  p_role text DEFAULT 'program_officer',
  p_department text DEFAULT NULL,
  p_phone_number text DEFAULT NULL,
  p_profile_photo_url text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_password_hash text;
  v_staff record;
  v_full_name text;
  v_username text;
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

  -- Validate names
  IF p_first_name IS NULL OR p_first_name = '' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'First name is required'
    );
  END IF;

  IF p_last_name IS NULL OR p_last_name = '' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Last name is required'
    );
  END IF;

  -- Validate gender if provided
  IF p_gender IS NOT NULL AND p_gender NOT IN ('male', 'female', 'other', 'prefer_not_to_say') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid gender value'
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

  -- Generate username if not provided
  v_username := p_username;
  IF v_username IS NULL OR v_username = '' THEN
    v_username := lower(p_first_name || '.' || p_last_name);
    -- Add number if username exists
    IF EXISTS (SELECT 1 FROM staff WHERE username = v_username) THEN
      v_username := v_username || floor(random() * 1000)::text;
    END IF;
  END IF;

  -- Check for duplicate username
  IF EXISTS (SELECT 1 FROM staff WHERE username = v_username) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Username already exists'
    );
  END IF;

  -- Build full name
  v_full_name := p_first_name;
  IF p_middle_name IS NOT NULL AND p_middle_name != '' THEN
    v_full_name := v_full_name || ' ' || p_middle_name;
  END IF;
  v_full_name := v_full_name || ' ' || p_last_name;

  -- Hash the password
  v_password_hash := extensions.crypt(p_password, extensions.gen_salt('bf'));

  -- Insert new staff member
  INSERT INTO staff (
    staff_id,
    email,
    password_hash,
    first_name,
    middle_name,
    last_name,
    name,
    gender,
    username,
    role,
    department,
    phone_number,
    profile_photo_url,
    account_status,
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
    p_first_name,
    p_middle_name,
    p_last_name,
    v_full_name,
    p_gender,
    v_username,
    p_role,
    p_department,
    p_phone_number,
    p_profile_photo_url,
    'active',
    true,
    false,
    0,
    false,
    true,
    NOW(),
    true
  )
  RETURNING * INTO v_staff;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'staff', json_build_object(
      'id', v_staff.id,
      'staff_id', v_staff.staff_id,
      'email', v_staff.email,
      'first_name', v_staff.first_name,
      'middle_name', v_staff.middle_name,
      'last_name', v_staff.last_name,
      'name', v_staff.name,
      'gender', v_staff.gender,
      'username', v_staff.username,
      'role', v_staff.role,
      'department', v_staff.department,
      'phone_number', v_staff.phone_number,
      'profile_photo_url', v_staff.profile_photo_url,
      'account_status', v_staff.account_status,
      'is_active', v_staff.is_active,
      'created_at', v_staff.created_at
    ),
    'message', 'User created successfully and is active'
  );
END;
$$;
