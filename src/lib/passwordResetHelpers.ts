export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResult {
  success: boolean;
  token?: string;
  message?: string;
  error?: string;
}

export interface PasswordChangeRequest {
  token: string;
  newPassword: string;
}

export interface PasswordChangeResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function requestPasswordReset(email: string): Promise<PasswordResetResult> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/staff-auth/forgot-password`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to send reset email',
      };
    }

    return {
      success: true,
      token: data.token,
      message: data.message || 'Password reset email sent successfully',
    };
  } catch (error: any) {
    console.error('Password reset request error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process request. Please try again.',
    };
  }
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<PasswordChangeResult> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/staff-auth/reset-password`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to reset password',
      };
    }

    return {
      success: true,
      message: data.message || 'Password reset successfully',
    };
  } catch (error: any) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: error.message || 'Failed to reset password. Please try again.',
    };
  }
}

export async function verifyEmailToken(token: string): Promise<PasswordChangeResult> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/staff-auth/verify-email`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to verify email',
      };
    }

    return {
      success: true,
      message: data.message || 'Email verified successfully',
    };
  } catch (error: any) {
    console.error('Email verification error:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify email. Please try again.',
    };
  }
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 6) {
    return {
      valid: false,
      error: 'Password must be at least 6 characters long',
    };
  }

  return { valid: true };
}

export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): { valid: boolean; error?: string } {
  if (password !== confirmPassword) {
    return {
      valid: false,
      error: 'Passwords do not match',
    };
  }

  return { valid: true };
}

export function isTokenExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

export function getTokenExpiryTime(type: 'password_reset' | 'email_verification'): string {
  const expiryHours = type === 'password_reset' ? 1 : 24;
  return `${expiryHours} hour${expiryHours > 1 ? 's' : ''}`;
}
