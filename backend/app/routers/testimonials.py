"""Public: client testimonials shown on the homepage."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.testimonial import Testimonial
from app.schemas.testimonial import TestimonialOut

router = APIRouter()


@router.get("/", response_model=list[TestimonialOut])
def list_testimonials(db: Session = Depends(get_db)):
    return db.query(Testimonial).all()
