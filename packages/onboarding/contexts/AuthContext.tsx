'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/lib/supabase/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Profile fetch error (safe):', error.message);
        if (mounted.current) setProfile(null);
        return;
      }

      if (mounted.current) setProfile(data ?? null);
    } catch (err) {
      console.error('Unexpected profile fetch error:', err);
      if (mounted.current) setProfile(null);
    }
  };

  useEffect(() => {
    mounted.current = true;

    const initAuth = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted.current) return;

        setUser(session?.user ?? null);
        if (session?.user) await fetchProfile(session.user.id);
      } catch (err) {
        console.error('Error initializing auth:', err);
        if (mounted.current) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted.current) setLoading(false);
      }
    };

    initAuth();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!mounted.current) return;

      setUser(session?.user ?? null);
      if (session?.user) await fetchProfile(session.user.id);
      else setProfile(null);
    });

    // Refresh session on tab focus
    const handleFocus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted.current) return;

        setUser(session?.user ?? null);
        if (session?.user) await fetchProfile(session.user.id);
      } catch (err) {
        console.error('Error refreshing session on focus:', err);
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error };

      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({ id: data.user.id, email: data.user.email!, full_name: fullName });

          if (profileError) return { error: profileError };
        } catch (err) {
          console.warn('Profile table may not exist:', err);
        }
      }

      return { error: null };
    } catch (err) {
      console.error('SignUp error:', err);
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err) {
      console.error('SignIn error:', err);
      return { error: err };
    }
  };

  const signInWithProvider = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      return { error };
    } catch (err) {
      console.error('OAuth SignIn error:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('SignOut error:', err);
    } finally {
      if (mounted.current) {
        setUser(null);
        setProfile(null);
      }
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signInWithProvider, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
