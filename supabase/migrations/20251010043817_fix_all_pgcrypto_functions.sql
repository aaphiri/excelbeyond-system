/*
  # Fix all functions using pgcrypto
  
  Updates all authentication functions to use fully qualified pgcrypto functions.
*/

-- Fix staff_login
CREATE OR REPLACE FUNCTION staff_login(
  p_staff_id text,
  p_password text,
  p_remember_me boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_staff record;
  v_password_valid boolean;
  v_session_token text;
  v_expires_at timestamptz;
  v_lockout_duration interval := '15 minutes';
  v_max_attempts integer := 5;
BEGIN
  SELECT * INTO v_staff
  FROM staff
  WHERE staff_id = p_staff_id;

  IF NOT FOUND THEN
    INSERT INTO login_attempts (staff_id, attempt_type, failure_reason)
    VALUES (p_staff_id, 'failure', 'Invalid staff ID');
    
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid credentials',
      'status', 401
    );
  END IF;

  IF NOT v_staff.is_active THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Account is inactive. Please contact administrator.',
      'status', 403
    );
  END IF;

  IF v_staff.is_locked THEN
    IF v_staff.last_failed_login IS NOT NULL AND 
       (NOW() - v_staff.last_failed_login) < v_lockout_duration THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Account is locked due to multiple failed login attempts. Try again in 15 minutes.',
        'status', 423
      );
    ELSE
      UPDATE staff
      SET is_locked = false, failed_login_attempts = 0
      WHERE id = v_staff.id;
      
      v_staff.is_locked := false;
      v_staff.failed_login_attempts := 0;
    END IF;
  END IF;

  v_password_valid := (v_staff.password_hash = extensions.crypt(p_password, v_staff.password_hash));

  IF NOT v_password_valid THEN
    UPDATE staff
    SET 
      failed_login_attempts = failed_login_attempts + 1,
      last_failed_login = NOW(),
      is_locked = CASE WHEN failed_login_attempts + 1 >= v_max_attempts THEN true ELSE false END
    WHERE id = v_staff.id
    RETURNING failed_login_attempts, is_locked INTO v_staff.failed_login_attempts, v_staff.is_locked;

    INSERT INTO login_attempts (staff_id, attempt_type, failure_reason)
    VALUES (p_staff_id, CASE WHEN v_staff.is_locked THEN 'locked' ELSE 'failure' END, 'Invalid password');

    IF v_staff.is_locked THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Account locked due to multiple failed login attempts. Try again in 15 minutes.',
        'status', 423
      );
    END IF;

    RETURN json_build_object(
      'success', false,
      'error', format('Invalid credentials. %s attempts remaining.', v_max_attempts - v_staff.failed_login_attempts),
      'status', 401
    );
  END IF;

  UPDATE staff
  SET 
    failed_login_attempts = 0,
    last_login = NOW(),
    is_locked = false
  WHERE id = v_staff.id;

  v_session_token := encode(extensions.gen_random_bytes(32), 'hex');
  
  IF p_remember_me THEN
    v_expires_at := NOW() + interval '30 days';
  ELSE
    v_expires_at := NOW() + interval '1 day';
  END IF;

  INSERT INTO staff_sessions (staff_id, session_token, expires_at, remember_me)
  VALUES (p_staff_id, v_session_token, v_expires_at, p_remember_me);

  INSERT INTO login_attempts (staff_id, attempt_type)
  VALUES (p_staff_id, 'success');

  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', v_staff.id,
      'staff_id', v_staff.staff_id,
      'auth_id', v_staff.staff_id,
      'email', v_staff.email,
      'name', v_staff.name,
      'role', v_staff.role,
      'department', v_staff.department,
      'is_active', v_staff.is_active,
      'onboarding_completed', v_staff.onboarding_completed,
      'password_reset_required', v_staff.password_reset_required,
      'last_login', NOW(),
      'created_at', v_staff.created_at
    ),
    'session_token', v_session_token,
    'expires_at', v_expires_at
  );
END;
$$;

-- Fix reset_password_with_token
CREATE OR REPLACE FUNCTION reset_password_with_token(
  p_token text,
  p_new_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_reset_token record;
  v_staff record;
  v_password_hash text;
BEGIN
  SELECT * INTO v_reset_token
  FROM password_reset_tokens
  WHERE token = p_token
    AND used = false
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid or expired reset token.'
    );
  END IF;

  SELECT * INTO v_staff
  FROM staff
  WHERE staff_id = v_reset_token.staff_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Staff account not found.'
    );
  END IF;

  v_password_hash := extensions.crypt(p_new_password, extensions.gen_salt('bf'));

  UPDATE staff
  SET 
    password_hash = v_password_hash,
    password_reset_required = false,
    failed_login_attempts = 0,
    is_locked = false
  WHERE staff_id = v_staff.staff_id;

  UPDATE password_reset_tokens
  SET used = true
  WHERE id = v_reset_token.id;

  INSERT INTO login_attempts (staff_id, attempt_type, ip_address)
  VALUES (v_staff.staff_id, 'password_reset', 'system');

  RETURN json_build_object(
    'success', true,
    'message', 'Password reset successfully.',
    'staff_id', v_staff.staff_id,
    'email', v_staff.email
  );
END;
$$;

-- Fix request_password_reset
CREATE OR REPLACE FUNCTION request_password_reset(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_staff record;
  v_token text;
  v_expires_at timestamptz;
BEGIN
  SELECT * INTO v_staff
  FROM staff
  WHERE email = p_email AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'If an account exists with this email, you will receive password reset instructions.'
    );
  END IF;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_expires_at := NOW() + interval '1 hour';

  UPDATE password_reset_tokens
  SET used = true
  WHERE staff_id = v_staff.staff_id AND used = false;

  INSERT INTO password_reset_tokens (staff_id, token, expires_at)
  VALUES (v_staff.staff_id, v_token, v_expires_at);

  RETURN json_build_object(
    'success', true,
    'token', v_token,
    'staff_id', v_staff.staff_id,
    'email', v_staff.email,
    'expires_at', v_expires_at,
    'message', 'Password reset token generated successfully.'
  );
END;
$$;

-- Fix create_verification_token
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
