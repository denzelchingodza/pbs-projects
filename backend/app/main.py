"""
FastAPI entrypoint for the PBS Projects backend.
Run locally with: uvicorn app.main:app --reload
"""
import os
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings as app_settings
from app.routers import auth, products, gallery, quotes, admin, settings, testimonials

app = FastAPI(title="PBS Projects API", version="0.1.0")

# The real secret key lives in backend/.env (gitignored) and is what every
# admin login token is signed with, if that file is ever missing (a fresh
# clone that skipped copying .env, or a real server that was never
# configured), app/config.py quietly falls back to a placeholder value
# instead of failing. A server signing tokens with a placeholder anyone can
# read straight out of this file's own history is the same as having no
# signature at all. This can't silently pass, print a warning loud enough to
# notice on every startup until it's fixed.
if app_settings.secret_key == "dev-secret-change-me":
    print(
        "\n"
        "WARNING: SECRET_KEY is still the placeholder value.\n"
        "Set a real SECRET_KEY in backend/.env before this is used for anything real,\n"
        "admin login sessions are not safe until this is changed.\n",
        file=sys.stderr,
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    # Also allow the dev server when it's opened from another device on the
    # same network (phone testing), e.g. http://192.168.1.23:3000. Matches
    # the common private IP ranges only, never applies outside local dev.
    allow_origin_regex=r"http://(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}):3000",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serves uploaded gallery photos (backend/static/uploads/*) at /static/uploads/*
# so the frontend can just use the image_url the API returns, unchanged.
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(gallery.router, prefix="/api/gallery", tags=["gallery"])
app.include_router(quotes.router, prefix="/api/quotes", tags=["quotes"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(testimonials.router, prefix="/api/testimonials", tags=["testimonials"])


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
