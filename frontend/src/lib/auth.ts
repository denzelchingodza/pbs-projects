/**
 * Stores/reads the admin JWT in localStorage. This is a dev/small-business
 * appropriate setup (matches Stage 2 of the backend build log); an
 * httpOnly cookie set by the backend would be a step up in security if
 * this ever needs to resist XSS on a larger deployment, but for a single
 * admin logging in from a known device, localStorage plus a short token
 * expiry (see backend `access_token_expire_minutes`) is a reasonable
 * tradeoff for how simple it keeps the frontend code.
 */
const TOKEN_KEY = "pbs_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}
