/*
  # Fix staff_register function - pgcrypto schema
  
  Updates the staff_register function to use fully qualified pgcrypto functions
  to avoid schema search issues.
*/

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

  v_password_hash := extensions.crypt(p_password, extensions.gen_salt('bf'));

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
