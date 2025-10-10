import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LoginRequest {
  staffId: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterRequest {
  staffId: string;
  email: string;
  password: string;
  name: string;
  role: string;
  department?: string;
}

interface PasswordResetRequest {
  email: string;
}

interface PasswordChangeRequest {
  token: string;
  newPassword: string;
}

interface EmailVerificationRequest {
  token: string;
}

async function sendVerificationEmail(email: string, token: string, staffName: string) {
  console.log(`
    ========================================
    EMAIL VERIFICATION
    ========================================
    To: ${email}
    Subject: Verify Your Email Address

    Hello ${staffName},

    Welcome to Excel Beyond Staff Portal!

    Please verify your email address using the token below:

    Verification Token: ${token}

    This link will expire in 24 hours.

    Best regards,
    Excel Beyond Team
    ========================================
  `);
}

async function sendPasswordResetEmail(email: string, token: string, staffName: string) {
  console.log(`
    ========================================
    PASSWORD RESET EMAIL
    ========================================
    To: ${email}
    Subject: Password Reset Request

    Hello ${staffName},

    You have requested to reset your password for Excel Beyond Staff Portal.

    Reset Token: ${token}

    This link will expire in 1 hour.

    If you did not request this password reset, please ignore this email.

    Best regards,
    Excel Beyond Team
    ========================================
  `);
}

async function sendPasswordChangeNotification(email: string, staffName: string) {
  console.log(`
    ========================================
    PASSWORD CHANGE NOTIFICATION
    ========================================
    To: ${email}
    Subject: Password Changed Successfully

    Hello ${staffName},

    Your password for Excel Beyond Staff Portal has been changed successfully.

    If you did not make this change, please contact your administrator immediately.

    Best regards,
    Excel Beyond Team
    ========================================
  `);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    if (req.method === "POST" && path === "login") {
      const { staffId, password, rememberMe }: LoginRequest = await req.json();

      const { data, error } = await supabase.rpc('staff_login', {
        p_staff_id: staffId,
        p_password: password,
        p_remember_me: rememberMe || false
      });

      if (error) {
        console.error('Login RPC error:', error);
        return new Response(
          JSON.stringify({ error: "Invalid credentials" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!data.success) {
        return new Response(
          JSON.stringify({ error: data.error }),
          { status: data.status || 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          user: data.user,
          session_token: data.session_token,
          expires_at: data.expires_at
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST" && path === "register") {
      const { staffId, email, password, name, role, department }: RegisterRequest = await req.json();

      const { data, error } = await supabase.rpc('staff_register', {
        p_staff_id: staffId,
        p_email: email,
        p_password: password,
        p_name: name,
        p_role: role,
        p_department: department
      });

      if (error) {
        console.error('Registration RPC error:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!data.success) {
        return new Response(
          JSON.stringify({ error: data.error }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (data.verification_token) {
        await sendVerificationEmail(email, data.verification_token, name);
      }

      return new Response(
        JSON.stringify({
          success: true,
          staff: data.staff,
          verification_token: data.verification_token,
          message: data.message
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST" && path === "verify-email") {
      const { token }: EmailVerificationRequest = await req.json();

      const { data, error } = await supabase.rpc('verify_email_token', {
        p_token: token
      });

      if (error) {
        console.error('Email verification error:', error);
        return new Response(
          JSON.stringify({ error: "Failed to verify email. Please try again." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!data.success) {
        return new Response(
          JSON.stringify({ error: data.error || "Invalid or expired verification token" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: data.message
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST" && path === "verify-session") {
      const { session_token } = await req.json();

      const { data: session } = await supabase
        .from("staff_sessions")
        .select("*")
        .eq("session_token", session_token)
        .maybeSingle();

      if (!session || new Date(session.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired session" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: staff } = await supabase
        .from("staff")
        .select("*")
        .eq("staff_id", session.staff_id)
        .maybeSingle();

      if (!staff || !staff.is_active) {
        return new Response(
          JSON.stringify({ error: "Account inactive" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase
        .from("staff_sessions")
        .update({ last_activity: new Date().toISOString() })
        .eq("session_token", session_token);

      const userData = {
        id: staff.id,
        staff_id: staff.staff_id,
        auth_id: staff.staff_id,
        email: staff.email,
        name: staff.name,
        role: staff.role,
        department: staff.department,
        is_active: staff.is_active,
        onboarding_completed: staff.onboarding_completed,
        last_login: staff.last_login,
        created_at: staff.created_at
      };

      return new Response(
        JSON.stringify({ user: userData }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST" && path === "logout") {
      const { session_token } = await req.json();

      await supabase
        .from("staff_sessions")
        .delete()
        .eq("session_token", session_token);

      return new Response(
        JSON.stringify({ message: "Logged out successfully" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST" && path === "forgot-password") {
      const { email }: PasswordResetRequest = await req.json();

      const { data, error } = await supabase.rpc('request_password_reset', {
        p_email: email
      });

      if (error) {
        console.error('Password reset RPC error:', error);
        return new Response(
          JSON.stringify({
            message: "If an account exists with this email, you will receive password reset instructions."
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (data.success && data.token) {
        await sendPasswordResetEmail(data.email, data.token, data.email.split('@')[0]);
      }

      return new Response(
        JSON.stringify({
          message: "If an account exists with this email, you will receive password reset instructions.",
          token: data.token
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST" && path === "reset-password") {
      const { token, newPassword }: PasswordChangeRequest = await req.json();

      const { data, error } = await supabase.rpc('reset_password_with_token', {
        p_token: token,
        p_new_password: newPassword
      });

      if (error) {
        console.error('Password reset error:', error);
        return new Response(
          JSON.stringify({ error: "Failed to reset password. Please try again." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!data.success) {
        return new Response(
          JSON.stringify({ error: data.error || "Invalid or expired reset token" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await sendPasswordChangeNotification(data.email, data.email.split('@')[0]);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Password reset successfully. You can now login with your new password."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});