from pydantic import BaseModel


class QuoteCreate(BaseModel):
    full_name: str
    phone: str
    product: str | None = None
    details: str | None = None


class QuoteOut(QuoteCreate):
    id: int
    status: str

    class Config:
        from_attributes = True
