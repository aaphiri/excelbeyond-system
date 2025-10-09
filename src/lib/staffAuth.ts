import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

export interface StaffUser {
  id: string;
  staff_id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  onboarding_completed: boolean;
  password_reset_required: boolean;
}

export interface LoginResult {
  success: boolean;
  user?: StaffUser;
  session_token?: string;
  expires_at?: string;
  error?: string;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

export async function staffLogin(
  staffId: string,
  password: string,
  rememberMe: boolean = false
): Promise<LoginResult> {
  try {
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('staff_id', staffId)
      .maybeSingle();

    if (staffError || !staff) {
      await supabase.from('login_attempts').insert({
        staff_id: staffId,
        attempt_type: 'failure',
        failure_reason: 'Invalid staff ID',
      });

      return {
        success: false,
        error: 'Invalid credentials',
      };
    }

    if (!staff.is_active) {
      return {
        success: false,
        error: 'Account is inactive. Please contact administrator.',
      };
    }

    if (staff.is_locked) {
      const lockoutTime = new Date(staff.last_failed_login).getTime();
      const now = Date.now();

      if (now - lockoutTime < LOCKOUT_DURATION) {
        const remainingMinutes = Math.ceil((LOCKOUT_DURATION - (now - lockoutTime)) / 60000);
        return {
          success: false,
          error: `Account is locked due to multiple failed login attempts. Try again in ${remainingMinutes} minutes.`,
        };
      } else {
        await supabase
          .from('staff')
          .update({ is_locked: false, failed_login_attempts: 0 })
          .eq('id', staff.id);
      }
    }

    const passwordMatch = await bcrypt.compare(password, staff.password_hash);

    if (!passwordMatch) {
      const newAttempts = staff.failed_login_attempts + 1;
      const shouldLock = newAttempts >= MAX_ATTEMPTS;

      await supabase
        .from('staff')
        .update({
          failed_login_attempts: newAttempts,
          last_failed_login: new Date().toISOString(),
          is_locked: shouldLock,
        })
        .eq('id', staff.id);

      await supabase.from('login_attempts').insert({
        staff_id: staffId,
        attempt_type: shouldLock ? 'locked' : 'failure',
        failure_reason: 'Invalid password',
      });

      if (shouldLock) {
        return {
          success: false,
          error: 'Account locked due to multiple failed login attempts. Try again in 15 minutes.',
        };
      }

      return {
        success: false,
        error: `Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`,
      };
    }

    await supabase
      .from('staff')
      .update({
        failed_login_attempts: 0,
        last_login: new Date().toISOString(),
        is_locked: false,
      })
      .eq('id', staff.id);

    const sessionToken = crypto.randomUUID();
    const expiresAt = rememberMe
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    await supabase.from('staff_sessions').insert({
      staff_id: staffId,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
      remember_me: rememberMe,
    });

    await supabase.from('login_attempts').insert({
      staff_id: staffId,
      attempt_type: 'success',
    });

    const userData: StaffUser = {
      id: staff.id,
      staff_id: staff.staff_id,
      email: staff.email,
      name: staff.name,
      role: staff.role,
      department: staff.department,
      onboarding_completed: staff.onboarding_completed,
      password_reset_required: staff.password_reset_required,
    };

    return {
      success: true,
      user: userData,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during login',
    };
  }
}

export async function verifyStaffSession(sessionToken: string): Promise<StaffUser | null> {
  try {
    const { data: session } = await supabase
      .from('staff_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (!session || new Date(session.expires_at) < new Date()) {
      return null;
    }

    const { data: staff } = await supabase
      .from('staff')
      .select('*')
      .eq('staff_id', session.staff_id)
      .maybeSingle();

    if (!staff || !staff.is_active) {
      return null;
    }

    await supabase
      .from('staff_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('session_token', sessionToken);

    return {
      id: staff.id,
      staff_id: staff.staff_id,
      email: staff.email,
      name: staff.name,
      role: staff.role,
      department: staff.department,
      onboarding_completed: staff.onboarding_completed,
      password_reset_required: staff.password_reset_required,
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

export async function staffLogout(sessionToken: string): Promise<void> {
  try {
    await supabase
      .from('staff_sessions')
      .delete()
      .eq('session_token', sessionToken);
  } catch (error) {
    console.error('Logout error:', error);
  }
}
