/**
 * Managed Postgres providers (Render, Supabase, Railway, etc.) require SSL;
 * local/docker connections don't. Detect by host instead of hardcoding a
 * provider domain, so switching providers doesn't silently disable SSL.
 */
export function isRemoteDatabaseUrl(databaseUrl: string | undefined): boolean {
  if (!databaseUrl) return false;
  try {
    const { hostname } = new URL(databaseUrl);
    return hostname !== 'localhost' && hostname !== '127.0.0.1';
  } catch {
    return false;
  }
}
