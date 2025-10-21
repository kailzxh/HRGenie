// contexts/AuthContext.tsx - EXACT FIX
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  role?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  const mounted = useRef(true);

  // Fetch profile function
  const fetchProfile = async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Profile fetch error:', error.message);
        return;
      }

      if (mounted.current) {
        setProfile(data ?? null);
      }
    } catch (err) {
      console.error('Unexpected profile fetch error:', err);
    }
  };

  // Create profile if it doesn't exist
  const createProfileIfNotExists = async (user: User, fullName?: string): Promise<void> => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email!,
            full_name: fullName || user.user_metadata?.full_name || user.user_metadata?.name || '',
            role: 'candidate'
          });

        if (error && error.code !== '23505') {
          console.error('Profile creation error:', error);
        }
      }
    } catch (err) {
      console.error('Error creating profile:', err);
    }
  };

  // Function to mark auth as initialized - FIXED: Make sure it updates state
  const markInitialized = React.useCallback(() => {
    if (mounted.current && !initialized) {
      console.log('✅ Marking auth as initialized');
      setInitialized(true);
      setLoading(false);
    }
  }, [initialized]);

  useEffect(() => {
    console.log('🚀 AuthProvider mounted');
    mounted.current = true;

    let authSubscription: any;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Starting auth initialization...');
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('📦 Initial session:', session ? 'found' : 'not found');

        if (error) {
          console.error('Session error:', error);
          markInitialized();
          return;
        }

        if (!mounted.current) return;

        // Set user immediately
        setUser(session?.user ?? null);
        
        // Fetch profile if user exists (but don't wait for it to mark as initialized)
        if (session?.user) {
          createProfileIfNotExists(session.user).then(() => {
            fetchProfile(session.user.id);
          });
        }

        // Mark as initialized regardless of profile fetch result
        markInitialized();

      } catch (err) {
        console.error('Auth initialization error:', err);
        markInitialized();
      }
    };

    // Start initialization
    initializeAuth();

    // Set up auth state listener - FIXED: Ensure markInitialized is called
    console.log('🔧 Setting up auth state listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔄 Auth state change:', event);
        
        if (!mounted.current) return;

        try {
          switch (event) {
            case 'SIGNED_IN':
              console.log('👤 SIGNED_IN event - setting user and marking initialized');
              setUser(session?.user ?? null);
              // Don't wait for profile operations - mark as initialized immediately
              markInitialized();
              // Then do profile operations in background
              if (session?.user) {
                createProfileIfNotExists(session.user).then(() => {
                  fetchProfile(session.user.id);
                });
              }
              break;
              
            case 'SIGNED_OUT':
              console.log('🚪 SIGNED_OUT event - clearing user and marking initialized');
              setUser(null);
              setProfile(null);
              markInitialized();
              break;
              
            case 'TOKEN_REFRESHED':
              setUser(session?.user ?? null);
              break;

            case 'USER_UPDATED':
              setUser(session?.user ?? null);
              break;

            case 'INITIAL_SESSION':
              console.log('🔄 INITIAL_SESSION event - marking initialized');
              markInitialized();
              break;

            default:
              console.log('Unhandled auth event:', event);
              // For any unhandled event, still mark as initialized
              markInitialized();
              break;
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          // Even on error, mark as initialized
          markInitialized();
        }
      }
    );

    authSubscription = subscription;

    // Fallback: force initialization after 3 seconds no matter what
    const forceInitializeTimer = setTimeout(() => {
      if (mounted.current && !initialized) {
        console.warn('⏰ Force initializing auth due to timeout');
        markInitialized();
      }
    }, 3000);

    return () => {
      console.log('🧹 AuthProvider unmounting');
      mounted.current = false;
      clearTimeout(forceInitializeTimer);
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [markInitialized, initialized]); // Add dependencies

// contexts/AuthContext.tsx - Update the signUp function
const signUp = async (email: string, password: string, fullName: string) => {
  try {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'candidate'
        },
        // Add this to skip email confirmation
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    
    if (error) return { error };

    if (data.user) {
      await createProfileIfNotExists(data.user, fullName);
      await fetchProfile(data.user.id);
    }

    return { error: null };
  } catch (err) {
    console.error('SignUp error:', err);
    return { error: err };
  } finally {
    setLoading(false);
  }
};

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err) {
      console.error('SignIn error:', err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { 
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      return { error };
    } catch (err) {
      console.error('OAuth SignIn error:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (err) {
      console.error('SignOut error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ error: any }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ error: any }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const value: AuthContextType = {
    user, 
    profile, 
    loading, 
    initialized,
    signUp, 
    signIn, 
    signInWithProvider, 
    signOut, 
    resetPassword,
    updatePassword,
    refreshProfile 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};