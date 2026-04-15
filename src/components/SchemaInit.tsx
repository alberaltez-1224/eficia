'use client';

import { useEffect, useRef } from 'react';

/**
 * SchemaInit — runs once on app startup to push the Eficia schema
 * to the connected Supabase project. Safe to run multiple times (idempotent).
 * Only fires when SUPABASE_DB_URL is configured.
 */
export default function SchemaInit() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun?.current) return;
    hasRun.current = true;

    const STORAGE_KEY = 'eficia_schema_pushed';
    const alreadyPushed = sessionStorage.getItem(STORAGE_KEY);
    if (alreadyPushed === 'true') return;

    fetch('/api/init-schema', { method: 'POST' })?.then((res) => res?.json())?.then((data) => {
        if (data?.success) {
          sessionStorage.setItem(STORAGE_KEY, 'true');
          console.info('[Eficia] Schema applied successfully:', data?.tables);
        } else if (data?.error?.includes('not configured') || data?.error?.includes('SUPABASE_DB_URL')) {
          // DB URL not set — expected in dev without the env var
          console.info('[Eficia] Schema init skipped: SUPABASE_DB_URL not configured.');
        } else {
          console.warn('[Eficia] Schema init warning:', data?.error);
        }
      })?.catch(() => {
        // Non-blocking — app works fine even if schema init fails
      });
  }, []);

  return null;
}
