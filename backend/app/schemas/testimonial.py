from pydantic import BaseModel, Field


class TestimonialCreate(BaseModel):
    client_name: str
    client_role: str | None = None
    quote: str
    rating: int = 5
    # Honeypot: same pattern as the quote form (see schemas/quote.py). Real
    # visitors never see or fill this field in, bots that auto-fill every
    # input do, so a non-empty value here means reject the submission.
    website: str = Field(default="", exclude=True)


class TestimonialOut(BaseModel):
    id: int
    client_name: str
    client_role: str | None = None
    quote: str
    rating: int
    status: str = "approved"

    class Config:
        from_attributes = True
