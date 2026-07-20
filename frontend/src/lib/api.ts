/** Thin fetch wrapper for calling the FastAPI backend from the Next.js frontend. */
import type { SiteSettings } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function apiGet(path: string) {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiPost(path: string, body: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/**
 * Fallback business info used ONLY if the backend can't be reached (e.g. you're
 * previewing the frontend without the FastAPI server running). Keeps the site
 * from crashing — real data always wins when the API is up.
 */
const FALLBACK_SETTINGS: SiteSettings = {
  business_name: "PBS Projects",
  address: "09 Sherwood Rd, Waterfalls, Harare",
  phone_primary: "+263 71 212 2020",
  phone_secondary: "+263 77 743 3279",
  whatsapp_number: "+263 71 212 2020",
  email: "pbs@gmail.com",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    return await apiGet("/settings/");
  } catch {
    return FALLBACK_SETTINGS;
  }
}

// Each of these returns [] on failure instead of throwing, so one flaky
// section (e.g. testimonials) never takes down the whole home page.
export async function getProducts() {
  try {
    return await apiGet("/products/");
  } catch {
    return [];
  }
}

export async function getTestimonials() {
  try {
    return await apiGet("/testimonials/");
  } catch {
    return [];
  }
}

export async function getProjects(category?: string) {
  try {
    return await apiGet(category ? `/gallery/?category=${category}` : "/gallery/");
  } catch {
    return [];
  }
}
