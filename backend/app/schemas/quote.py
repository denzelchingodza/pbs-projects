from pydantic import BaseModel, Field


class QuoteCreate(BaseModel):
    full_name: str
    phone: str
    product: str | None = None
    details: str | None = None
    # Honeypot: a hidden field real users never fill in. Bots that auto-fill every
    # input on a form will populate it, so reject the submission if it's non-empty.
    website: str = Field(default="", exclude=True)


class QuoteStatusUpdate(BaseModel):
    status: str  # new, contacted, quoted, won, lost
    admin_notes: str | None = None


class QuoteOut(BaseModel):
    id: int
    full_name: str
    phone: str
    product: str | None = None
    details: str | None = None
    status: str
    admin_notes: str | None = None

    class Config:
        from_attributes = True
