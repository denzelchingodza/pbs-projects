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

Storage backend: local disk (backend/static/uploads, served by the
StaticFiles mount in app/main.py) whenever CLOUDINARY_URL is unset, which
is always true for local development. The moment CLOUDINARY_URL is set (a
real deployment, e.g. Render, where the local disk doesn't persist across
restarts), every save/delete call here automatically routes to Cloudinary
instead. Same function signatures either way, so routers/admin.py never
has to know or care which one is actually active.
"""
import os
import re
import uuid
from io import BytesIO

import cloudinary
import cloudinary.uploader
import cloudinary.utils
from PIL import Image

from app.config import settings

UPLOAD_DIR = "static/uploads"
MAX_WIDTH = 1600   # cap the full-size image at a sane width
THUMB_WIDTH = 500  # smaller version used in gallery grid thumbnails

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
VIDEO_EXTS = {".mp4", ".mov", ".webm"}

MAX_IMAGE_BYTES = 8 * 1024 * 1024    # 8MB — plenty for a photo, gets resized down anyway
MAX_VIDEO_BYTES = 50 * 1024 * 1024   # 50MB — a short clip, not full raw footage

_cloudinary_configured = False


def _cloudinary_enabled() -> bool:
    """True once CLOUDINARY_URL is set, configuring the SDK exactly once the
    first time it's actually needed, not on every single upload call."""
    global _cloudinary_configured
    if not settings.cloudinary_url:
        return False
    if not _cloudinary_configured:
        cloudinary.config(cloudinary_url=settings.cloudinary_url)
        _cloudinary_configured = True
    return True


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
    ext = os.path.splitext(original_filename)[1].lower() or ".jpg"
    if ext not in IMAGE_EXTS:
        raise UnsupportedFileError(f"Unsupported image type: {ext}")

    if _cloudinary_enabled():
        return _save_image_to_cloudinary(file_bytes)
    return _save_image_to_disk(file_bytes, ext)


def _save_image_to_disk(file_bytes: bytes, ext: str) -> dict:
    os.makedirs(UPLOAD_DIR, exist_ok=True)

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


def _save_image_to_cloudinary(file_bytes: bytes) -> dict:
    # Same corrupted/unreadable-file check as the local path, so a bad
    # upload gets the same clean error instead of an opaque Cloudinary
    # failure, or a broken row saved with no way to tell why later.
    try:
        Image.open(BytesIO(file_bytes)).verify()
    except Exception:
        raise UnsupportedFileError("That file isn't a valid, readable image.")

    result = cloudinary.uploader.upload(file_bytes, folder="pbs-projects", resource_type="image")
    public_id = result["public_id"]

    # No separate upload needed for the thumbnail, Cloudinary generates and
    # caches a resized version on the fly from a transformation URL, the
    # same original file just gets served at a different size each time.
    full_url, _ = cloudinary.utils.cloudinary_url(
        public_id, width=MAX_WIDTH, crop="limit", quality="auto", fetch_format="auto"
    )
    thumb_url, _ = cloudinary.utils.cloudinary_url(
        public_id, width=THUMB_WIDTH, crop="limit", quality="auto", fetch_format="auto"
    )
    return {"image_url": full_url, "thumbnail_url": thumb_url}


def save_video_upload(file_bytes: bytes, original_filename: str) -> dict:
    """Saves an uploaded video exactly as received. See module docstring for why
    there's no resizing/compression step here, unlike photos."""
    ext = os.path.splitext(original_filename)[1].lower()
    if ext not in VIDEO_EXTS:
        raise UnsupportedFileError(f"Unsupported video type: {ext}")

    if _cloudinary_enabled():
        result = cloudinary.uploader.upload(file_bytes, folder="pbs-projects", resource_type="video")
        return {"image_url": result["secure_url"]}

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    unique_name = f"{uuid.uuid4().hex}{ext}"
    full_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(full_path, "wb") as f:
        f.write(file_bytes)

    return {"image_url": f"/{full_path}"}


def delete_upload(image_url: str, media_type: str = "image") -> None:
    """Removes an uploaded file when an admin deletes a gallery item. Local
    disk: removes the file (and thumbnail, for photos). Cloudinary: best
    effort delete by the public ID parsed back out of the stored URL, if
    that ever fails on an unexpected URL shape, it's skipped rather than
    blocking the gallery delete the admin actually asked for, a stray file
    left behind in Cloudinary costs nothing close to the free tier's limit
    either way."""
    if image_url.startswith("http://") or image_url.startswith("https://"):
        if _cloudinary_enabled():
            _delete_from_cloudinary(image_url, media_type)
        return

    filename = os.path.basename(image_url)
    paths = [os.path.join(UPLOAD_DIR, filename)]
    if media_type == "image":
        paths.append(os.path.join(UPLOAD_DIR, f"thumb_{filename}"))
    for path in paths:
        if os.path.exists(path):
            os.remove(path)


def _delete_from_cloudinary(image_url: str, media_type: str) -> None:
    # Cloudinary URLs look like:
    # https://res.cloudinary.com/<cloud>/image/upload/v169.../pbs-projects/<id>.jpg
    # The public ID is everything after the optional "v<digits>/" version
    # segment and before the file extension.
    match = re.search(r"/upload/(?:v\d+/)?(.+?)(?:\.[a-zA-Z0-9]+)?$", image_url)
    if not match:
        return
    public_id = match.group(1)
    try:
        cloudinary.uploader.destroy(public_id, resource_type="video" if media_type == "video" else "image")
    except Exception:
        pass
