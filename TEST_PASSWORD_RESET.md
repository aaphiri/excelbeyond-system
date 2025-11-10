# Password Reset System - Testing Checklist

## ✅ Pre-requisites
- [ ] Application is running
- [ ] Supabase database is connected
- [ ] Edge function `staff-auth` is deployed
- [ ] At least one staff account exists for testing

## Test Scenario 1: Complete Password Reset Flow

### Step 1: Request Password Reset
1. Navigate to `/staff-login`
2. Click "Forgot Password?" link
3. **Expected:** Redirected to `/forgot-password`
4. Enter a valid staff email address
5. Click "Send Reset Link"
6. **Expected:**
   - Success message appears
   - Reset token displayed in blue box (Development Mode)
   - "Use Token to Reset Password" button visible

### Step 2: Use Reset Token
7. Click "Use Token to Reset Password" button
8. **Expected:** Redirected to `/reset-password?token=...`
9. Token should be pre-filled in the input field
10. Enter new password (minimum 6 characters)
11. Confirm new password (must match)
12. Click "Reset Password"
13. **Expected:**
    - Success message appears
    - "Password Reset Successful" screen shown
    - "Go to Login" button visible

### Step 3: Login with New Password
14. Click "Go to Login"
15. **Expected:** Redirected to `/staff-login`
16. Enter staff ID and new password
17. Click "Sign In"
18. **Expected:** Successfully logged in and redirected to dashboard

## Test Scenario 2: Manual Token Entry

### Test Manual Password Reset
1. Navigate to `/forgot-password`
2. Enter valid email
3. Copy the reset token manually
4. Navigate directly to `/reset-password`
5. Paste the token
6. Enter and confirm new password
7. Click "Reset Password"
8. **Expected:** Password reset successful
9. Login with new password
10. **Expected:** Login successful

## Test Scenario 3: Email Verification Flow

### New User Registration
1. Navigate to `/staff-login`
2. Click "Create Account" tab
3. Fill in all required fields:
   - Staff ID: unique value
   - Email: valid email
   - Password: min 6 characters
   - Name: full name
   - Role: select from dropdown
4. Click "Create Account"
5. **Expected:**
   - Success message appears
   - Verification token displayed in blue box
   - "Verify Email Now" button visible

### Verify Email
6. Click "Verify Email Now"
7. **Expected:** Redirected to `/verify-email?token=...`
8. Token should be pre-filled
9. Click "Verify Email"
10. **Expected:**
    - Success message "Email Verified!"
    - "Go to Login" button visible

### Login After Verification
11. Click "Go to Login"
12. Enter credentials
13. Click "Sign In"
14. **Expected:** Successfully logged in

## Test Scenario 4: Error Handling

### Invalid Email
1. Go to `/forgot-password`
2. Enter non-existent email
3. Click "Send Reset Link"
4. **Expected:** Generic success message (prevents email enumeration)

### Expired Token
1. Use a token that is older than 1 hour
2. Try to reset password
3. **Expected:** Error "Invalid or expired reset token"

### Invalid Token Format
1. Go to `/reset-password`
2. Enter random text as token
3. Try to reset password
4. **Expected:** Error message

### Password Mismatch
1. Go to `/reset-password` with valid token
2. Enter password in first field
3. Enter different password in confirm field
4. Try to submit
5. **Expected:** Error "Passwords do not match"

### Password Too Short
1. Go to `/reset-password` with valid token
2. Enter password less than 6 characters
3. Try to submit
4. **Expected:** Error "Password must be at least 6 characters long"

### Used Token
1. Use a token that has already been used
2. Try to reset password
3. **Expected:** Error "Invalid or expired reset token"

## Test Scenario 5: Navigation & Links

### From Login to Reset
1. Start at `/staff-login`
2. Click "Forgot Password?"
3. **Expected:** Navigate to `/forgot-password`
4. Click "Back to Login"
5. **Expected:** Navigate back to `/login`

### Direct URL Access
1. Navigate directly to `/reset-password`
2. **Expected:** Page loads, can enter token manually
3. Navigate directly to `/verify-email`
4. **Expected:** Page loads, can enter token manually

## Test Scenario 6: Database Verification

### Check Password Reset Token
```sql
-- After requesting reset, verify token exists
SELECT * FROM password_reset_tokens
WHERE staff_id = 'TEST_STAFF_ID'
ORDER BY created_at DESC LIMIT 1;

-- Verify token is marked as used after reset
SELECT used FROM password_reset_tokens
WHERE token = 'YOUR_TOKEN';
```

### Check Email Verification
```sql
-- After registration, verify token exists
SELECT * FROM email_verifications
WHERE staff_id = 'TEST_STAFF_ID'
ORDER BY created_at DESC LIMIT 1;

-- Verify staff email is marked as verified
SELECT email_verified, email_verified_at
FROM staff
WHERE staff_id = 'TEST_STAFF_ID';
```

### Check Password Change
```sql
-- After reset, verify password_hash changed
SELECT password_hash, last_password_change
FROM staff
WHERE staff_id = 'TEST_STAFF_ID';

-- Verify failed attempts reset to 0
SELECT failed_login_attempts, is_locked
FROM staff
WHERE staff_id = 'TEST_STAFF_ID';
```

## Test Scenario 7: Security Checks

### Account Unlock on Reset
1. Lock an account (5 failed login attempts)
2. Request password reset
3. Reset password
4. **Expected:** Account is unlocked, can login immediately

### Token Invalidation
1. Request password reset (Token A)
2. Request password reset again (Token B)
3. Try to use Token A
4. **Expected:** Token A is invalid
5. Use Token B
6. **Expected:** Token B works

### Single Use Token
1. Get reset token
2. Reset password successfully
3. Try to use same token again
4. **Expected:** Error "Invalid or expired reset token"

## Success Criteria

All test scenarios should pass with:
- ✅ Correct navigation between pages
- ✅ Proper error messages displayed
- ✅ Success confirmations shown
- ✅ Tokens working as expected
- ✅ Database records updated correctly
- ✅ No console errors
- ✅ Responsive UI on mobile
- ✅ Proper loading states
- ✅ Form validations working

## Notes for Production

When moving to production:
1. Configure SMTP server for actual emails
2. Remove token display from UI
3. Update email templates with branding
4. Set up monitoring for failed reset attempts
5. Add rate limiting on reset requests
6. Consider adding CAPTCHA
7. Log all password reset activities
