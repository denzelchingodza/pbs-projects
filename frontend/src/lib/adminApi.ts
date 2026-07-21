/**
 * Everything the admin panel calls, kept separate from lib/api.ts because
 * every request here needs an `Authorization: Bearer <token>` header and
 * runs from the browser (Client Components), unlike the public site's
 * server-side fetches in lib/api.ts.
 */
import { clearToken, getToken, setToken } from "./auth";
import type { AdminQuote, AdminUser, Project, QuoteStatus, Testimonial } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Attaches the stored token to every request, and if the backend ever comes
 * back with 401 (missing/expired/invalid token), clears it and bounces to
 * the login page, no page on /admin/* can be left showing stale data behind
 * an expired session.
 */
async function authedFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new Error("Your session expired. Please log in again.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || `Request failed (${res.status}).`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || "Incorrect email or password.");
  }

  const data = await res.json();
  setToken(data.access_token);
}

export function logout(): void {
  clearToken();
}

export async function getCurrentAdmin(): Promise<AdminUser> {
  return authedFetch("/auth/me");
}

export async function getAdminQuotes(): Promise<AdminQuote[]> {
  return authedFetch("/admin/quotes");
}

export async function updateQuoteStatus(
  id: number,
  payload: { status?: QuoteStatus; admin_notes?: string }
): Promise<AdminQuote> {
  return authedFetch(`/admin/quotes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getAdminGallery(): Promise<Project[]> {
  // Reuses the public gallery read, admin login isn't required to view what's
  // already public, only to add/remove/edit projects, which is enforced below.
  const res = await fetch(`${API_URL}/gallery/`);
  if (!res.ok) throw new Error("Could not load gallery projects.");
  return res.json();
}

/** Starts a brand new project with its first photo or video. */
export async function createProject(formData: FormData): Promise<Project> {
  // No Content-Type header here on purpose, the browser sets the correct
  // multipart boundary itself when the body is a FormData object.
  return authedFetch("/admin/gallery", { method: "POST", body: formData });
}

/** Adds another photo or video to a project that already exists. */
export async function addProjectMedia(projectId: number, file: File): Promise<Project> {
  const formData = new FormData();
  formData.append("file", file);
  return authedFetch(`/admin/gallery/${projectId}/media`, { method: "POST", body: formData });
}

export async function updateProject(
  projectId: number,
  payload: { title?: string; category?: string; is_featured?: boolean }
): Promise<Project> {
  return authedFetch(`/admin/gallery/${projectId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** Removes one photo/video from a project. If it was the only one, the
 * project itself disappears too (the backend handles that). */
export async function deleteProjectMedia(projectId: number, mediaId: number): Promise<void> {
  await authedFetch(`/admin/gallery/${projectId}/media/${mediaId}`, { method: "DELETE" });
}

/** Removes a whole project and every photo/video that belongs to it. */
export async function deleteProject(projectId: number): Promise<void> {
  await authedFetch(`/admin/gallery/${projectId}`, { method: "DELETE" });
}

// ---------- Testimonial moderation ----------

export async function getAdminTestimonials(): Promise<Testimonial[]> {
  return authedFetch("/admin/testimonials");
}

export async function approveTestimonial(id: number): Promise<Testimonial> {
  return authedFetch(`/admin/testimonials/${id}`, { method: "PATCH" });
}

export async function deleteTestimonial(id: number): Promise<void> {
  await authedFetch(`/admin/testimonials/${id}`, { method: "DELETE" });
}
