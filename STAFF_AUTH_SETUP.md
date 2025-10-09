# Staff Authentication System - Complete Setup Guide

This document provides comprehensive information about the secure Staff ID and Password authentication system for Excel Beyond.

## Overview

The system now supports **dual authentication methods**:
1. **Google OAuth** - For users with @familylegacyzambia.org email
2. **Staff ID & Password** - For internal staff access

Both systems maintain the green theme and integrate seamlessly.

---

## Authentication Methods

### Method 1: Google OAuth (Existing)
- Domain-restricted to @familylegacyzambia.org
- Auto-creates user profiles
- Used by external staff and administrators
- See `GOOGLE_AUTH_SETUP.md` for configuration

### Method 2: Staff ID & Password (NEW)
- Internal staff authentication
- Secure password hashing with bcrypt
- Rate limiting and account lockout
- Session-based access control
- Password reset functionality

---

## Database Schema

### `staff` Table
Stores staff credentials and profiles.

**Columns:**
- `id` (uuid) - Primary key
- `staff_id` (text, unique) - Staff identifier (e.g., ADMIN001)
- `email` (text, unique) - Staff email
- `password_hash` (text) - Bcrypt hashed password
- `name` (text) - Full name
- `role` (text) - admin, deputy_manager, program_officer, staff
- `department` (text) - Department assignment
- `phone_number` (text) - Contact number
- `is_active` (boolean) - Account status
- `is_locked` (boolean) - Lockout status
- `failed_login_attempts` (integer) - Failed attempt counter
- `last_failed_login` (timestamptz) - Last failed attempt timestamp
- `last_login` (timestamptz) - Last successful login
- `last_password_change` (timestamptz) - Password change tracking
- `password_reset_required` (boolean) - Force password reset
- `onboarding_completed` (boolean) - Onboarding status
- `created_by` (text) - Creator identifier
- `created_at`, `updated_at` (timestamptz)

### `login_attempts` Table
Tracks all login attempts for security auditing.

**Columns:**
- `id` (uuid) - Primary key
- `staff_id` (text) - Staff identifier
- `ip_address` (text) - Request IP
- `user_agent` (text) - Browser information
- `attempt_type` (text) - success, failure, locked
- `failure_reason` (text) - Reason for failure
- `attempted_at` (timestamptz) - Timestamp

### `password_reset_tokens` Table
Manages password reset requests.

**Columns:**
- `id` (uuid) - Primary key
- `staff_id` (text) - Staff identifier
- `token` (text, unique) - Reset token
- `expires_at` (timestamptz) - Expiration time (1 hour)
- `used` (boolean) - Token usage status
- `used_at` (timestamptz) - Usage timestamp
- `created_at` (timestamptz)

### `staff_sessions` Table
Manages active staff sessions.

**Columns:**
- `id` (uuid) - Primary key
- `staff_id` (text) - Staff identifier
- `session_token` (text, unique) - Session identifier
- `ip_address` (text) - Session IP
- `user_agent` (text) - Browser information
- `expires_at` (timestamptz) - Session expiration
- `remember_me` (boolean) - Extended session flag
- `created_at` (timestamptz)
- `last_activity` (timestamptz) - Last activity tracking

---

## Security Features

### Password Security
- **Bcrypt Hashing**: All passwords hashed with bcrypt (10 rounds)
- **No Plain Text**: Passwords never stored in plain text
- **Secure Transmission**: HTTPS required for all requests

### Rate Limiting
- **Max Attempts**: 5 failed login attempts
- **Lockout Duration**: 15 minutes
- **Countdown**: Shows remaining attempts
- **Auto-unlock**: Account unlocks after timeout

### Session Management
- **Standard Session**: 24 hours
- **Remember Me**: 30 days
- **Activity Tracking**: Last activity timestamp
- **Token-Based**: Secure session tokens
- **Auto-Expiration**: Sessions expire automatically

### Account Protection
- **Account Lockout**: After 5 failed attempts
- **IP Tracking**: All attempts logged
- **Audit Trail**: Complete login history
- **Password Reset**: Secure token-based reset
- **Token Expiration**: Reset tokens expire in 1 hour

---

## Edge Function API

### Endpoint: `/functions/v1/staff-auth`

All endpoints use this base URL with specific paths.

#### POST `/login`
Authenticates staff member.

**Request:**
```json
{
  "staffId": "ADMIN001",
  "password": "secure_password",
  "rememberMe": true
}
```

**Response (Success):**
```json
{
  "user": {
    "id": "uuid",
    "staff_id": "ADMIN001",
    "email": "admin@familylegacyzambia.org",
    "name": "System Administrator",
    "role": "admin",
    "department": "Administration",
    "onboarding_completed": true,
    "password_reset_required": false
  },
  "session_token": "uuid",
  "expires_at": "2025-11-09T10:00:00Z"
}
```

**Response (Failure):**
```json
{
  "error": "Invalid credentials. 3 attempts remaining."
}
```

**Status Codes:**
- `200` - Login successful
- `401` - Invalid credentials
- `403` - Account inactive
- `423` - Account locked

#### POST `/register`
Creates new staff account (admin only).

**Request:**
```json
{
  "staffId": "STAFF003",
  "email": "newstaff@familylegacyzambia.org",
  "password": "initial_password",
  "name": "New Staff Member",
  "role": "staff",
  "department": "Programs"
}
```

**Response:**
```json
{
  "success": true,
  "staff": {
    "id": "uuid",
    "staff_id": "STAFF003",
    "email": "newstaff@familylegacyzambia.org",
    "name": "New Staff Member",
    "role": "staff"
  }
}
```

#### POST `/forgot-password`
Initiates password reset.

**Request:**
```json
{
  "email": "user@familylegacyzambia.org"
}
```

**Response:**
```json
{
  "message": "Password reset instructions sent to your email.",
  "token": "reset-token-uuid"
}
```

#### POST `/reset-password`
Completes password reset.

**Request:**
```json
{
  "token": "reset-token-uuid",
  "newPassword": "new_secure_password"
}
```

**Response:**
```json
{
  "message": "Password reset successful"
}
```

#### POST `/verify-session`
Verifies session validity.

**Request:**
```json
{
  "session_token": "session-uuid"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "staff_id": "ADMIN001",
    "email": "admin@familylegacyzambia.org",
    "name": "System Administrator",
    "role": "admin"
  }
}
```

#### POST `/logout`
Terminates staff session.

**Request:**
```json
{
  "session_token": "session-uuid"
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

## User Interface

### Login Flow

**Step 1: Login Page Selection**
- Main login page shows Google OAuth button
- "OR" divider
- "Staff Login with ID" button
- Green theme maintained

**Step 2: Staff Login Page**
- Staff ID input field with icon
- Password input with show/hide toggle
- "Remember me" checkbox
- "Forgot password?" link
- Security notice box
- "Back to Google Sign-In" link

**Step 3: Authentication**
- Loading state during verification
- Error messages with attempt counter
- Success redirect to onboarding/dashboard

### Error Messages

**Invalid Credentials:**
```
Invalid credentials. 3 attempts remaining.
```

**Account Locked:**
```
Account is locked due to multiple failed login attempts.
Try again in 12 minutes.
```

**Account Inactive:**
```
Account is inactive. Please contact administrator.
```

---

## Default Staff Accounts

Three staff accounts are pre-created:

### Admin Account
- **Staff ID**: ADMIN001
- **Email**: admin@familylegacyzambia.org
- **Role**: admin
- **Department**: Administration
- **Default Password**: Replace in production!

### Manager Account
- **Staff ID**: STAFF001
- **Email**: manager@familylegacyzambia.org
- **Role**: deputy_manager
- **Department**: Programs
- **Default Password**: Replace in production!

### Officer Account
- **Staff ID**: STAFF002
- **Email**: officer@familylegacyzambia.org
- **Role**: program_officer
- **Department**: Programs
- **Default Password**: Replace in production!

**⚠️ CRITICAL: Change all default passwords before production deployment!**

---

## Implementation Details

### Frontend Components

**1. StaffLoginPage.tsx**
- Staff ID and password form
- Show/hide password toggle
- Remember me functionality
- Error handling
- Loading states
- Navigation to forgot password

**2. ForgotPassword.tsx**
- Email input for reset
- Success/error messaging
- Token-based reset flow
- Green theme consistency

**3. AuthContext Updates**
- Dual authentication support
- Staff session verification
- Unified sign-out
- Session persistence

### Authentication Flow

```
1. User lands on /login
   ↓
2. Chooses authentication method
   ├─ Google OAuth → Google flow
   └─ Staff Login → /staff-login
       ↓
3. Enters Staff ID + Password
   ↓
4. Edge Function validates credentials
   ├─ Success → Create session → Redirect
   └─ Failure → Increment attempts → Show error
       ↓
5. After 5 failures → Account locked → 15 min timeout
   ↓
6. Session stored in localStorage
   ↓
7. On app load → Verify session
   ├─ Valid → Load user data
   └─ Invalid → Redirect to login
```

---

## Security Best Practices

### For Production Deployment

1. **Change Default Passwords**
   ```sql
   -- Connect to Supabase and run:
   UPDATE staff
   SET password_hash = 'new_bcrypt_hash'
   WHERE staff_id IN ('ADMIN001', 'STAFF001', 'STAFF002');
   ```

2. **Use Password Hashing Script**
   ```javascript
   import bcrypt from 'bcryptjs';
   const hash = await bcrypt.hash('new_password', 10);
   console.log(hash);
   ```

3. **Enable HTTPS Only**
   - Never use HTTP in production
   - All API calls must use HTTPS

4. **Monitor Login Attempts**
   ```sql
   SELECT * FROM login_attempts
   WHERE attempt_type = 'failure'
   ORDER BY attempted_at DESC
   LIMIT 100;
   ```

5. **Regular Security Audits**
   - Review locked accounts
   - Check suspicious activity
   - Monitor session durations

6. **Password Policies**
   - Minimum 8 characters
   - Require complexity
   - Periodic password changes
   - No password reuse

---

## Creating New Staff Accounts

### Method 1: Admin UI (Recommended)
Use the User Management page to create accounts with proper role assignment.

### Method 2: Direct API Call
```javascript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/staff-auth/register`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      staffId: 'STAFF004',
      email: 'newuser@familylegacyzambia.org',
      password: 'temporary_password',
      name: 'New User',
      role: 'staff',
      department: 'Operations'
    }),
  }
);
```

### Method 3: SQL (Development Only)
```sql
INSERT INTO staff (
  staff_id, email, password_hash, name, role, department
) VALUES (
  'STAFF004',
  'newuser@familylegacyzambia.org',
  '$2a$10$...',  -- Use bcrypt hash
  'New User',
  'staff',
  'Operations'
);
```

---

## Password Reset Flow

### User-Initiated Reset

1. User clicks "Forgot password?"
2. Enters email address
3. System generates reset token
4. Token emailed to user (or displayed in dev)
5. User follows reset link
6. Enters new password
7. Password updated, token marked as used
8. User can now log in

### Admin-Assisted Reset

1. Admin accesses User Management
2. Selects staff member
3. Clicks "Reset Password"
4. Sets temporary password
5. Marks `password_reset_required = true`
6. Staff forced to change password on next login

---

## Troubleshooting

### Issue: "Account is locked"
**Solution**: Wait 15 minutes or admin can unlock:
```sql
UPDATE staff
SET is_locked = false, failed_login_attempts = 0
WHERE staff_id = 'STAFF001';
```

### Issue: "Invalid session"
**Solution**: Clear browser storage and re-login:
```javascript
localStorage.removeItem('staff_session_token');
localStorage.removeItem('staff_user');
```

### Issue: Password reset token expired
**Solution**: Request new reset token (tokens expire in 1 hour)

### Issue: Cannot create staff account
**Solution**: Check staff_id uniqueness and email format

---

## Monitoring & Maintenance

### Regular Tasks

**Daily:**
- Monitor failed login attempts
- Check for locked accounts

**Weekly:**
- Review login attempt patterns
- Clean up expired sessions
- Verify active staff accounts

**Monthly:**
- Audit user roles and permissions
- Review and archive old login attempts
- Update passwords for sensitive accounts

### Cleanup Functions

**Remove Expired Tokens:**
```sql
SELECT clean_expired_reset_tokens();
```

**Remove Expired Sessions:**
```sql
SELECT clean_expired_sessions();
```

---

## Integration with Existing System

### Unified Authentication
- Both Google and Staff auth use same AuthContext
- Same user interface structure
- Consistent role-based access
- Unified onboarding flow
- Single sign-out for both methods

### Role Mapping
Staff roles map directly to system permissions:
- `admin` → Full system access
- `deputy_manager` → Admin features (yearbook, stories)
- `program_officer` → Enhanced features
- `staff` → Basic access

---

## Testing Guide

### Test Accounts
```
Admin:
  Staff ID: ADMIN001
  Password: [Set in production]

Manager:
  Staff ID: STAFF001
  Password: [Set in production]

Officer:
  Staff ID: STAFF002
  Password: [Set in production]
```

### Test Scenarios

1. **Successful Login**
   - Enter valid credentials
   - Verify redirect to dashboard
   - Check session persistence

2. **Failed Login**
   - Enter wrong password
   - Verify attempt counter
   - Check error message

3. **Account Lockout**
   - Fail 5 times
   - Verify account locked
   - Wait 15 minutes
   - Verify auto-unlock

4. **Remember Me**
   - Login with checkbox checked
   - Close browser
   - Reopen - should still be logged in

5. **Password Reset**
   - Request reset
   - Use token
   - Set new password
   - Login with new password

---

## Support

**For Technical Issues:**
- Check browser console for errors
- Verify Supabase Edge Function logs
- Review login_attempts table

**For Access Issues:**
- Contact system administrator
- Provide Staff ID (not password)
- Include error message if any

---

**Last Updated**: 2025-10-09
**Version**: 1.0
**Status**: Production Ready ✅
