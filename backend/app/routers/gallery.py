"""Public: gallery items, optionally filtered by ?category=windows etc."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.schemas.project import ProjectOut

router = APIRouter()


@router.get("/", response_model=list[ProjectOut])
def list_projects(category: str | None = Query(default=None), db: Session = Depends(get_db)):
    q = db.query(Project)
    if category:
        q = q.filter(Project.category == category)
    # Ordered by id (upload order) on purpose: photos from the same job site
    # are uploaded back to back, so this keeps them sitting next to each
    # other in the gallery instead of the database returning them in a
    # random order.
    return q.order_by(Project.id).all()
