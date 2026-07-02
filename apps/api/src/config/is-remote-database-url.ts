const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

/**
 * Managed Postgres providers (Render, Supabase, Railway, etc.) require SSL;
 * local/docker connections don't. Detect by host instead of hardcoding a
 * provider domain, so switching providers doesn't silently disable SSL.
 * `DATABASE_URL` and `DB_HOST` are both supported since either can carry the
 * connection's actual host (see `database.config.ts`).
 */
export function isRemoteDatabase(
  databaseUrl: string | undefined,
  dbHost: string | undefined,
): boolean {
  const hostname = databaseUrl ? parseHostname(databaseUrl) : dbHost;
  if (!hostname) return false;
  return !LOCAL_HOSTS.has(hostname);
}

function parseHostname(databaseUrl: string): string | undefined {
  try {
    return new URL(databaseUrl).hostname;
  } catch {
    return undefined;
  }
}
