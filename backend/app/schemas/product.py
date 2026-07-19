from pydantic import BaseModel


class ProductOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None = None
    thumbnail_url: str | None = None

    class Config:
        from_attributes = True
