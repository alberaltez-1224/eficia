'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient, clearStaleAuthTokens } from '@/lib/supabase/client';

const AuthContext = createContext<any>({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// ---------------------------------------------------------------------------
// Module-level singleton — the subscription is created ONCE per browser session
// regardless of how many times AuthProvider mounts/unmounts (React Strict Mode,
// HMR, etc.).  This prevents two competing onAuthStateChange listeners from
// fighting over the same IndexedDB/localStorage lock and throwing:
//   "AbortError: Lock broken by another request with the 'steal' option."
// ---------------------------------------------------------------------------
let _initialized = false;
let _session: any = null;
let _user: any = null;
let _listeners: Set<() => void> = new Set();

function notifyListeners() {
  _listeners.forEach((fn) => fn());
}

function initAuthSingleton() {
  if (_initialized) return;
  _initialized = true;

  const supabase = createClient();

  // Seed initial state from local storage — zero network calls
  supabase.auth.getSession().then(({ data: { session } }) => {
    _session = session;
    _user = session?.user ?? null;
    notifyListeners();
  }).catch(() => {
    notifyListeners();
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED' && !session) {
      clearStaleAuthTokens();
      _session = null;
      _user = null;
      notifyListeners();
      return;
    }

    if (event === 'SIGNED_OUT') {
      _session = null;
      _user = null;
      notifyListeners();
      return;
    }

    _session = session;
    _user = session?.user ?? null;
    notifyListeners();
  });
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(_user);
  const [session, setSession] = useState<any>(_session);
  const [loading, setLoading] = useState(!_initialized);

  useEffect(() => {
    // Ensure the singleton is running
    initAuthSingleton();

    // Sync component state with the singleton
    const sync = () => {
      setSession(_session);
      setUser(_user);
      setLoading(false);
    };

    // If already initialized, sync immediately
    if (_initialized && _session !== undefined) {
      sync();
    }

    _listeners.add(sync);
    return () => {
      _listeners.delete(sync);
    };
  }, []);

  const supabase = createClient();

  // Email/Password Sign Up
  const signUp = async (email: string, password: string, metadata: any = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata?.fullName || '',
          avatar_url: metadata?.avatarUrl || '',
          role: metadata?.role || 'cliente',
        },
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`
      }
    });
    if (error) throw error;
    if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
      throw new Error('Email already registered');
    }
    return data;
  };

  // Email/Password Sign In
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  // Sign Out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Get Current User
  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  };

  // Check if Email is Verified
  const isEmailVerified = () => {
    return user?.email_confirmed_at !== null;
  };

  // Get User Profile from Database
  const getUserProfile = async () => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return data;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    isEmailVerified,
    getUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
