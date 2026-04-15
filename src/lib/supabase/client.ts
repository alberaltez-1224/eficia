import { createBrowserClient } from '@supabase/ssr';

const PFX = 'sb_';

const canUseCookies = (() => {
  let cache: boolean | null = null;
  return () => {
    if (typeof document === 'undefined') return false;
    if (cache !== null) return cache;
    const k = '__sb_test__';
    document.cookie = `${k}=1; Path=/; SameSite=None; Secure; Partitioned`;
    cache = document.cookie.includes(k);
    document.cookie = `${k}=; Path=/; Max-Age=0; SameSite=None; Secure`;
    return cache;
  };
})();

const fromCookies = () =>
  typeof document === 'undefined' ? [] :
  document.cookie.split(';').filter(Boolean).map((c) => {
    const [name, ...rest] = c.trim().split('=');
    return { name: name.trim(), value: decodeURIComponent(rest.join('=')) };
  }).filter((c) => c.name);

const fromStorage = () => {
  try {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith(PFX))
      .map((k) => ({ name: k.slice(PFX.length), value: localStorage.getItem(k) || '' }));
  } catch { return []; }
};

const setCookie = (name: string, value: string, options?: any) => {
  let s = `${name}=${encodeURIComponent(value)}; Path=${options?.path || '/'}; SameSite=None; Secure; Partitioned`;
  if (options?.maxAge) s += `; Max-Age=${options.maxAge}`;
  if (options?.domain) s += `; Domain=${options.domain}`;
  if (options?.expires) s += `; Expires=${new Date(options.expires).toUTCString()}`;
  document.cookie = s;
};

export function clearStaleAuthTokens() {
  if (typeof document !== 'undefined') {
    document.cookie.split(';').forEach((c) => {
      const name = c.trim().split('=')[0];
      if (name.includes('auth-token') || name.startsWith('sb-')) {
        document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=None; Secure`;
      }
    });
  }
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PFX) || k.startsWith('sb-'))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
  if (typeof window !== 'undefined') {
    (window as any).__supabase_client__ = undefined;
  }
}

// Wraps the global fetch to silently swallow network errors during Supabase
// token refresh so they never surface as unhandled console errors.
function makeSafeFetch() {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      return await fetch(input, init);
    } catch (err: any) {
      // Return a synthetic 503 response so Supabase handles it gracefully
      // instead of throwing an unhandled "Failed to fetch" error.
      return new Response(JSON.stringify({ error: 'network_error', message: err?.message ?? 'Failed to fetch' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}

export function createClient() {
  if (typeof window !== 'undefined' && (window as any).__supabase_client__) {
    return (window as any).__supabase_client__;
  }
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: false,
        detectSessionInUrl: true,
      },
      global: {
        fetch: makeSafeFetch(),
      },
      cookies: {
        getAll: () => canUseCookies() ? fromCookies() : fromStorage(),
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return;
          if (canUseCookies()) {
            cookiesToSet.forEach(({ name, value, options }) =>
              value ? setCookie(name, value, options)
                    : (document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=None; Secure`)
            );
          } else {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                value ? localStorage.setItem(`${PFX}${name}`, value)
                      : localStorage.removeItem(`${PFX}${name}`);
              } catch {}
              if (value) setCookie(name, value, options);
            });
          }
        },
      },
    }
  );
  if (typeof window !== 'undefined') {
    (window as any).__supabase_client__ = client;
  }
  return client;
}
