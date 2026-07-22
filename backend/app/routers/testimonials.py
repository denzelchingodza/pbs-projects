"""Public: client testimonials shown on the homepage, and the form real
customers use to submit their own.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.rate_limit import rate_limit
from app.database import get_db
from app.models.testimonial import Testimonial
from app.schemas.testimonial import TestimonialCreate, TestimonialOut
from app.services.whatsapp_service import notify_new_testimonial

router = APIRouter()

# Registered both with and without the trailing slash, see the comment in
# routers/settings.py, this is what keeps testimonials loading and the
# submission form working when the site is opened on a phone through the
# Next.js dev proxy.


@router.get("", response_model=list[TestimonialOut], include_in_schema=False)
@router.get("/", response_model=list[TestimonialOut])
def list_testimonials(db: Session = Depends(get_db)):
    # Only approved testimonials are public, a fresh submission sits as
    # "pending" until the admin reviews it (see routers/admin.py).
    return db.query(Testimonial).filter(Testimonial.status == "approved").all()


@router.post(
    "",
    response_model=TestimonialOut,
    include_in_schema=False,
    dependencies=[Depends(rate_limit(max_requests=5, window_seconds=300, scope="testimonial_submit"))],
)
@router.post(
    "/",
    response_model=TestimonialOut,
    dependencies=[Depends(rate_limit(max_requests=5, window_seconds=300, scope="testimonial_submit"))],
)
def submit_testimonial(payload: TestimonialCreate, db: Session = Depends(get_db)):
    if payload.website:
        # Honeypot field was filled in, almost certainly a bot. Silently reject.
        raise HTTPException(status_code=400, detail="Invalid submission")

    # rating is already constrained to 1 to 5 by the schema (schemas/testimonial.py),
    # a request outside that range never reaches this line at all.

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
