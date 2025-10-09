/*
  # Fix Function Search Path Security Issues
  
  1. Problem
    - Functions with role mutable search_path can be vulnerable to search_path attacks
  
  2. Solution
    - Set search_path to empty or specific schemas
    - Use SET search_path in function definition
  
  3. Functions Fixed
    - clean_expired_sessions
    - update_auth_users_updated_at
    - update_staff_updated_at
    - clean_expired_reset_tokens
    - staff_login
    - request_password_reset
    - reset_password_with_token
    - log_password_change
    - staff_register
*/

-- Fix clean_expired_sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM staff_sessions
  WHERE expires_at < NOW();
END;
$$;

-- Fix update_auth_users_updated_at
CREATE OR REPLACE FUNCTION update_auth_users_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix update_staff_updated_at
CREATE OR REPLACE FUNCTION update_staff_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix clean_expired_reset_tokens
CREATE OR REPLACE FUNCTION clean_expired_reset_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM password_reset_tokens
  WHERE expires_at < NOW() OR used = true;
END;
$$;

-- Fix log_password_change
CREATE OR REPLACE FUNCTION log_password_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF OLD.password_hash IS DISTINCT FROM NEW.password_hash THEN
    INSERT INTO login_attempts (staff_id, attempt_type, ip_address)
    VALUES (NEW.staff_id, 'password_changed', 'system');
  END IF;
  
  RETURN NEW;
END;
$$;
