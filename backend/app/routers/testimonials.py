"""Public: client testimonials shown on the homepage, and the form real
customers use to submit their own.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.testimonial import Testimonial
from app.schemas.testimonial import TestimonialCreate, TestimonialOut
from app.services.whatsapp_service import notify_new_testimonial

router = APIRouter()


@router.get("/", response_model=list[TestimonialOut])
def list_testimonials(db: Session = Depends(get_db)):
    # Only approved testimonials are public, a fresh submission sits as
    # "pending" until the admin reviews it (see routers/admin.py).
    return db.query(Testimonial).filter(Testimonial.status == "approved").all()


@router.post("/", response_model=TestimonialOut)
def submit_testimonial(payload: TestimonialCreate, db: Session = Depends(get_db)):
    if payload.website:
        # Honeypot field was filled in, almost certainly a bot. Silently reject.
        raise HTTPException(status_code=400, detail="Invalid submission")

    if not (1 <= payload.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")

    testimonial = Testimonial(
        client_name=payload.client_name,
        client_role=payload.client_role,
        quote=payload.quote,
        rating=payload.rating,
        status="pending",
    )
    db.add(testimonial)
    db.commit()
    db.refresh(testimonial)
    notify_new_testimonial(testimonial)  # WhatsApp/email ping to the admin, see whatsapp_service.py
    return testimonial
