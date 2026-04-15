'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { createClient, clearStaleAuthTokens } from '@/lib/supabase/client';

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  isEmailVerified: () => boolean;
  getUserProfile: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// ---------------------------------------------------------------------------
// Module-level singleton — ONE subscription for the entire browser session.
// Prevents duplicate listeners from React Strict Mode double-mount / HMR.
// ---------------------------------------------------------------------------
let _sub: { unsubscribe: () => void } | null = null;
let _session: any = null;
let _user: any = null;
let _ready = false;
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((fn) => fn());
}

function ensureSubscription() {
  if (_sub) return; // already subscribed

  const supabase = createClient();

  // getSession() reads from local storage — ZERO network calls
  supabase.auth.getSession().then(({ data: { session } }) => {
    _session = session ?? null;
    _user = session?.user ?? null;
    _ready = true;
    notify();
  }).catch(() => {
    _session = null;
    _user = null;
    _ready = true;
    notify();
  });

  // onAuthStateChange fires for SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
  // It does NOT make extra API calls on its own — it reacts to Supabase SDK events.
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
      if (event === 'TOKEN_REFRESHED' && !session) {
        clearStaleAuthTokens();
      }
      _session = null;
      _user = null;
      _ready = true;
      notify();
      return;
    }

    _session = session ?? null;
    _user = session?.user ?? null;
    _ready = true;
    notify();
  });

  _sub = subscription;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(() => _user);
  const [session, setSession] = useState<any>(() => _session);
  const [loading, setLoading] = useState(() => !_ready);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    ensureSubscription();

    const sync = () => {
      if (!mountedRef.current) return;
      setSession(_session);
      setUser(_user);
      setLoading(false);
    };

    // If already ready, sync immediately
    if (_ready) {
      sync();
    }

    _listeners.add(sync);

    return () => {
      mountedRef.current = false;
      _listeners.delete(sync);
    };
  }, []);

  const supabase = createClient();

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
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    });
    if (error) throw error;
    if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
      throw new Error('Email already registered');
    }
    return data;
  };

  // Single call to signInWithPassword — no extra getUser() calls
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  // Clear local state first, then call signOut — prevents UI flicker waiting for API
  const signOut = async () => {
    _session = null;
    _user = null;
    _ready = true;
    notify();
    clearStaleAuthTokens();
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore errors — local state is already cleared
    }
  };

  const isEmailVerified = () => {
    return user?.email_confirmed_at != null;
  };

  // Reads from DB — only called explicitly, never in useEffect
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

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isEmailVerified,
    getUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
