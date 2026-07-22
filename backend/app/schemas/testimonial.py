from pydantic import BaseModel, Field

# Same reasoning as schemas/quote.py, this is a public, unauthenticated form,
# these caps only ever stop an abusive oversized payload, never a real review.
NAME_MAX = 200
ROLE_MAX = 200
QUOTE_MAX = 2000


class TestimonialCreate(BaseModel):
    client_name: str = Field(max_length=NAME_MAX)
    client_role: str | None = Field(default=None, max_length=ROLE_MAX)
    quote: str = Field(max_length=QUOTE_MAX)
    rating: int = Field(default=5, ge=1, le=5)
    # Honeypot: same pattern as the quote form (see schemas/quote.py). Real
    # visitors never see or fill this field in, bots that auto-fill every
    # input do, so a non-empty value here means reject the submission.
    website: str = Field(default="", exclude=True, max_length=200)


class TestimonialOut(BaseModel):
    id: int
    client_name: str
    client_role: str | None = None
    quote: str
    rating: int
    status: str = "approved"

    class Config:
        from_attributes = True
