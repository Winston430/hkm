const STORAGE_KEY = "auth_session_expires_at";
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export function startSession() {
  localStorage.setItem(STORAGE_KEY, String(Date.now() + SESSION_DURATION_MS));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

/** Returns the stored expiry timestamp, or null if none is set. */
export function getSessionExpiry(): number | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/**
 * Ensures an expiry is set, without resetting one that already exists.
 * Used for sessions that were signed in before this feature existed (or
 * restored by Firebase's own persistence) so they get one 24h grace
 * window instead of being logged out immediately on first load.
 */
export function ensureSessionExpiry(): number {
  const existing = getSessionExpiry();
  if (existing !== null) return existing;
  const expiry = Date.now() + SESSION_DURATION_MS;
  localStorage.setItem(STORAGE_KEY, String(expiry));
  return expiry;
}
