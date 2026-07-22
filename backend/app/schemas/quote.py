from typing import Literal

from pydantic import BaseModel, Field

# Reasonable ceilings on a public, unauthenticated form, anyone can hit this
# endpoint without logging in, so nothing here should accept an unbounded
# amount of text. A real name or phone number is never anywhere close to
# these limits, this only ever blocks someone trying to shove a huge
# payload into the database, not a real customer.
NAME_MAX = 200
PHONE_MAX = 40
PRODUCT_MAX = 200
DETAILS_MAX = 5000

QuoteStatus = Literal["new", "contacted", "quoted", "won", "lost"]


class QuoteCreate(BaseModel):
    full_name: str = Field(max_length=NAME_MAX)
    phone: str = Field(max_length=PHONE_MAX)
    product: str | None = Field(default=None, max_length=PRODUCT_MAX)
    details: str | None = Field(default=None, max_length=DETAILS_MAX)
    # Honeypot: a hidden field real users never fill in. Bots that auto-fill every
    # input on a form will populate it, so reject the submission if it's non-empty.
    website: str = Field(default="", exclude=True, max_length=200)


class QuoteStatusUpdate(BaseModel):
    status: QuoteStatus
    admin_notes: str | None = Field(default=None, max_length=DETAILS_MAX)


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
