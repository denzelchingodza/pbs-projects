from pydantic import BaseModel


class ProjectOut(BaseModel):
    id: int
    title: str
    category: str
    image_url: str
    media_type: str = "image"  # "image" or "video"
    before_image_url: str | None = None
    is_featured: bool = False

    class Config:
        from_attributes = True
