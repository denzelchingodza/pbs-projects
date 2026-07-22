"""
Handles gallery uploads. Two kinds of files, two different treatments:

- Photos get resized (auto full-size + thumbnail), same as before, since
  most PBS customers browse on their phones, nothing should serve a
  full-size desktop photo to a small screen on limited data.
- Videos are stored as-is, no server-side compression or transcoding.
  Doing that properly needs ffmpeg and a background job queue (a video
  finishes processing well after the upload request itself returns), which
  is a real project of its own, not a one-line addition. Instead, the size
  cap below (MAX_VIDEO_BYTES) is what keeps this sane in the meantime: a
  short installation walkthrough clip fits comfortably under it, a full
  raw camera recording won't.

Local dev: saves to backend/static/uploads and FastAPI serves that folder
directly (see the StaticFiles mount in app/main.py). Production: swap this
for a real object storage upload (see CLOUDINARY_URL in .env, or an S3-
compatible bucket for video, which Cloudinary's free tier doesn't cover
well) — same function signatures, different implementation, so
routers/admin.py doesn't change.
"""
import os
import uuid

from PIL import Image

UPLOAD_DIR = "static/uploads"
MAX_WIDTH = 1600   # cap the full-size image at a sane width
THUMB_WIDTH = 500  # smaller version used in gallery grid thumbnails

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
VIDEO_EXTS = {".mp4", ".mov", ".webm"}

MAX_IMAGE_BYTES = 8 * 1024 * 1024    # 8MB — plenty for a photo, gets resized down anyway
MAX_VIDEO_BYTES = 50 * 1024 * 1024   # 50MB — a short clip, not full raw footage


class UnsupportedFileError(ValueError):
    """A file extension that isn't in IMAGE_EXTS or VIDEO_EXTS for its claimed type."""


def detect_media_type(filename: str) -> str | None:
    """Returns "image", "video", or None if the extension isn't recognized at all."""
    ext = os.path.splitext(filename)[1].lower()
    if ext in IMAGE_EXTS:
        return "image"
    if ext in VIDEO_EXTS:
        return "video"
    return None


def save_image_upload(file_bytes: bytes, original_filename: str) -> dict:
    """Saves an uploaded photo, resized for mobile. Returns the URLs to store."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    ext = os.path.splitext(original_filename)[1].lower() or ".jpg"
    if ext not in IMAGE_EXTS:
        raise UnsupportedFileError(f"Unsupported image type: {ext}")

    # A random filename avoids collisions and avoids trusting user-supplied names.
    unique_name = f"{uuid.uuid4().hex}{ext}"
    full_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(full_path, "wb") as f:
        f.write(file_bytes)

    # A file can have a .jpg name and still not actually be a valid image
    # (renamed, corrupted, or something else entirely), Pillow raises when
    # that happens. Without this, that error would surface as a raw 500 to
    # whoever uploaded it, and the bad file would sit on disk forever since
    # nothing ever cleans it up. Catch it, delete what was just written, and
    # report it the same clean way an unsupported extension already is.
    try:
        img = Image.open(full_path)
        img = img.convert("RGB") if img.mode in ("RGBA", "P") and ext in (".jpg", ".jpeg") else img
        img.thumbnail((MAX_WIDTH, MAX_WIDTH))
        img.save(full_path, optimize=True, quality=82)

        thumb_name = f"thumb_{unique_name}"
        thumb_path = os.path.join(UPLOAD_DIR, thumb_name)
        thumb = img.copy()
        thumb.thumbnail((THUMB_WIDTH, THUMB_WIDTH))
        thumb.save(thumb_path, optimize=True, quality=80)
    except Exception:
        if os.path.exists(full_path):
            os.remove(full_path)
        raise UnsupportedFileError("That file isn't a valid, readable image.")

    return {
        "image_url": f"/{full_path}",
        "thumbnail_url": f"/{thumb_path}",
    }


def save_video_upload(file_bytes: bytes, original_filename: str) -> dict:
    """Saves an uploaded video exactly as received. See module docstring for why
    there's no resizing/compression step here, unlike photos."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    ext = os.path.splitext(original_filename)[1].lower()
    if ext not in VIDEO_EXTS:
        raise UnsupportedFileError(f"Unsupported video type: {ext}")

    unique_name = f"{uuid.uuid4().hex}{ext}"
    full_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(full_path, "wb") as f:
        f.write(file_bytes)

    return {"image_url": f"/{full_path}"}


def delete_upload(image_url: str, media_type: str = "image") -> None:
    """Removes an uploaded file from disk when an admin deletes a gallery item.
    Photos also get their thumbnail removed; videos don't have one."""
    filename = os.path.basename(image_url)
    paths = [os.path.join(UPLOAD_DIR, filename)]
    if media_type == "image":
        paths.append(os.path.join(UPLOAD_DIR, f"thumb_{filename}"))
    for path in paths:
        if os.path.exists(path):
            os.remove(path)
