"""Public: submit a quote request from the 'Get a Quote' form."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.rate_limit import rate_limit
from app.database import get_db
from app.models.quote import QuoteRequest
from app.schemas.quote import QuoteCreate, QuoteOut
from app.services.whatsapp_service import notify_new_quote

router = APIRouter()

# Registered both with and without the trailing slash, see the comment in
# routers/settings.py, this is what keeps the quote form working when the
# site is opened on a phone through the Next.js dev proxy.


@router.post("", response_model=QuoteOut, include_in_schema=False, dependencies=[Depends(rate_limit(max_requests=5, window_seconds=300))])
@router.post("/", response_model=QuoteOut, dependencies=[Depends(rate_limit(max_requests=5, window_seconds=300))])
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
