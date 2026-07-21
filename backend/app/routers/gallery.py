"""Public: gallery projects (jobs), optionally filtered by ?category=windows
etc. Each project embeds its own photos/videos, so one job with 3 photos
comes back as one project with a 3 item media list, not 3 separate entries.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.project import Project
from app.schemas.project import ProjectOut

router = APIRouter()


@router.get("/", response_model=list[ProjectOut])
def list_projects(category: str | None = Query(default=None), db: Session = Depends(get_db)):
    q = db.query(Project).options(selectinload(Project.media))
    if category:
        q = q.filter(Project.category == category)
    # Ordered by id (upload order) on purpose: jobs from the same site were
    # uploaded back to back, this keeps them sitting next to each other in
    # the gallery instead of the database returning them in a random order.
    return q.order_by(Project.id).all()
