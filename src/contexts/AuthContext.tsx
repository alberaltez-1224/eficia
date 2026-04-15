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
// _subscribed flag ensures onAuthStateChange is registered exactly once.
// _ready flag ensures getSession() is called at most once.
// ---------------------------------------------------------------------------
let _subscribed = false;
let _initializing = false;
let _session: any = null;
let _user: any = null;
let _ready = false;
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((fn) => fn());
}

function initAuth() {
  // Already done or in progress — do nothing
  if (_subscribed || _initializing) return;
  _initializing = true;

  const supabase = createClient();

  // Register the auth state change listener FIRST (before getSession)
  // so we never miss an event
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      clearStaleAuthTokens();
      _session = null;
      _user = null;
      _ready = true;
      notify();
      return;
    }

    if (event === 'TOKEN_REFRESHED' && !session) {
      clearStaleAuthTokens();
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

  _subscribed = true;

  // getSession() reads from localStorage — minimal network usage.
  // Only called once on first mount.
  supabase.auth.getSession().then(({ data: { session } }) => {
    // Only update if onAuthStateChange hasn't already fired with newer data
    if (!_ready) {
      _session = session ?? null;
      _user = session?.user ?? null;
      _ready = true;
      notify();
    }
  }).catch(() => {
    if (!_ready) {
      _session = null;
      _user = null;
      _ready = true;
      notify();
    }
  });

  // Keep subscription reference for cleanup on signOut
  (initAuth as any)._sub = subscription;
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

    // If already ready (e.g. page navigation after first mount), sync immediately
    if (_ready) {
      sync();
    }

    _listeners.add(sync);

    // Initialize auth — safe to call multiple times, only runs once
    initAuth();

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

  // Clear local state first, then call signOut API
  const signOut = async () => {
    // Reset module-level state so next login starts fresh
    _session = null;
    _user = null;
    _ready = false;
    _subscribed = false;
    _initializing = false;

    // Unsubscribe existing listener
    const sub = (initAuth as any)._sub;
    if (sub) {
      try { sub.unsubscribe(); } catch { /* ignore */ }
      (initAuth as any)._sub = null;
    }

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
