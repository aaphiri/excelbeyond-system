/*
  # Create Staff Authentication System

  1. New Tables
    - `staff`
      - Staff credentials and profiles
      - Staff ID and password-based authentication
      - Role-based access control
    
    - `login_attempts`
      - Track failed login attempts for security
      - Rate limiting and brute force protection
    
    - `password_reset_tokens`
      - Secure password reset functionality
      - Time-limited tokens

  2. Security
    - Password hashes stored securely
    - Rate limiting on login attempts
    - Token-based password reset
    - RLS policies for data protection
    - Session management

  3. Features
    - Staff ID and password authentication
    - Role-based access (admin, manager, staff)
    - Password reset workflow
    - Login attempt tracking
    - Account lockout protection
*/

CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text CHECK (role IN ('admin', 'deputy_manager', 'program_officer', 'staff')) DEFAULT 'staff',
  department text,
  phone_number text,
  is_active boolean DEFAULT true,
  is_locked boolean DEFAULT false,
  failed_login_attempts integer DEFAULT 0,
  last_failed_login timestamptz,
  last_login timestamptz,
  last_password_change timestamptz DEFAULT now(),
  password_reset_required boolean DEFAULT false,
  created_by text,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id text,
  ip_address text,
  user_agent text,
  attempt_type text CHECK (attempt_type IN ('success', 'failure', 'locked')) DEFAULT 'failure',
  failure_reason text,
  attempted_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id text NOT NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staff_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id text NOT NULL,
  session_token text UNIQUE NOT NULL,
  ip_address text,
  user_agent text,
  expires_at timestamptz NOT NULL,
  remember_me boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_staff_id ON staff(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);

CREATE INDEX IF NOT EXISTS idx_login_attempts_staff ON login_attempts(staff_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts(attempted_at);

CREATE INDEX IF NOT EXISTS idx_reset_tokens_staff ON password_reset_tokens(staff_id);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_expires ON password_reset_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_sessions_staff ON staff_sessions(staff_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON staff_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON staff_sessions(expires_at);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view their own profile"
  ON staff FOR SELECT
  TO authenticated
  USING (staff_id = current_setting('app.current_staff_id', true));

CREATE POLICY "Staff can update their own profile"
  ON staff FOR UPDATE
  TO authenticated
  USING (staff_id = current_setting('app.current_staff_id', true))
  WITH CHECK (staff_id = current_setting('app.current_staff_id', true));

CREATE POLICY "Admins can view all staff"
  ON staff FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.staff_id = current_setting('app.current_staff_id', true)
      AND s.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all staff"
  ON staff FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.staff_id = current_setting('app.current_staff_id', true)
      AND s.role = 'admin'
    )
  );

CREATE POLICY "System can insert staff"
  ON staff FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view login attempts"
  ON login_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.staff_id = current_setting('app.current_staff_id', true)
      AND s.role = 'admin'
    )
  );

CREATE POLICY "System can log login attempts"
  ON login_attempts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can manage password reset tokens"
  ON password_reset_tokens FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "System can manage sessions"
  ON staff_sessions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_staff_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_updated_at();

CREATE OR REPLACE FUNCTION clean_expired_reset_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_tokens
  WHERE expires_at < now() AND used = false;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM staff_sessions
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

INSERT INTO staff (staff_id, email, password_hash, name, role, department, is_active)
VALUES
  ('ADMIN001', 'admin@familylegacyzambia.org', '$2a$10$placeholder_hash_replace_in_production', 'System Administrator', 'admin', 'Administration', true),
  ('STAFF001', 'manager@familylegacyzambia.org', '$2a$10$placeholder_hash_replace_in_production', 'Program Manager', 'deputy_manager', 'Programs', true),
  ('STAFF002', 'officer@familylegacyzambia.org', '$2a$10$placeholder_hash_replace_in_production', 'Program Officer', 'program_officer', 'Programs', true)
ON CONFLICT (staff_id) DO NOTHING;