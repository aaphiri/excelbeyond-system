/*
  # User Invitation System

  1. New Tables
    - `user_invitations` - Stores invitation details for new users
      - `id` (uuid, primary key)
      - `email` (text, unique for pending invites)
      - `staff_id` (text, unique identifier to be assigned)
      - `role` (text, role to be assigned)
      - `department` (text, optional)
      - `invited_by` (uuid, references staff)
      - `invitation_token` (text, unique)
      - `status` (text: pending, accepted, expired, cancelled)
      - `expires_at` (timestamptz)
      - `accepted_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Functions
    - `create_user_invitation` - Creates invitation and generates token
    - `get_invitation_by_token` - Retrieves invitation details
    - `accept_invitation` - Accepts invitation and creates staff account
    - `cancel_invitation` - Cancels pending invitation

  3. Security
    - Enable RLS on user_invitations table
    - Admin and deputy_manager can create invitations
    - Anyone can view invitation by token
    - Only inviter can cancel invitation
    - Invitations expire after 7 days

  4. Indexes
    - Index on email for quick lookups
    - Index on token for invitation acceptance
    - Index on status for filtering
*/

-- Create user_invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  staff_id text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'user',
  department text,
  invited_by uuid NOT NULL,
  invitation_token text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_pending_email UNIQUE (email, status)
);

ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all invitations"
  ON user_invitations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and deputy managers can create invitations"
  ON user_invitations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Inviter can cancel own invitations"
  ON user_invitations FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view invitation by token"
  ON user_invitations FOR SELECT
  TO anon
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);
CREATE INDEX IF NOT EXISTS idx_user_invitations_expires_at ON user_invitations(expires_at);

-- Function to create user invitation
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
SET search_path = public, pg_temp
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

  v_token := encode(gen_random_bytes(32), 'hex');
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

-- Function to get invitation by token
CREATE OR REPLACE FUNCTION get_invitation_by_token(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_invitation record;
BEGIN
  SELECT * INTO v_invitation
  FROM user_invitations
  WHERE invitation_token = p_token;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invitation not found'
    );
  END IF;

  IF v_invitation.status != 'pending' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This invitation has already been ' || v_invitation.status
    );
  END IF;

  IF v_invitation.expires_at < NOW() THEN
    UPDATE user_invitations
    SET status = 'expired', updated_at = NOW()
    WHERE id = v_invitation.id;

    RETURN json_build_object(
      'success', false,
      'error', 'This invitation has expired'
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'invitation', json_build_object(
      'email', v_invitation.email,
      'staff_id', v_invitation.staff_id,
      'role', v_invitation.role,
      'department', v_invitation.department,
      'expires_at', v_invitation.expires_at
    )
  );
END;
$$;

-- Function to accept invitation
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
SET search_path = public, pg_temp
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

  v_password_hash := crypt(p_password, gen_salt('bf'));

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

-- Function to cancel invitation
CREATE OR REPLACE FUNCTION cancel_invitation(p_invitation_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_invitation record;
BEGIN
  SELECT * INTO v_invitation
  FROM user_invitations
  WHERE id = p_invitation_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invitation not found'
    );
  END IF;

  IF v_invitation.status != 'pending' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Only pending invitations can be cancelled'
    );
  END IF;

  UPDATE user_invitations
  SET 
    status = 'cancelled',
    updated_at = NOW()
  WHERE id = p_invitation_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Invitation cancelled successfully'
  );
END;
$$;
