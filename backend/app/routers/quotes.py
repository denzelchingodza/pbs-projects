"""Public: submit a quote request from the 'Get a Quote' form."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.quote import QuoteRequest
from app.schemas.quote import QuoteCreate, QuoteOut

router = APIRouter()


@router.post("/", response_model=QuoteOut)
def submit_quote(payload: QuoteCreate, db: Session = Depends(get_db)):
    quote = QuoteRequest(**payload.model_dump())
    db.add(quote)
    db.commit()
    db.refresh(quote)
    # TODO: notify admin via WhatsApp/email that a new quote came in
    return quote
