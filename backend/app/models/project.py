"""
Gallery projects. A Project is a completed job (for example "Bay window
installation, Borrowdale"), the actual photos and videos of that job live in
ProjectMedia, one job can have one photo or several. This used to be a single
table where every uploaded photo was its own "project," which meant one real
job with 3 photos showed up as 3 separate, unrelated projects, that was
wrong, this is the fix.
"""
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, index=True)  # windows, doors, showercubicles, shopfronts, ceilings, cabinets
    before_image_url = Column(String, nullable=True)  # optional, for the before/after slider
    is_featured = Column(Boolean, default=False)  # shows on homepage highlights
    created_at = Column(DateTime, default=datetime.utcnow)

    # order_by keeps photos within a project in upload order. cascade means
    # deleting a project from the session also deletes its photos/videos,
    # this is enforced by SQLAlchemy itself rather than relying on SQLite's
    # foreign key cascade (which isn't turned on for this app's connections).
    media = relationship(
        "ProjectMedia",
        back_populates="project",
        order_by="ProjectMedia.position",
        cascade="all, delete-orphan",
    )
