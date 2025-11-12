# Email Invite System - Complete Guide

## Overview

A fully configured email invitation system for onboarding new users to ExcelHub. Admins and Deputy Managers can send email invitations that allow new staff members to register with pre-assigned roles and Staff IDs.

## System Components

### 1. Database Tables

#### `user_invitations` Table
Stores all invitation records with the following fields:
- `id` - Unique invitation identifier
- `email` - Invitee's email address
- `staff_id` - Pre-assigned Staff ID
- `role` - Pre-assigned role (admin, deputy_manager, program_officer, user)
- `department` - Optional department assignment
- `invited_by` - UUID of staff member who sent invite
- `invitation_token` - Unique token for invitation link
- `status` - Current status (pending, accepted, expired, cancelled)
- `expires_at` - Expiration timestamp (7 days from creation)
- `accepted_at` - When invitation was accepted
- `created_at` - When invitation was created
- `updated_at` - Last update timestamp

### 2. Database Functions

#### `create_user_invitation()`
Creates a new invitation with validation:
- Validates email format
- Checks for duplicate Staff IDs
- Ensures no existing user with email
- Checks for duplicate pending invitations
- Generates secure 64-character token
- Sets 7-day expiration

**Parameters:**
- `p_email` - Recipient email
- `p_staff_id` - Staff ID to assign
- `p_role` - Role to assign
- `p_department` - Optional department
- `p_invited_by` - Inviter's staff UUID

**Returns:**
```json
{
  "success": true,
  "invitation": {
    "id": "uuid",
    "email": "user@example.com",
    "staff_id": "STAFF12345",
    "role": "user",
    "invitation_token": "64-char-hex",
    "expires_at": "timestamp"
  }
}
```

#### `get_invitation_by_token()`
Retrieves and validates invitation by token:
- Checks if invitation exists
- Verifies not already accepted/cancelled
- Auto-expires if past expiration date
- Returns invitation details

**Parameters:**
- `p_token` - Invitation token from URL

**Returns:**
```json
{
  "success": true,
  "invitation": {
    "email": "user@example.com",
    "staff_id": "STAFF12345",
    "role": "user",
    "department": "Excel Beyond",
    "expires_at": "timestamp"
  }
}
```

#### `accept_invitation()`
Processes invitation acceptance and creates staff account:
- Validates invitation token
- Checks password requirements (min 8 characters)
- Creates staff account with hashed password
- Sets email as verified
- Marks invitation as accepted
- Returns staff details

**Parameters:**
- `p_token` - Invitation token
- `p_password` - User's chosen password
- `p_first_name` - First name
- `p_middle_name` - Middle name (optional)
- `p_last_name` - Last name

**Returns:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "staff": {
    "staff_id": "STAFF12345",
    "email": "user@example.com",
    "name": "Full Name",
    "role": "user"
  }
}
```

#### `cancel_invitation()`
Cancels a pending invitation:
- Verifies invitation exists
- Ensures status is pending
- Updates status to cancelled

**Parameters:**
- `p_invitation_id` - UUID of invitation

### 3. Edge Function - `send-invitation`

Generates and prepares invitation emails with:
- Beautiful HTML template
- Invitation details (email, Staff ID, role)
- Clickable registration button
- Expiration date/time
- Backup text link
- Responsive design

**Endpoint:**
```
POST /functions/v1/send-invitation
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "staff_id": "STAFF12345",
  "role": "user",
  "invite_url": "https://app.com/accept-invite?token=...",
  "expires_at": "2025-12-31T23:59:59Z"
}
```

**Note:** Currently configured for development. For production:
1. Configure SMTP service (SendGrid, AWS SES, Mailgun, etc.)
2. Update edge function with email provider API
3. Add environment variables for email credentials

### 4. Frontend Pages

#### Invite User Page (`/invite-user`)
**Access:** Admin and Deputy Manager only

**Features:**
- Create new invitations
- Email input with validation
- Staff ID generator (auto-generate or manual)
- Role selector dropdown
- Optional department field
- View recent invitations list
- Real-time status badges
- Copy invitation link
- Resend invitation email
- Cancel pending invitations

**Form Fields:**
- Email Address (required, validated)
- Staff ID (required, unique)
- Role (dropdown: User, Program Officer, Deputy Manager, Admin)
- Department (optional text)

**Actions:**
- **Generate Staff ID** - Creates random STAFF##### ID
- **Send Invitation** - Creates invite and sends email
- **Copy Link** - Copy invitation URL to clipboard
- **Resend** - Resend invitation email
- **Cancel** - Cancel pending invitation

#### Accept Invite Page (`/accept-invite`)
**Access:** Public (via invitation link)

**URL Format:**
```
https://your-app.com/accept-invite?token=INVITATION_TOKEN
```

**Features:**
- Displays invitation details (email, Staff ID, role)
- Registration form
- Password strength indicator
- Password requirements checklist
- Show/hide password toggles
- Real-time validation
- Error messaging

**Form Fields:**
- First Name (required)
- Middle Name (optional)
- Last Name (required)
- Password (min 8 chars, required)
- Confirm Password (must match)

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Special characters recommended

**Password Strength Levels:**
- Weak (red) - 0-2 criteria
- Fair (yellow) - 3 criteria
- Good (blue) - 4 criteria
- Strong (green) - 5 criteria

## User Workflows

### Admin/Deputy Manager Workflow

1. **Navigate to Invite User**
   - Click profile dropdown → "More" → "Invite User"
   - Or navigate to `/invite-user`

2. **Fill Invitation Form**
   - Enter invitee's email
   - Generate or enter Staff ID
   - Select role from dropdown
   - Optionally add department
   - Click "Send Invitation"

3. **Invitation Created**
   - Success message displayed
   - Email prepared and sent
   - Invitation appears in list below
   - Status: Pending

4. **Manage Invitations**
   - View all invitations in list
   - See status badges (pending, accepted, expired, cancelled)
   - Copy invite link with one click
   - Resend invitation if needed
   - Cancel unused invitations

### New User Workflow

1. **Receive Email**
   - Opens invitation email
   - Sees Staff ID and role assignment
   - Notes expiration date

2. **Click Registration Link**
   - Opens accept-invite page
   - Sees invitation details confirmed
   - Views registration form

3. **Complete Registration**
   - Enters first and last name
   - Creates secure password
   - Confirms password
   - Sees password strength indicator
   - Clicks "Create Account"

4. **Account Created**
   - Redirected to login page
   - Success message displayed
   - Staff ID pre-filled
   - Email verified automatically

5. **First Login**
   - Uses Staff ID and password
   - Logs into system
   - Full access based on role

## Security Features

### Invitation Security

1. **Token Generation**
   - 64-character hexadecimal tokens
   - Cryptographically secure random bytes
   - Unique per invitation

2. **Expiration**
   - 7-day validity period
   - Auto-expires after deadline
   - Cannot be used after expiry

3. **Single Use**
   - Token becomes invalid after acceptance
   - Status changes prevent reuse
   - Database enforces constraints

4. **Validation**
   - Email format checking
   - Staff ID uniqueness
   - Role validation (whitelist)
   - Password strength requirements

### Access Control

1. **Creation Permissions**
   - Only Admin and Deputy Manager can create
   - RLS policies enforce restrictions
   - Database-level security

2. **Invitation Viewing**
   - Authenticated users see invitation list
   - Public can only view own invitation by token
   - No enumeration possible

3. **Cancellation**
   - Only inviter can cancel
   - Pending invitations only
   - Audit trail preserved

## Email Template

### Design Features

- **Responsive HTML** - Works on all devices
- **Brand Colors** - Emerald green theme
- **Clear CTA** - Prominent registration button
- **Information Box** - Highlighted invitation details
- **Expiry Warning** - Amber alert for deadline
- **Instructions** - Step-by-step guidance
- **Fallback Link** - Plain text URL included

### Template Sections

1. **Header** - Gradient background with welcome message
2. **Greeting** - Personalized introduction
3. **Details Box** - Email, Staff ID, Role
4. **CTA Button** - Large "Complete Registration" button
5. **Expiry Notice** - Countdown warning with date/time
6. **Instructions** - What happens next
7. **Backup Link** - Copy-paste URL option
8. **Footer** - Branding and disclaimer

## Status Management

### Invitation Statuses

1. **Pending**
   - Initial state after creation
   - Awaiting user action
   - Can be cancelled or resent
   - Color: Yellow

2. **Accepted**
   - User completed registration
   - Account created successfully
   - Cannot be modified
   - Color: Green

3. **Expired**
   - Past expiration date
   - Auto-updated by system
   - Cannot be used
   - Color: Gray

4. **Cancelled**
   - Manually cancelled by admin
   - No longer valid
   - Cannot be reactivated
   - Color: Red

### Status Transitions

```
pending → accepted (user completes registration)
pending → expired (time limit reached)
pending → cancelled (admin cancels)
accepted → (no further transitions)
expired → (no further transitions)
cancelled → (no further transitions)
```

## Database Constraints

### Unique Constraints

1. **Email + Status** - One pending invitation per email
2. **Staff ID** - Globally unique across all invitations
3. **Token** - Unique invitation tokens

### Foreign Keys

- `invited_by` references `staff(id)` with CASCADE

### Check Constraints

- `status` must be in: pending, accepted, expired, cancelled
- `role` validated in creation function

## Navigation Integration

### Admin Menu Item

Location: Top Navigation → More Dropdown → "Invite User"

**Visibility:**
- Admin role: Yes
- Deputy Manager role: Yes
- Program Officer: No
- User: No

**Icon:** UserCircle (person with circle)

## Error Handling

### Common Errors

1. **Duplicate Email**
   - Message: "A user with this email already exists"
   - Action: Use different email

2. **Duplicate Staff ID**
   - Message: "This Staff ID is already taken"
   - Action: Generate new ID

3. **Pending Invitation Exists**
   - Message: "An active invitation for this email already exists"
   - Action: Cancel old invitation or wait for expiry

4. **Invalid Token**
   - Message: "Invalid or expired invitation"
   - Action: Contact administrator

5. **Weak Password**
   - Message: "Password must be at least 8 characters long"
   - Action: Create stronger password

6. **Password Mismatch**
   - Message: "Passwords do not match"
   - Action: Re-enter matching passwords

## Testing Checklist

### Admin Testing

- [ ] Create invitation with all fields
- [ ] Generate random Staff ID
- [ ] Send invitation
- [ ] Verify invitation appears in list
- [ ] Copy invitation link
- [ ] Resend invitation
- [ ] Cancel invitation
- [ ] Try duplicate email (should fail)
- [ ] Try duplicate Staff ID (should fail)

### User Testing

- [ ] Open invitation link
- [ ] Verify details displayed
- [ ] Complete registration form
- [ ] Test password strength indicator
- [ ] Try weak password (should show warning)
- [ ] Try mismatched passwords (should error)
- [ ] Submit with all valid data
- [ ] Verify redirect to login
- [ ] Login with new credentials
- [ ] Verify role permissions work

### Security Testing

- [ ] Try using expired token
- [ ] Try using accepted token again
- [ ] Try using cancelled token
- [ ] Try accessing invite page without token
- [ ] Try creating invite as regular user
- [ ] Verify RLS policies

## Production Deployment

### Email Service Setup

1. **Choose Provider**
   - SendGrid (recommended)
   - AWS SES
   - Mailgun
   - Postmark

2. **Get API Credentials**
   - API key or access credentials
   - Sender email verification
   - Domain authentication (SPF/DKIM)

3. **Update Edge Function**
   ```typescript
   // Replace console.log with actual email sending
   const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${SENDGRID_API_KEY}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       personalizations: [{ to: [{ email }] }],
       from: { email: 'noreply@excelhub.com' },
       subject: 'Welcome to ExcelHub',
       content: [{ type: 'text/html', value: emailBody }]
     })
   });
   ```

4. **Configure Environment**
   - Add SENDGRID_API_KEY to Supabase secrets
   - Update FROM email address
   - Test email delivery

### Email Configuration Best Practices

1. **Sender Authentication**
   - Verify sender domain
   - Set up SPF records
   - Configure DKIM signing
   - Enable DMARC policy

2. **Template Optimization**
   - Test across email clients
   - Ensure mobile responsiveness
   - Check spam score
   - Include plain text version

3. **Deliverability**
   - Use reputable email service
   - Monitor bounce rates
   - Handle unsubscribes
   - Track open/click rates

## Monitoring & Analytics

### Metrics to Track

1. **Invitation Metrics**
   - Total invitations sent
   - Acceptance rate
   - Average time to acceptance
   - Expiration rate
   - Cancellation rate

2. **Email Metrics**
   - Delivery rate
   - Open rate
   - Click-through rate
   - Bounce rate

3. **User Metrics**
   - Registration completion rate
   - First login success rate
   - Role distribution

### Database Queries

```sql
-- Acceptance rate
SELECT
  COUNT(*) FILTER (WHERE status = 'accepted') * 100.0 / COUNT(*) as acceptance_rate
FROM user_invitations;

-- Average time to acceptance
SELECT
  AVG(accepted_at - created_at) as avg_acceptance_time
FROM user_invitations
WHERE status = 'accepted';

-- Pending invitations expiring soon
SELECT *
FROM user_invitations
WHERE status = 'pending'
  AND expires_at < NOW() + interval '24 hours';
```

## Troubleshooting

### Issue: Invitation email not received

**Possible causes:**
1. Email in spam folder
2. Email service not configured
3. Invalid email address
4. Email provider blocking

**Solutions:**
- Check spam/junk folder
- Verify email service setup
- Use "Copy Link" feature as backup
- Check email provider logs

### Issue: Token invalid or expired

**Possible causes:**
1. Invitation expired (>7 days)
2. Invitation already accepted
3. Invitation cancelled
4. Incorrect token in URL

**Solutions:**
- Request new invitation
- Check URL for typos
- Verify invitation status
- Contact administrator

### Issue: Cannot create invitation

**Possible causes:**
1. Insufficient permissions
2. Duplicate email/Staff ID
3. Invalid role selection
4. Database error

**Solutions:**
- Verify admin/deputy manager role
- Check for existing users
- Use different Staff ID
- Check error message details

## Future Enhancements

### Potential Features

1. **Bulk Invitations**
   - CSV upload for multiple invites
   - Template system
   - Batch processing

2. **Custom Expiration**
   - Admin-configurable expiry time
   - Urgent vs standard invites
   - Auto-reminder before expiry

3. **Invitation Templates**
   - Custom email templates
   - Department-specific messages
   - Multi-language support

4. **Analytics Dashboard**
   - Visual metrics
   - Trend analysis
   - Export reports

5. **Webhook Integration**
   - Notify on acceptance
   - Slack/Teams integration
   - Custom automation

## API Reference

### Create Invitation

```typescript
const { data, error } = await supabase.rpc('create_user_invitation', {
  p_email: 'user@example.com',
  p_staff_id: 'STAFF12345',
  p_role: 'user',
  p_department: 'Excel Beyond',
  p_invited_by: 'staff-uuid'
});
```

### Get Invitation

```typescript
const { data, error } = await supabase.rpc('get_invitation_by_token', {
  p_token: 'invitation-token'
});
```

### Accept Invitation

```typescript
const { data, error } = await supabase.rpc('accept_invitation', {
  p_token: 'invitation-token',
  p_password: 'SecurePassword123',
  p_first_name: 'John',
  p_middle_name: 'M',
  p_last_name: 'Doe'
});
```

### Cancel Invitation

```typescript
const { data, error } = await supabase.rpc('cancel_invitation', {
  p_invitation_id: 'invitation-uuid'
});
```

## Support

For issues or questions about the invitation system:
1. Check this documentation
2. Review error messages
3. Check database logs
4. Contact system administrator

---

**Last Updated:** 2025-12-11
**Version:** 1.0.0
**System:** ExcelHub Family Legacy
