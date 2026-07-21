from datetime import datetime

from pydantic import BaseModel


class ProjectMediaOut(BaseModel):
    id: int
    image_url: str
    media_type: str = "image"  # "image" or "video"

    class Config:
        from_attributes = True


class ProjectOut(BaseModel):
    id: int
    title: str
    category: str
    before_image_url: str | None = None
    is_featured: bool = False
    created_at: datetime | None = None
    media: list[ProjectMediaOut] = []

    class Config:
        from_attributes = True


class ProjectUpdate(BaseModel):
    title: str | None = None
    category: str | None = None
    is_featured: bool | None = None
