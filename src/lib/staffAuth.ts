import { supabase } from './supabase';

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

export async function staffLogin(
  staffId: string,
  password: string,
  rememberMe: boolean = false
): Promise<LoginResult> {
  try {
    const { data, error } = await supabase.rpc('staff_login', {
      p_staff_id: staffId,
      p_password: password,
      p_remember_me: rememberMe,
    });

    if (error) {
      console.error('Login RPC error:', error);
      return {
        success: false,
        error: 'An error occurred during login',
      };
    }

    return data as LoginResult;
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
