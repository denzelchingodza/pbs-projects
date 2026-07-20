/**
 * Mirrors the backend's real limits (backend/app/services/image_service.py)
 * so the admin gets an immediate, specific error in the browser instead of
 * picking a file, waiting for the upload, and only then finding out it was
 * rejected. The backend re-checks all of this independently either way,
 * this is purely a faster/friendlier first check.
 */
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
