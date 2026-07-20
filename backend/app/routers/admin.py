"""Admin-only: manage the quote pipeline and gallery photos.
Every route here requires a valid admin login via get_current_admin.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_admin
from app.models.user import User
from app.models.quote import QuoteRequest
from app.models.project import Project
from app.schemas.quote import QuoteOut, QuoteStatusUpdate
from app.schemas.project import ProjectOut
from app.services.image_service import (
    IMAGE_EXTS,
    VIDEO_EXTS,
    MAX_IMAGE_BYTES,
    MAX_VIDEO_BYTES,
    UnsupportedFileError,
    detect_media_type,
    save_image_upload,
    save_video_upload,
    delete_upload,
)

router = APIRouter()

VALID_CATEGORIES = {"windows", "doors", "showercubicles", "shopfronts", "ceilings", "cabinets"}


# ---------- Quote pipeline ----------

@router.get("/quotes", response_model=list[QuoteOut])
def list_all_quotes(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return db.query(QuoteRequest).order_by(QuoteRequest.created_at.desc()).all()


@router.patch("/quotes/{quote_id}", response_model=QuoteOut)
def update_quote_status(
    quote_id: int,
    payload: QuoteStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    quote = db.query(QuoteRequest).filter(QuoteRequest.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    quote.status = payload.status
    if payload.admin_notes is not None:
        quote.admin_notes = payload.admin_notes
    db.commit()
    db.refresh(quote)
    return quote


# ---------- Gallery management ----------

@router.post("/gallery", response_model=ProjectOut)
async def upload_gallery_media(
    title: str = Form(...),
    category: str = Form(...),
    is_featured: bool = Form(False),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    if category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"category must be one of {sorted(VALID_CATEGORIES)}")

    media_type = detect_media_type(file.filename or "")
    if media_type is None:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. Photos: "
                f"{', '.join(sorted(IMAGE_EXTS))}. Videos: {', '.join(sorted(VIDEO_EXTS))}."
            ),
        )

    contents = await file.read()
    max_bytes = MAX_IMAGE_BYTES if media_type == "image" else MAX_VIDEO_BYTES
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"{media_type.capitalize()} too large (max {max_bytes // (1024 * 1024)}MB).",
        )

    try:
        urls = save_image_upload(contents, file.filename) if media_type == "image" else save_video_upload(
            contents, file.filename
        )
    except UnsupportedFileError as e:
        raise HTTPException(status_code=400, detail=str(e))

    project = Project(
        title=title,
        category=category,
        image_url=urls["image_url"],
        media_type=media_type,
        is_featured=is_featured,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/gallery/{project_id}")
def delete_gallery_photo(
    project_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    delete_upload(project.image_url, project.media_type)
    db.delete(project)
    db.commit()
    return {"deleted": True}
