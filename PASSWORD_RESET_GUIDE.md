# Password Reset System - User Guide

## Overview
The password reset system allows staff members to securely reset their passwords through a token-based verification process.

## How to Use

### Step 1: Request Password Reset
1. Go to the Staff Login page at `/staff-login`
2. Click on "Forgot Password?" link
3. Enter your email address
4. Click "Send Reset Link"

### Step 2: Get Reset Token
**Development Mode:**
- The reset token will be displayed directly on the success screen
- Copy the token or click "Use Token to Reset Password" button

**Production Mode (when email is configured):**
- Check your email for the password reset message
- Copy the reset token from the email
- The token expires in 1 hour

### Step 3: Reset Your Password
1. You will be redirected to the Reset Password page (or navigate manually to `/reset-password`)
2. Enter the reset token
3. Enter your new password (minimum 6 characters)
4. Confirm your new password
5. Click "Reset Password"
6. You will be redirected to login with your new password

## Email Verification System

### New User Registration
1. Register at `/staff-login` (click "Create Account" tab)
2. Fill in all required information
3. Click "Create Account"
4. A verification token will be displayed (in development mode)
5. Click "Verify Email Now" or navigate to `/verify-email`
6. Enter the verification token
7. Your email is now verified and you can login

## Security Features

### Password Reset
- Tokens expire after 1 hour
- Tokens are single-use only
- Previous unused tokens are invalidated when a new one is requested
- Failed login attempts are reset on successful password reset
- Account unlocks automatically if locked

### Email Verification
- Tokens expire after 24 hours
- Tokens are single-use only
- Required before full account activation
- Tracks verification time

## API Endpoints

### Password Reset Flow
```
POST /functions/v1/staff-auth/forgot-password
Body: { email: "user@example.com" }
Response: { message: "...", token: "..." }

POST /functions/v1/staff-auth/reset-password
Body: { token: "...", newPassword: "..." }
Response: { success: true, message: "..." }
```

### Email Verification Flow
```
POST /functions/v1/staff-auth/register
Body: { staffId, email, password, name, role, department }
Response: { success: true, staff: {...}, verification_token: "..." }

POST /functions/v1/staff-auth/verify-email
Body: { token: "..." }
Response: { success: true, message: "..." }
```

## Database Tables

### password_reset_tokens
- `id` - UUID primary key
- `staff_id` - References staff table
- `token` - Unique reset token
- `expires_at` - Token expiration time
- `used` - Whether token has been used
- `created_at` - Token creation time

### email_verifications
- `id` - UUID primary key
- `staff_id` - References staff table
- `token` - Unique verification token
- `expires_at` - Token expiration time
- `verified` - Whether token has been used
- `verified_at` - Verification completion time
- `created_at` - Token creation time

## Troubleshooting

### "Invalid or expired reset token"
- The token may have expired (1 hour limit)
- The token may have already been used
- Request a new password reset

### "Invalid or expired verification token"
- The token may have expired (24 hour limit)
- The token may have already been used
- Contact your administrator

### "Account is locked"
- Too many failed login attempts
- Will automatically unlock after 15 minutes
- Or use password reset to unlock immediately

## Development vs Production

### Development Mode
- Tokens are displayed on screen for testing
- Console logs show email content
- Quick links provided for testing

### Production Mode (Future)
- Tokens sent via email only
- SMTP configuration required
- Email templates customizable
- No tokens displayed in UI
