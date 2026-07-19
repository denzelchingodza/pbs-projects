from pydantic import BaseModel


class TestimonialOut(BaseModel):
    id: int
    client_name: str
    client_role: str | None = None
    quote: str
    rating: int

    class Config:
        from_attributes = True
