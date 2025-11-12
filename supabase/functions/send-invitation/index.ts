import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface InvitationRequest {
  email: string;
  staff_id: string;
  role: string;
  invite_url: string;
  expires_at: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, staff_id, role, invite_url, expires_at }: InvitationRequest = await req.json();

    if (!email || !staff_id || !role || !invite_url) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const expiryDate = new Date(expires_at).toLocaleDateString();
    const expiryTime = new Date(expires_at).toLocaleTimeString();

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ExcelHub</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
          }
          .content {
            padding: 30px 20px;
          }
          .info-box {
            background: #f0fdf4;
            border-left: 4px solid #059669;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #d1fae5;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #047857;
          }
          .button {
            display: inline-block;
            background: #059669;
            color: #ffffff;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover {
            background: #047857;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666666;
            font-size: 14px;
            background: #f9fafb;
          }
          .expiry-notice {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Welcome to ExcelHub!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">You've been invited to join our team</p>
          </div>
          
          <div class="content">
            <p>Hello,</p>
            
            <p>You've been invited to join the ExcelHub Family Legacy system. We're excited to have you on board!</p>
            
            <div class="info-box">
              <div class="info-row">
                <span class="label">Email:</span>
                <span>${email}</span>
              </div>
              <div class="info-row">
                <span class="label">Staff ID:</span>
                <span>${staff_id}</span>
              </div>
              <div class="info-row">
                <span class="label">Role:</span>
                <span style="text-transform: capitalize;">${role.replace('_', ' ')}</span>
              </div>
            </div>

            <p>To complete your registration and set up your account, please click the button below:</p>
            
            <div style="text-align: center;">
              <a href="${invite_url}" class="button">Complete Registration</a>
            </div>

            <div class="expiry-notice">
              <strong>⏰ Important:</strong> This invitation will expire on <strong>${expiryDate}</strong> at <strong>${expiryTime}</strong>. Please complete your registration before then.
            </div>

            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Click the button above to open the registration page</li>
              <li>Create a secure password for your account</li>
              <li>Complete your profile information</li>
              <li>Start using ExcelHub immediately</li>
            </ul>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="background: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 14px;">
              ${invite_url}
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;"><strong>ExcelHub Family Legacy</strong></p>
            <p style="margin: 5px 0 0 0;">Excellence Beyond Expectations</p>
            <p style="margin: 15px 0 0 0; font-size: 12px; color: #999999;">
              If you didn't expect this invitation, please ignore this email or contact your administrator.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`Sending invitation email to: ${email}`);
    console.log(`Invite URL: ${invite_url}`);
    console.log(`Note: Email sending is simulated. Configure SMTP for production.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Invitation email prepared successfully",
        details: {
          email,
          staff_id,
          role,
          expires_at: expiryDate + " " + expiryTime
        },
        note: "Email sending is simulated. Configure SMTP/email service for production."
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});