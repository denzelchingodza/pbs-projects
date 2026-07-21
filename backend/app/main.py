"""
FastAPI entrypoint for the PBS Projects backend.
Run locally with: uvicorn app.main:app --reload
"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import auth, products, gallery, quotes, admin, settings, testimonials

app = FastAPI(title="PBS Projects API", version="0.1.0")

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
