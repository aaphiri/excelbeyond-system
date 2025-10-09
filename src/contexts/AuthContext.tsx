import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { verifyStaffSession, staffLogout } from '../lib/staffAuth';

interface AuthUser {
  id: string;
  auth_id: string;
  email: string;
  name: string;
  photo_url?: string;
  role: 'admin' | 'deputy_manager' | 'program_officer' | 'user';
  is_active: boolean;
  onboarding_completed: boolean;
  last_login: string;
  created_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const verifyStaffSessionWrapper = async (sessionToken: string, cachedUser: AuthUser) => {
    try {
      const userData = await verifyStaffSession(sessionToken);

      if (userData) {
        setUser(userData as AuthUser);
      } else {
        localStorage.removeItem('staff_session_token');
        localStorage.removeItem('staff_user');
        setUser(null);
      }
    } catch (error) {
      console.error('Session verification error:', error);
      localStorage.removeItem('staff_session_token');
      localStorage.removeItem('staff_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const staffSessionToken = localStorage.getItem('staff_session_token');
    const staffUser = localStorage.getItem('staff_user');

    if (staffSessionToken && staffUser) {
      verifyStaffSessionWrapper(staffSessionToken, JSON.parse(staffUser));
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          loadUserProfile(session.user);
        } else {
          setLoading(false);
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    }

    const staffLoginHandler = (event: any) => {
      const staffUserData = event.detail;
      setUser(staffUserData);
      setLoading(false);
    };

    window.addEventListener('staff-login', staffLoginHandler);
    return () => window.removeEventListener('staff-login', staffLoginHandler);
  }, []);

  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from('auth_users')
        .select('*')
        .eq('auth_id', authUser.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user:', fetchError);
        throw fetchError;
      }

      if (!existingUser) {
        const newUser = {
          auth_id: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
          photo_url: authUser.user_metadata?.avatar_url || null,
          role: 'user' as const,
          is_active: true,
          last_login: new Date().toISOString(),
        };

        const { data: createdUser, error: createError } = await supabase
          .from('auth_users')
          .insert([newUser])
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          throw createError;
        }

        setUser(createdUser);
      } else {
        const { error: updateError } = await supabase
          .from('auth_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', existingUser.id);

        if (updateError) {
          console.error('Error updating last login:', updateError);
        }

        setUser(existingUser);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      await supabase.auth.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const staffSessionToken = localStorage.getItem('staff_session_token');

      if (staffSessionToken) {
        await staffLogout(staffSessionToken);
        localStorage.removeItem('staff_session_token');
        localStorage.removeItem('staff_user');
      } else {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }

      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<AuthUser>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('auth_users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, ...updates });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
