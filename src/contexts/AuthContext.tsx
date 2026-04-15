'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { clearStaleAuthTokens } from '@/lib/supabase/client';

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
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// ---------------------------------------------------------------------------
// Module-level singleton state — one listener, registered once, never again.
// ---------------------------------------------------------------------------
let _initialized = false;
let _session: any = null;
let _user: any = null;
let _ready = false;
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((fn) => fn());
}

function initAuth() {
  if (_initialized) return;
  _initialized = true;

  const supabase = createClient();

  // Register ONE onAuthStateChange — this is the only source of auth truth.
  // No getSession(), no getUser(), no retries.
  supabase.auth.onAuthStateChange((_event, session) => {
    _session = session ?? null;
    _user = session?.user ?? null;
    _ready = true;
    notify();
  });

  // Attempt to get the current session; if the Supabase project is unreachable
  // (e.g. "Failed to fetch" during token refresh), clear stale tokens and mark
  // auth as ready with no session so the app doesn't hang in a loading state.
  supabase.auth.getSession().catch(() => {
    // Clear stale tokens so the broken refresh isn't retried on next load
    clearStaleAuthTokens();
    if (!_ready) {
      _session = null;
      _user = null;
      _ready = true;
      notify();
    }
  });
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(() => _user);
  const [session, setSession] = useState<any>(() => _session);
  const [loading, setLoading] = useState(() => !_ready);

  useEffect(() => {
    let mounted = true;

    const sync = () => {
      if (!mounted) return;
      setSession(_session);
      setUser(_user);
      setLoading(false);
    };

    _listeners.add(sync);

    // If already ready (e.g. navigating between pages), sync immediately
    if (_ready) sync();

    // Initialize — safe to call multiple times, only runs once
    initAuth();

    return () => {
      mounted = false;
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

  // ONE signInWithPassword call — nothing else
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    // Reset module state so next login starts fresh
    _session = null;
    _user = null;
    _ready = false;
    _initialized = false;
    notify();

    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore — local state already cleared
    }
  };

  const isEmailVerified = () => user?.email_confirmed_at != null;

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

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, isEmailVerified, getUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
