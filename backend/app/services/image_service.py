"""Handles gallery photo uploads.
Local dev: saves to /static/uploads. Production: swap in Cloudinary (see CLOUDINARY_URL in .env).
"""


def save_upload(file) -> str:
    # TODO: local disk save for now; Cloudinary SDK call once deployed
    raise NotImplementedError
