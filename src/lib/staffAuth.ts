export interface StaffUser {
  id: string;
  staff_id: string;
  auth_id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  is_active: boolean;
  onboarding_completed: boolean;
  password_reset_required?: boolean;
  last_login: string;
  created_at: string;
}

export interface LoginResult {
  success: boolean;
  user?: StaffUser;
  session_token?: string;
  expires_at?: string;
  error?: string;
}

export interface RegisterRequest {
  staffId: string;
  email: string;
  password: string;
  name: string;
  role: string;
  department?: string;
}

export interface RegisterResult {
  success: boolean;
  staff?: any;
  error?: string;
}

export async function staffLogin(
  staffId: string,
  password: string,
  rememberMe: boolean = false
): Promise<LoginResult> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/staff-auth/login`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ staffId, password, rememberMe }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Login failed',
      };
    }

    return {
      success: true,
      user: data.user,
      session_token: data.session_token,
      expires_at: data.expires_at,
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during login',
    };
  }
}

export async function staffRegister(
  request: RegisterRequest
): Promise<RegisterResult> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/staff-auth/register`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Registration failed',
      };
    }

    return {
      success: true,
      staff: data.staff,
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during registration',
    };
  }
}

export async function verifyStaffSession(sessionToken: string): Promise<StaffUser | null> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/staff-auth/verify-session`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ session_token: sessionToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

export async function staffLogout(sessionToken: string): Promise<void> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/staff-auth/logout`;

    await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ session_token: sessionToken }),
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
}
