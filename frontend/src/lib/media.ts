/**
 * Mirrors the backend's real limits (backend/app/services/image_service.py)
 * so the admin gets an immediate, specific error in the browser instead of
 * picking a file, waiting for the upload, and only then finding out it was
 * rejected. The backend re-checks all of this independently either way,
 * this is purely a faster/friendlier first check.
 */

// Uploaded photos and videos are served by the backend itself (FastAPI's
// static file mount), not by Next.js, so a path like "/static/uploads/x.jpg"
// coming back from the API is only correct once resolved against the
// backend's own address, never left as-is against whatever page it's shown
// on. next.config.js proxies /static/* on this Next.js server through to
// the backend on this same machine, so a plain relative path always works,
// whether the HTML was generated on the server or in the browser, and
// whether it's opened on the computer itself or on a phone using the Mac's
// network address, with nothing to configure either way.
//
// This previously built an absolute http://localhost:8000/... URL instead.
// That looked right on the computer, but "localhost" means something
// different on every device, on a phone it points at the phone itself, not
// the Mac, which is exactly why photos failed to load there even after the
// API calls themselves were fixed to follow the current host.

/**
 * Turns a photo or video URL from the backend into one that will actually
 * load in the browser, regardless of what page it's rendered on or what
 * device opened it.
 */
export function mediaUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path; // already a full URL (e.g. future cloud storage)
  return path.startsWith("/") ? path : `/${path}`;
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
