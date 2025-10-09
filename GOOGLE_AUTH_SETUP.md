# Google Authentication Setup Guide

This document provides step-by-step instructions to configure Google OAuth authentication for the Excel Beyond Student Management System.

## Prerequisites

- Supabase project with database access
- Google Cloud Console account
- Excel Beyond deployed URL (or localhost for development)

---

## Part 1: Configure Google Cloud Console

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `Excel Beyond Auth`
4. Click "Create"

### Step 2: Enable Google+ API

1. Navigate to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "Internal" (if using Google Workspace) or "External"
3. Fill in the required fields:
   - **App name**: Excel Beyond Student Management
   - **User support email**: your@familylegacyzambia.org
   - **Developer contact**: your@familylegacyzambia.org
4. Click "Save and Continue"
5. Skip "Scopes" (default scopes are sufficient)
6. Click "Save and Continue"
7. Review and click "Back to Dashboard"

### Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Configure:
   - **Name**: Excel Beyond Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (for development)
     - `https://your-production-domain.com` (for production)
   - **Authorized redirect URIs**:
     - `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
     - (Get this from Supabase Dashboard → Authentication → Providers → Google)
5. Click "Create"
6. Copy the **Client ID** and **Client Secret** (you'll need these for Supabase)

---

## Part 2: Configure Supabase Authentication

### Step 1: Enable Google Provider

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to "Authentication" → "Providers"
4. Find "Google" and click "Enable"

### Step 2: Add Google Credentials

1. Paste your **Google Client ID**
2. Paste your **Google Client Secret**
3. Click "Save"

### Step 3: Configure Redirect URLs

1. In the same Google provider settings, note the **Callback URL (Redirect URL)**
2. Make sure this URL is added to your Google Cloud Console (see Part 1, Step 4)

### Step 4: Configure Email Domain Restrictions (Optional but Recommended)

While the application code enforces @familylegacyzambia.org restriction, you can also add this in Supabase:

1. Go to "Authentication" → "URL Configuration"
2. Set **Site URL**: `https://your-production-domain.com`
3. Add **Redirect URLs**:
   - `http://localhost:5173/dashboard` (development)
   - `https://your-production-domain.com/dashboard` (production)

---

## Part 3: Environment Configuration

### Update `.env` File

Ensure your `.env` file has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

These values are available in your Supabase Dashboard → Settings → API

---

## Part 4: Database Configuration

The auth_users table has already been created with the migration. Verify it exists:

```sql
SELECT * FROM auth_users LIMIT 1;
```

The table includes:
- `id` - Primary key
- `auth_id` - Supabase Auth user ID
- `email` - Must end with @familylegacyzambia.org
- `name` - User's full name
- `photo_url` - Profile photo from Google
- `role` - User role (admin, deputy_manager, program_officer, user)
- `is_active` - Account status
- `last_login` - Last login timestamp
- `created_at` - Account creation date

---

## Part 5: Testing the Authentication Flow

### Local Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173`

3. You should see the Google Sign-In page

4. Click "Sign in with Google"

5. Select a Google account with @familylegacyzambia.org email

6. After successful authentication:
   - A new user record is created in auth_users table
   - User is redirected to /dashboard
   - Session is maintained across page refreshes

### Test Domain Restriction

1. Try signing in with a non-@familylegacyzambia.org email
2. You should see the error: "Access restricted to Family Legacy Zambia accounts only"
3. User should be automatically signed out

---

## Part 6: User Roles and Permissions

The system supports 4 roles with hierarchical permissions:

### Role Hierarchy

1. **user** (default) - Basic access to all modules
2. **program_officer** - Enhanced access for program management
3. **deputy_manager** - Access to admin features (yearbook, stories management)
4. **admin** - Full system access including settings and user management

### Assigning Roles

To change a user's role, update the database:

```sql
UPDATE auth_users
SET role = 'admin'
WHERE email = 'user@familylegacyzambia.org';
```

### Protected Routes

Some routes require specific roles:
- `/yearbook-admin` - Requires deputy_manager or higher
- `/impact-stories-admin` - Requires deputy_manager or higher
- `/settings` - Requires admin only

---

## Part 7: Security Features

### Domain Validation

- **Frontend**: Checks email domain after Google OAuth callback
- **Backend**: Database constraint ensures only @familylegacyzambia.org emails
- **Auto-signout**: Users with invalid domains are automatically signed out

### Row Level Security (RLS)

All auth_users table operations are protected with RLS policies:
- Users can view their own profile
- Users can update their own profile
- Admins can manage all users
- Authenticated users can view active users

### Session Management

- Sessions are managed by Supabase Auth
- JWT tokens are automatically refreshed
- Sessions persist across page refreshes
- Sign out clears all session data

---

## Part 8: Troubleshooting

### Issue: "Access restricted" error for valid @familylegacyzambia.org email

**Solution**:
1. Check that the email exactly matches the domain (no typos)
2. Verify the auth_users table constraint allows the domain
3. Check browser console for detailed error messages

### Issue: Google Sign-In popup blocked

**Solution**:
1. Allow popups for your domain in browser settings
2. Try using a different browser
3. Check that JavaScript origins are correctly configured in Google Cloud Console

### Issue: Redirect loop after sign-in

**Solution**:
1. Verify redirect URLs in Supabase match those in Google Cloud Console
2. Check that Site URL is correctly set in Supabase
3. Clear browser cache and cookies

### Issue: User created but cannot access system

**Solution**:
1. Check user's `is_active` status in database
2. Verify user's role is valid
3. Check RLS policies are correctly configured

---

## Part 9: Production Deployment

### Pre-deployment Checklist

- [ ] Update Google Cloud Console with production URLs
- [ ] Update Supabase redirect URLs with production domain
- [ ] Update `.env` with production environment variables
- [ ] Test authentication flow on staging environment
- [ ] Verify domain restriction works correctly
- [ ] Test role-based access control
- [ ] Ensure all RLS policies are enabled

### Post-deployment

1. Monitor authentication logs in Supabase Dashboard
2. Check for failed authentication attempts
3. Verify user creation flow works correctly
4. Test sign-out functionality

---

## Part 10: Managing Users

### Creating the First Admin

After deploying, create your first admin user:

1. Sign in with your @familylegacyzambia.org account
2. This creates a user with default role 'user'
3. Manually update the role in Supabase SQL Editor:

```sql
UPDATE auth_users
SET role = 'admin'
WHERE email = 'youremail@familylegacyzambia.org';
```

4. Sign out and sign back in to apply the new role

### Deactivating Users

To deactivate a user without deleting their account:

```sql
UPDATE auth_users
SET is_active = false
WHERE email = 'user@familylegacyzambia.org';
```

Deactivated users cannot access the system even if they sign in.

---

## Support

For technical support or questions about the authentication system, contact the development team or refer to:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

---

## Security Best Practices

1. **Never commit credentials**: Keep `.env` files out of version control
2. **Use environment variables**: Different keys for dev/staging/production
3. **Monitor auth logs**: Regular check for suspicious activity
4. **Regular audits**: Review user roles and permissions quarterly
5. **Keep packages updated**: Regularly update @supabase/supabase-js
6. **Enable MFA**: Consider enabling multi-factor authentication in future

---

**Last Updated**: 2025-10-09
**Version**: 1.0
**Maintainer**: Excel Beyond Development Team
