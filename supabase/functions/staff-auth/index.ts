import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
}

interface LoginRequest {
  staffId: string
  password: string
  rememberMe?: boolean
}

interface RegisterRequest {
  staffId: string
  email: string
  password: string
  name: string
  role: string
  department?: string
}

interface PasswordResetRequest {
  email: string
}

interface PasswordChangeRequest {
  token: string
  newPassword: string
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    if (req.method === 'POST' && path === 'login') {
      const { staffId, password, rememberMe }: LoginRequest = await req.json()

      const MAX_ATTEMPTS = 5
      const LOCKOUT_DURATION = 15 * 60 * 1000

      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('staff_id', staffId)
        .single()

      if (staffError || !staff) {
        await supabase.from('login_attempts').insert({
          staff_id: staffId,
          attempt_type: 'failure',
          failure_reason: 'Invalid staff ID',
        })

        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!staff.is_active) {
        return new Response(
          JSON.stringify({ error: 'Account is inactive. Please contact administrator.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (staff.is_locked) {
        const lockoutTime = new Date(staff.last_failed_login).getTime()
        const now = Date.now()
        
        if (now - lockoutTime < LOCKOUT_DURATION) {
          const remainingMinutes = Math.ceil((LOCKOUT_DURATION - (now - lockoutTime)) / 60000)
          return new Response(
            JSON.stringify({ 
              error: `Account is locked due to multiple failed login attempts. Try again in ${remainingMinutes} minutes.` 
            }),
            { status: 423, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          await supabase
            .from('staff')
            .update({ is_locked: false, failed_login_attempts: 0 })
            .eq('id', staff.id)
        }
      }

      const passwordMatch = await bcrypt.compare(password, staff.password_hash)

      if (!passwordMatch) {
        const newAttempts = staff.failed_login_attempts + 1
        const shouldLock = newAttempts >= MAX_ATTEMPTS

        await supabase
          .from('staff')
          .update({
            failed_login_attempts: newAttempts,
            last_failed_login: new Date().toISOString(),
            is_locked: shouldLock,
          })
          .eq('id', staff.id)

        await supabase.from('login_attempts').insert({
          staff_id: staffId,
          attempt_type: shouldLock ? 'locked' : 'failure',
          failure_reason: 'Invalid password',
        })

        if (shouldLock) {
          return new Response(
            JSON.stringify({ 
              error: 'Account locked due to multiple failed login attempts. Try again in 15 minutes.' 
            }),
            { status: 423, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            error: `Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.` 
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      await supabase
        .from('staff')
        .update({
          failed_login_attempts: 0,
          last_login: new Date().toISOString(),
          is_locked: false,
        })
        .eq('id', staff.id)

      const sessionToken = crypto.randomUUID()
      const expiresAt = rememberMe
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 24 * 60 * 60 * 1000)

      await supabase.from('staff_sessions').insert({
        staff_id: staffId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        remember_me: rememberMe || false,
      })

      await supabase.from('login_attempts').insert({
        staff_id: staffId,
        attempt_type: 'success',
      })

      const userData = {
        id: staff.id,
        staff_id: staff.staff_id,
        email: staff.email,
        name: staff.name,
        role: staff.role,
        department: staff.department,
        onboarding_completed: staff.onboarding_completed,
        password_reset_required: staff.password_reset_required,
      }

      return new Response(
        JSON.stringify({
          user: userData,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST' && path === 'register') {
      const { staffId, email, password, name, role, department }: RegisterRequest = await req.json()

      const passwordHash = await bcrypt.hash(password)

      const { data, error } = await supabase
        .from('staff')
        .insert({
          staff_id: staffId,
          email,
          password_hash: passwordHash,
          name,
          role,
          department,
          is_active: true,
        })
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, staff: data }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST' && path === 'forgot-password') {
      const { email }: PasswordResetRequest = await req.json()

      const { data: staff } = await supabase
        .from('staff')
        .select('*')
        .eq('email', email)
        .single()

      if (!staff) {
        return new Response(
          JSON.stringify({ 
            message: 'If the email exists, a reset link will be sent.' 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const token = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

      await supabase.from('password_reset_tokens').insert({
        staff_id: staff.staff_id,
        token,
        expires_at: expiresAt.toISOString(),
      })

      return new Response(
        JSON.stringify({ 
          message: 'Password reset instructions sent to your email.',
          token: token
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST' && path === 'reset-password') {
      const { token, newPassword }: PasswordChangeRequest = await req.json()

      const { data: resetToken } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .single()

      if (!resetToken || new Date(resetToken.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired reset token' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const passwordHash = await bcrypt.hash(newPassword)

      await supabase
        .from('staff')
        .update({
          password_hash: passwordHash,
          last_password_change: new Date().toISOString(),
          password_reset_required: false,
        })
        .eq('staff_id', resetToken.staff_id)

      await supabase
        .from('password_reset_tokens')
        .update({ used: true, used_at: new Date().toISOString() })
        .eq('token', token)

      return new Response(
        JSON.stringify({ message: 'Password reset successful' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST' && path === 'verify-session') {
      const { session_token } = await req.json()

      const { data: session } = await supabase
        .from('staff_sessions')
        .select('*')
        .eq('session_token', session_token)
        .single()

      if (!session || new Date(session.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired session' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: staff } = await supabase
        .from('staff')
        .select('*')
        .eq('staff_id', session.staff_id)
        .single()

      if (!staff || !staff.is_active) {
        return new Response(
          JSON.stringify({ error: 'Account inactive' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      await supabase
        .from('staff_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_token', session_token)

      const userData = {
        id: staff.id,
        staff_id: staff.staff_id,
        email: staff.email,
        name: staff.name,
        role: staff.role,
        department: staff.department,
        onboarding_completed: staff.onboarding_completed,
      }

      return new Response(
        JSON.stringify({ user: userData }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST' && path === 'logout') {
      const { session_token } = await req.json()

      await supabase
        .from('staff_sessions')
        .delete()
        .eq('session_token', session_token)

      return new Response(
        JSON.stringify({ message: 'Logged out successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})