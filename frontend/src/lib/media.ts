/**
 * Mirrors the backend's real limits (backend/app/services/image_service.py)
 * so the admin gets an immediate, specific error in the browser instead of
 * picking a file, waiting for the upload, and only then finding out it was
 * rejected. The backend re-checks all of this independently either way,
 * this is purely a faster/friendlier first check.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
// Uploaded photos and videos are served by the backend itself (FastAPI's
// static file mount), not by Next.js, so a path like "/static/uploads/x.jpg"
// coming back from the API is only ever correct relative to the backend's
// own address, never the frontend's. Rendering it as-is works by accident
// in a deployment where both happen to share one domain, and breaks
// everywhere else (including plain local development, frontend on :3000,
// backend on :8000), the photo silently fails to load. Strip the trailing
// "/api" off the API base to get the backend's origin, then always resolve
// media paths against that instead of leaving them relative to whatever
// page the browser happens to be on.
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

/**
 * Turns a photo or video URL from the backend into one that will actually
 * load in the browser, regardless of what page it's rendered on.
 */
export function mediaUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path; // already a full URL (e.g. future cloud storage)
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}
export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
export const VIDEO_ACCEPT = ".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp"];
const VIDEO_EXTS = [".mp4", ".mov", ".webm"];

function extOf(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i === -1 ? "" : filename.slice(i).toLowerCase();
}

/**
 * Returns an error message string if the file should be rejected, or null
 * if it's good to upload.
 */
export function validateMediaFile(file: File): string | null {
  const ext = extOf(file.name);

  if (IMAGE_EXTS.includes(ext)) {
    if (file.size > MAX_IMAGE_BYTES) {
      return `That photo is ${Math.round(file.size / 1024 / 1024)}MB. Photos are capped at ${MAX_IMAGE_BYTES / 1024 / 1024}MB.`;
    }
    return null;
  }

  if (VIDEO_EXTS.includes(ext)) {
    if (file.size > MAX_VIDEO_BYTES) {
      return `That video is ${Math.round(file.size / 1024 / 1024)}MB. Videos are capped at ${MAX_VIDEO_BYTES / 1024 / 1024}MB, try trimming the clip or lowering its export resolution.`;
    }
    return null;
  }

  return `"${ext || "that file type"}" isn't supported. Photos: JPG, PNG, WEBP. Videos: MP4, MOV, WEBM.`;
}
