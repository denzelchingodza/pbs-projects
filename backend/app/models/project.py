"""Gallery items — completed jobs, categorized by product type, managed by the admin."""
from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, index=True)  # windows, doors, shopfronts, ceilings, cabinets
    image_url = Column(String, nullable=False)
    before_image_url = Column(String, nullable=True)  # for before/after slider
