"""Public: submit a quote request from the 'Get a Quote' form."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.quote import QuoteRequest
from app.schemas.quote import QuoteCreate, QuoteOut
from app.services.whatsapp_service import notify_new_quote

router = APIRouter()


@router.post("/", response_model=QuoteOut)
def submit_quote(payload: QuoteCreate, db: Session = Depends(get_db)):
    if payload.website:
        # Honeypot field was filled in -> almost certainly a bot. Silently reject.
        raise HTTPException(status_code=400, detail="Invalid submission")

    quote = QuoteRequest(
        full_name=payload.full_name,
        phone=payload.phone,
        product=payload.product,
        details=payload.details,
    )
    db.add(quote)
    db.commit()
    db.refresh(quote)
    notify_new_quote(quote)  # WhatsApp/email ping to the admin — see services/whatsapp_service.py
    return quote
