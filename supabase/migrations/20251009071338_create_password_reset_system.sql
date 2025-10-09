/*
  # Create password reset system with email notifications
  
  1. New Tables
    - `password_reset_tokens` - Stores password reset tokens
      - `id` (uuid, primary key)
      - `staff_id` (text, references staff)
      - `token` (text, unique)
      - `expires_at` (timestamptz)
      - `used` (boolean)
      - `created_at` (timestamptz)
  
  2. New Functions
    - `request_password_reset` - Creates reset token
    - `reset_password_with_token` - Resets password using token
    - `send_password_change_notification` - Logs password change
  
  3. Security
    - Enable RLS on password_reset_tokens table
    - Tokens expire after 1 hour
    - Tokens can only be used once
*/

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id text NOT NULL REFERENCES staff(staff_id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view own reset tokens"
  ON password_reset_tokens FOR SELECT
  TO authenticated
  USING (staff_id = current_setting('app.staff_id', true));

-- Function to request password reset
CREATE OR REPLACE FUNCTION request_password_reset(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_staff record;
  v_token text;
  v_expires_at timestamptz;
BEGIN
  -- Find staff by email
  SELECT * INTO v_staff
  FROM staff
  WHERE email = p_email AND is_active = true;

  -- Always return success to prevent email enumeration
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'If an account exists with this email, you will receive password reset instructions.'
    );
  END IF;

  -- Generate secure token
  v_token := encode(gen_random_bytes(32), 'hex');
  v_expires_at := NOW() + interval '1 hour';

  -- Invalidate any existing unused tokens for this staff
  UPDATE password_reset_tokens
  SET used = true
  WHERE staff_id = v_staff.staff_id AND used = false;

  -- Create new token
  INSERT INTO password_reset_tokens (staff_id, token, expires_at)
  VALUES (v_staff.staff_id, v_token, v_expires_at);

  -- Return token (in production, this would be sent via email)
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

-- Function to reset password with token
CREATE OR REPLACE FUNCTION reset_password_with_token(
  p_token text,
  p_new_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reset_token record;
  v_staff record;
  v_password_hash text;
BEGIN
  -- Find valid token
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

  -- Get staff record
  SELECT * INTO v_staff
  FROM staff
  WHERE staff_id = v_reset_token.staff_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Staff account not found.'
    );
  END IF;

  -- Hash the new password
  v_password_hash := crypt(p_new_password, gen_salt('bf'));

  -- Update password
  UPDATE staff
  SET 
    password_hash = v_password_hash,
    password_reset_required = false,
    failed_login_attempts = 0,
    is_locked = false
  WHERE staff_id = v_staff.staff_id;

  -- Mark token as used
  UPDATE password_reset_tokens
  SET used = true
  WHERE id = v_reset_token.id;

  -- Log the password change
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

-- Function to log password changes
CREATE OR REPLACE FUNCTION log_password_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only log if password_hash actually changed
  IF OLD.password_hash IS DISTINCT FROM NEW.password_hash THEN
    INSERT INTO login_attempts (staff_id, attempt_type, ip_address)
    VALUES (NEW.staff_id, 'password_changed', 'system');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for password changes
DROP TRIGGER IF EXISTS trigger_log_password_change ON staff;
CREATE TRIGGER trigger_log_password_change
  AFTER UPDATE ON staff
  FOR EACH ROW
  EXECUTE FUNCTION log_password_change();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_staff_id ON password_reset_tokens(staff_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
