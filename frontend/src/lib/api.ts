/**
 * Thin fetch wrapper for calling the FastAPI backend from the Next.js frontend.
 *
 * NEXT_PUBLIC_API_URL always wins if it's set. Otherwise, in the browser, the
 * API host follows whatever host the page itself was loaded from, so opening
 * the site from a phone at http://192.168.x.x:3000 automatically talks to
 * http://192.168.x.x:8000/api with no config file to edit. Server side (page
 * rendering on the Mac itself) there is no browser host to read, so it falls
 * back to localhost, which is correct since the backend runs on the same
 * machine as the Next.js server.
 */
import type { SiteSettings } from "@/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? `http://${window.location.hostname}:8000/api`
    : "http://localhost:8000/api");

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

/**
 * Submits a real customer's testimonial. It comes back with status
 * "pending", it won't show on the site until the admin approves it, see
 * routers/testimonials.py.
 */
export async function submitTestimonial(payload: {
  client_name: string;
  client_role?: string;
  quote: string;
  rating: number;
}) {
  return apiPost("/testimonials/", payload);
}
