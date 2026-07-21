"""Admin-only: manage the quote pipeline, gallery projects, and testimonials.
Every route here requires a valid admin login via get_current_admin.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.core.deps import get_current_admin
from app.models.user import User
from app.models.quote import QuoteRequest
from app.models.project import Project
from app.models.project_media import ProjectMedia
from app.models.testimonial import Testimonial
from app.schemas.quote import QuoteOut, QuoteStatusUpdate
from app.schemas.project import ProjectOut, ProjectUpdate
from app.schemas.testimonial import TestimonialOut
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
#
# A "project" is a real job, it can have one photo or several (the same job
# site photographed more than once). Uploading the very first photo creates
# the project, every photo after that attaches to the existing project
# instead of starting a new one, this is what keeps a 3 photo job from
# showing up as 3 unrelated gallery entries.

def _save_media_file(file: UploadFile, contents: bytes):
    media_type = detect_media_type(file.filename or "")
    if media_type is None:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. Photos: "
                f"{', '.join(sorted(IMAGE_EXTS))}. Videos: {', '.join(sorted(VIDEO_EXTS))}."
            ),
        )
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
    return media_type, urls["image_url"]


@router.post("/gallery", response_model=ProjectOut)
async def create_project(
    title: str = Form(...),
    category: str = Form(...),
    is_featured: bool = Form(False),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Starts a new project with its first photo or video."""
    if category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"category must be one of {sorted(VALID_CATEGORIES)}")

    contents = await file.read()
    media_type, image_url = _save_media_file(file, contents)

    project = Project(title=title, category=category, is_featured=is_featured)
    project.media.append(ProjectMedia(image_url=image_url, media_type=media_type, position=0))
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.post("/gallery/{project_id}/media", response_model=ProjectOut)
async def add_project_media(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Adds another photo or video to an existing project (same job site)."""
    project = (
        db.query(Project)
        .options(selectinload(Project.media))
        .filter(Project.id == project_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    contents = await file.read()
    media_type, image_url = _save_media_file(file, contents)

    next_position = max([m.position for m in project.media], default=-1) + 1
    project.media.append(ProjectMedia(image_url=image_url, media_type=media_type, position=next_position))
    db.commit()
    db.refresh(project)
    return project


@router.patch("/gallery/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    project = db.query(Project).options(selectinload(Project.media)).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if payload.category is not None and payload.category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"category must be one of {sorted(VALID_CATEGORIES)}")

    if payload.title is not None:
        project.title = payload.title
    if payload.category is not None:
        project.category = payload.category
    if payload.is_featured is not None:
        project.is_featured = payload.is_featured

    db.commit()
    db.refresh(project)
    return project


@router.delete("/gallery/{project_id}/media/{media_id}")
def delete_project_media(
    project_id: int,
    media_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Removes one photo/video from a project. If that was the project's only
    photo, the now-empty project is removed too, a job with zero photos
    isn't something the gallery has any use for."""
    media = (
        db.query(ProjectMedia)
        .filter(ProjectMedia.id == media_id, ProjectMedia.project_id == project_id)
        .first()
    )
    if not media:
        raise HTTPException(status_code=404, detail="Photo not found")

    delete_upload(media.image_url, media.media_type)
    db.delete(media)
    db.commit()

    remaining = db.query(ProjectMedia).filter(ProjectMedia.project_id == project_id).count()
    if remaining == 0:
        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            db.delete(project)
            db.commit()
        return {"deleted": True, "project_deleted": True}

    return {"deleted": True, "project_deleted": False}


@router.delete("/gallery/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Removes a whole project and every photo/video that belongs to it."""
    project = db.query(Project).options(selectinload(Project.media)).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for media in project.media:
        delete_upload(media.image_url, media.media_type)

    db.delete(project)  # cascades to project_media, see Project.media relationship
    db.commit()
    return {"deleted": True}


# ---------- Testimonial moderation ----------

@router.get("/testimonials", response_model=list[TestimonialOut])
def list_all_testimonials(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    # Pending ones first, so there's always something to act on at the top
    # of the list instead of having to scroll for it.
    return (
        db.query(Testimonial)
        .order_by((Testimonial.status == "pending").desc(), Testimonial.id.desc())
        .all()
    )


@router.patch("/testimonials/{testimonial_id}", response_model=TestimonialOut)
def approve_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    testimonial.status = "approved"
    db.commit()
    db.refresh(testimonial)
    return testimonial


@router.delete("/testimonials/{testimonial_id}")
def delete_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    db.delete(testimonial)
    db.commit()
    return {"deleted": True}
