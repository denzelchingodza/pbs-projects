"""Admin-only: manage gallery photos, product text, and view quote submissions.
All routes here should depend on app.core.deps.get_current_admin once auth is wired up.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.quote import QuoteRequest
from app.schemas.quote import QuoteOut

router = APIRouter()


@router.get("/quotes", response_model=list[QuoteOut])
def list_all_quotes(db: Session = Depends(get_db)):
    # TODO: require admin auth (Depends(get_current_admin))
    return db.query(QuoteRequest).all()
