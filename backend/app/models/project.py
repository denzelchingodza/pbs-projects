"""Gallery items — completed jobs, categorized by product type, managed by the admin."""
from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, index=True)  # windows, doors, shopfronts, ceilings, cabinets
    # image_url holds the URL of the uploaded file regardless of type — a photo
    # or a video, media_type says which. Kept as one column rather than two
    # (image_url / video_url) so every existing piece of code that reads
    # image_url (the public gallery, the homepage, the admin cards) keeps
    # working unchanged for photos, and video items just carry a different
    # media_type alongside the same field.
    image_url = Column(String, nullable=False)
    media_type = Column(String, nullable=False, default="image")  # "image" or "video"
    before_image_url = Column(String, nullable=True)  # for before/after slider
    is_featured = Column(Boolean, default=False)  # shows on homepage highlights
