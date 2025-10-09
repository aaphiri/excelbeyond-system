/*
  # Fix Critical RLS Performance Issues
  
  Wraps auth.uid() calls with (SELECT auth.uid()) to evaluate once per query instead of per row.
  Only fixes policies that exist and are problematic.
*/

-- Fix auth_users policies
DROP POLICY IF EXISTS "Users can view their own profile" ON auth_users;
CREATE POLICY "Users can view their own profile"
  ON auth_users FOR SELECT
  TO authenticated
  USING (auth_id::text = (SELECT auth.uid()::text));

DROP POLICY IF EXISTS "Users can update their own profile" ON auth_users;
CREATE POLICY "Users can update their own profile"
  ON auth_users FOR UPDATE
  TO authenticated
  USING (auth_id::text = (SELECT auth.uid()::text));

DROP POLICY IF EXISTS "Admins can manage all users" ON auth_users;
CREATE POLICY "Admins can manage all users"
  ON auth_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth_users au
      WHERE au.auth_id::text = (SELECT auth.uid()::text)
      AND au.role = 'admin'
    )
  );

-- Fix staff policies
DROP POLICY IF EXISTS "Staff can view their own profile" ON staff;
CREATE POLICY "Staff can view their own profile"
  ON staff FOR SELECT
  TO authenticated
  USING (
    staff_id = current_setting('app.staff_id', true)
    OR EXISTS (
      SELECT 1 FROM auth_users
      WHERE auth_users.auth_id::text = (SELECT auth.uid()::text)
      AND auth_users.email = staff.email
    )
  );

DROP POLICY IF EXISTS "Staff can update their own profile" ON staff;
CREATE POLICY "Staff can update their own profile"
  ON staff FOR UPDATE
  TO authenticated
  USING (
    staff_id = current_setting('app.staff_id', true)
    OR EXISTS (
      SELECT 1 FROM auth_users
      WHERE auth_users.auth_id::text = (SELECT auth.uid()::text)
      AND auth_users.email = staff.email
    )
  );

DROP POLICY IF EXISTS "Admins can view all staff" ON staff;
CREATE POLICY "Admins can view all staff"
  ON staff FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth_users
      WHERE auth_users.auth_id::text = (SELECT auth.uid()::text)
      AND auth_users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage all staff" ON staff;
CREATE POLICY "Admins can manage all staff"
  ON staff FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth_users
      WHERE auth_users.auth_id::text = (SELECT auth.uid()::text)
      AND auth_users.role = 'admin'
    )
  );

-- Fix login_attempts policies
DROP POLICY IF EXISTS "Admins can view login attempts" ON login_attempts;
CREATE POLICY "Admins can view login attempts"
  ON login_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth_users
      WHERE auth_users.auth_id::text = (SELECT auth.uid()::text)
      AND auth_users.role = 'admin'
    )
  );

-- Fix password_reset_tokens policies  
DROP POLICY IF EXISTS "Staff can view own reset tokens" ON password_reset_tokens;
CREATE POLICY "Staff can view own reset tokens"
  ON password_reset_tokens FOR SELECT
  TO authenticated
  USING (staff_id = current_setting('app.staff_id', true));
