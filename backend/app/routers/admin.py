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
from app.services.image_service import save_upload, delete_upload

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
async def upload_gallery_photo(
    title: str = Form(...),
    category: str = Form(...),
    is_featured: bool = Form(False),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    if category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"category must be one of {sorted(VALID_CATEGORIES)}")

    contents = await file.read()
    if len(contents) > 8 * 1024 * 1024:  # 8MB cap — keep uploads reasonable
        raise HTTPException(status_code=400, detail="Image too large (max 8MB)")

    try:
        urls = save_upload(contents, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    project = Project(
        title=title,
        category=category,
        image_url=urls["image_url"],
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
    delete_upload(project.image_url)
    db.delete(project)
    db.commit()
    return {"deleted": True}
