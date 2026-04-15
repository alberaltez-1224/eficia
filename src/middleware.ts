import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function getProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return url.match(/https:\/\/([^.]+)\./)?.[1] ?? '';
}

function injectTokenFromHeader(request: NextRequest): void {
  const token = request.headers.get('x-sb-token');
  if (!token) return;
  const hasCookie = request.cookies.getAll().some((c) => c.name.includes('auth-token'));
  if (hasCookie) return;
  request.cookies.set(`sb-${getProjectRef()}-auth-token`, token);
}

// Only run auth checks on routes that actually need protection
const PROTECTED_PATHS = [
  '/admin-panel',
  '/client-dashboard',
  '/provider-panel',
  '/savings-calculator',
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname.startsWith(p));
}

// Simple in-memory cache: token -> { valid: boolean, expiresAt: number }
const authCache = new Map<string, { valid: boolean; expiresAt: number }>();
const CACHE_TTL_MS = 30_000; // 30 seconds

function getCacheKey(request: NextRequest): string | null {
  const allCookies = request.cookies.getAll();
  const authCookie = allCookies.find((c) => c.name.includes('auth-token'));
  return authCookie?.value?.slice(0, 40) ?? null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for public/static routes — avoids rate limit flooding
  if (!isProtectedPath(pathname)) {
    return NextResponse.next({ request });
  }

  injectTokenFromHeader(request);

  // Check cache before making a Supabase request
  const cacheKey = getCacheKey(request);
  if (cacheKey) {
    const cached = authCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      // Use cached result — no Supabase call needed
      return NextResponse.next({ request });
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Use getSession() instead of getUser() — reads from the cookie without
  // making a network request to Supabase, eliminating rate limit errors.
  const { data: { session } } = await supabase.auth.getSession();

  // Cache the result to avoid repeated calls
  if (cacheKey) {
    authCache.set(cacheKey, { valid: !!session, expiresAt: Date.now() + CACHE_TTL_MS });
    // Prevent unbounded cache growth
    if (authCache.size > 500) {
      const firstKey = authCache.keys().next().value;
      if (firstKey) authCache.delete(firstKey);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/admin-panel/:path*',
    '/client-dashboard/:path*',
    '/provider-panel/:path*',
    '/savings-calculator/:path*',
  ],
};
