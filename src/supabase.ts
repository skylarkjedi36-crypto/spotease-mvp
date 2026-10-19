import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const clientCache = globalThis as typeof globalThis & {
  __spotEaseSupabaseClients?: Record<string, SupabaseClient>;
};

const storageKey = `spotease-${projectId}-auth-token`;

// Preserve an existing login once, without re-importing it after a logout.
function migrateSession() {
  if (typeof window === 'undefined') return;
  try {
    const migrationKey = `${storageKey}-migrated`;
    if (window.localStorage.getItem(migrationKey)) return;
    if (!window.localStorage.getItem(storageKey)) {
      const previousSession = window.localStorage.getItem(`sb-${projectId}-auth-token`);
      if (previousSession) window.localStorage.setItem(storageKey, previousSession);
    }
    window.localStorage.setItem(migrationKey, 'true');
  } catch {
    // Supabase handles unavailable browser storage with its in-memory fallback.
  }
}

// Cache by our app-specific auth key, separate from other preview integrations.
const clients = clientCache.__spotEaseSupabaseClients ??= {};
if (!clients[storageKey]) migrateSession();
export const supabase = clients[storageKey] ??= createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  { auth: { storageKey, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
);
