"""
Handles gallery photo uploads and auto-generates a resized, compressed version
for mobile — since most PBS customers browse on their phones, nothing should
serve a full-size desktop photo to a small screen on limited data.

Local dev: saves to backend/static/uploads and FastAPI serves that folder
directly (see the StaticFiles mount in app/main.py). Production: swap this
for a Cloudinary upload call (see CLOUDINARY_URL in .env) — same function
signature, different implementation, so routers/admin.py doesn't change.
"""
import os
import uuid

from PIL import Image

UPLOAD_DIR = "static/uploads"
MAX_WIDTH = 1600   # cap the full-size image at a sane width
THUMB_WIDTH = 500  # smaller version used in gallery grid thumbnails


def save_upload(file_bytes: bytes, original_filename: str) -> dict:
    """Saves an uploaded photo, returns the URLs the frontend/database should store."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    ext = os.path.splitext(original_filename)[1].lower() or ".jpg"
    if ext not in (".jpg", ".jpeg", ".png", ".webp"):
        raise ValueError(f"Unsupported image type: {ext}")

    # A random filename avoids collisions and avoids trusting user-supplied names.
    unique_name = f"{uuid.uuid4().hex}{ext}"
    full_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(full_path, "wb") as f:
        f.write(file_bytes)

    img = Image.open(full_path)
    img = img.convert("RGB") if img.mode in ("RGBA", "P") and ext in (".jpg", ".jpeg") else img
    img.thumbnail((MAX_WIDTH, MAX_WIDTH))
    img.save(full_path, optimize=True, quality=82)

    thumb_name = f"thumb_{unique_name}"
    thumb_path = os.path.join(UPLOAD_DIR, thumb_name)
    thumb = img.copy()
    thumb.thumbnail((THUMB_WIDTH, THUMB_WIDTH))
    thumb.save(thumb_path, optimize=True, quality=80)

    return {
        "image_url": f"/{full_path}",
        "thumbnail_url": f"/{thumb_path}",
    }


def delete_upload(image_url: str) -> None:
    """Removes a photo (and its thumbnail) from disk when an admin deletes a gallery item."""
    filename = os.path.basename(image_url)
    for path in (os.path.join(UPLOAD_DIR, filename), os.path.join(UPLOAD_DIR, f"thumb_{filename}")):
        if os.path.exists(path):
            os.remove(path)
