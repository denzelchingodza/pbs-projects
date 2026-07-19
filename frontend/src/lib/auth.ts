/** Stores/reads the admin JWT (e.g. in an httpOnly cookie set by the backend, or localStorage for dev). */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pbs_admin_token");
}
