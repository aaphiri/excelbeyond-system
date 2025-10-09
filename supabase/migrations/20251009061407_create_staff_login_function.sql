/*
  # Create staff login function
  
  1. New Functions
    - `staff_login` - Server-side function to verify passwords and create sessions
      - Parameters: staff_id, password, remember_me
      - Returns: session data or error
      - Handles all security checks (active, locked, password verification)
      - Tracks login attempts
      - Creates sessions
  
  2. Security
    - Password verification happens on database server
    - No password hashes exposed to client
    - Rate limiting enforced
    - Account lockout mechanism
*/

-- Install pgcrypto extension if not already installed (for crypt function)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create staff login function
CREATE OR REPLACE FUNCTION staff_login(
  p_staff_id text,
  p_password text,
  p_remember_me boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_staff record;
  v_session_token uuid;
  v_expires_at timestamptz;
  v_new_attempts int;
  v_should_lock boolean;
  v_lockout_time timestamptz;
  v_remaining_minutes int;
  v_max_attempts int := 5;
  v_lockout_duration interval := interval '15 minutes';
BEGIN
  -- Get staff record
  SELECT * INTO v_staff
  FROM staff
  WHERE staff_id = p_staff_id;

  -- Check if staff exists
  IF NOT FOUND THEN
    INSERT INTO login_attempts (staff_id, attempt_type, failure_reason)
    VALUES (p_staff_id, 'failure', 'Invalid staff ID');
    
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid credentials'
    );
  END IF;

  -- Check if account is active
  IF NOT v_staff.is_active THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Account is inactive. Please contact administrator.'
    );
  END IF;

  -- Check if account is locked
  IF v_staff.is_locked THEN
    v_lockout_time := v_staff.last_failed_login;
    
    IF (NOW() - v_lockout_time) < v_lockout_duration THEN
      v_remaining_minutes := CEIL(EXTRACT(EPOCH FROM (v_lockout_duration - (NOW() - v_lockout_time))) / 60);
      
      RETURN json_build_object(
        'success', false,
        'error', 'Account is locked due to multiple failed login attempts. Try again in ' || v_remaining_minutes || ' minutes.'
      );
    ELSE
      -- Unlock account if lockout period has passed
      UPDATE staff
      SET is_locked = false, failed_login_attempts = 0
      WHERE id = v_staff.id;
      
      v_staff.is_locked := false;
      v_staff.failed_login_attempts := 0;
    END IF;
  END IF;

  -- Verify password using crypt
  IF NOT (v_staff.password_hash = crypt(p_password, v_staff.password_hash)) THEN
    v_new_attempts := v_staff.failed_login_attempts + 1;
    v_should_lock := v_new_attempts >= v_max_attempts;

    UPDATE staff
    SET 
      failed_login_attempts = v_new_attempts,
      last_failed_login = NOW(),
      is_locked = v_should_lock
    WHERE id = v_staff.id;

    INSERT INTO login_attempts (staff_id, attempt_type, failure_reason)
    VALUES (p_staff_id, CASE WHEN v_should_lock THEN 'locked' ELSE 'failure' END, 'Invalid password');

    IF v_should_lock THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Account locked due to multiple failed login attempts. Try again in 15 minutes.'
      );
    END IF;

    RETURN json_build_object(
      'success', false,
      'error', 'Invalid credentials. ' || (v_max_attempts - v_new_attempts) || ' attempts remaining.'
    );
  END IF;

  -- Password is correct - reset failed attempts and create session
  UPDATE staff
  SET 
    failed_login_attempts = 0,
    last_login = NOW(),
    is_locked = false
  WHERE id = v_staff.id;

  -- Generate session token
  v_session_token := gen_random_uuid();
  
  -- Set expiration
  IF p_remember_me THEN
    v_expires_at := NOW() + interval '30 days';
  ELSE
    v_expires_at := NOW() + interval '24 hours';
  END IF;

  -- Create session
  INSERT INTO staff_sessions (staff_id, session_token, expires_at, remember_me)
  VALUES (p_staff_id, v_session_token, v_expires_at, p_remember_me);

  -- Log successful login
  INSERT INTO login_attempts (staff_id, attempt_type)
  VALUES (p_staff_id, 'success');

  -- Return success with user data and session
  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', v_staff.id,
      'staff_id', v_staff.staff_id,
      'email', v_staff.email,
      'name', v_staff.name,
      'role', v_staff.role,
      'department', v_staff.department,
      'onboarding_completed', v_staff.onboarding_completed,
      'password_reset_required', v_staff.password_reset_required
    ),
    'session_token', v_session_token,
    'expires_at', v_expires_at
  );
END;
$$;
