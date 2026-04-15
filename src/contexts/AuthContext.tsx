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
// _initPromise prevents the race condition where getSession() fires twice
// before _sub is set (React Strict Mode double-mount).
// ---------------------------------------------------------------------------
let _sub: { unsubscribe: () => void } | null = null;
let _initPromise: Promise<void> | null = null;
let _session: any = null;
let _user: any = null;
let _ready = false;
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((fn) => fn());
}

function ensureSubscription(): Promise<void> {
  // Return existing promise if already initializing or initialized
  if (_initPromise) return _initPromise;

  _initPromise = new Promise<void>((resolve) => {
    const supabase = createClient();

    // getSession() reads from local storage — minimal network calls
    // Only hits network if token needs refresh
    supabase.auth.getSession().then(({ data: { session } }) => {
      _session = session ?? null;
      _user = session?.user ?? null;
      _ready = true;
      notify();
      resolve();
    }).catch(() => {
      _session = null;
      _user = null;
      _ready = true;
      notify();
      resolve();
    });

    // Guard: only create subscription once
    if (_sub) return;

    // onAuthStateChange fires for SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
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
  });

  return _initPromise;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(() => _user);
  const [session, setSession] = useState<any>(() => _session);
  const [loading, setLoading] = useState(() => !_ready);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const sync = () => {
      if (!mountedRef.current) return;
      setSession(_session);
      setUser(_user);
      setLoading(false);
    };

    // If already ready, sync immediately without waiting
    if (_ready) {
      sync();
    }

    _listeners.add(sync);

    // ensureSubscription returns a promise — safe to call multiple times
    ensureSubscription().then(() => {
      if (mountedRef.current) sync();
    });

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
    // Reset init promise so next login starts fresh
    _initPromise = null;
    _sub = null;
    notify();
    clearStaleAuthTokens();
    try {
      const supabaseClient = createClient();
      await supabaseClient.auth.signOut();
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
