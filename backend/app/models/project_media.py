"""One photo or video that belongs to a Project. A project with 3 site photos
has 1 Project row and 3 ProjectMedia rows, this is what actually lets photos
from the same job get grouped and shown together instead of each looking
like its own unrelated project."""
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class ProjectMedia(Base):
    __tablename__ = "project_media"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String, nullable=False)
    media_type = Column(String, nullable=False, default="image")  # "image" or "video"
    position = Column(Integer, nullable=False, default=0)  # display order within the project
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="media")
