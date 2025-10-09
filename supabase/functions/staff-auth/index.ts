import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PasswordResetRequest {
  email: string;
}

interface PasswordChangeRequest {
  token: string;
  newPassword: string;
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