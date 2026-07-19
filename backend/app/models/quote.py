"""Quote requests submitted through the 'Get a Quote' form."""
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base


class QuoteRequest(Base):
    __tablename__ = "quote_requests"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    product = Column(String)
    details = Column(Text)
    status = Column(String, default="new")  # new, contacted, closed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
