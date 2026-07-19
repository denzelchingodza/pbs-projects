"""The 6 product categories: Windows, Doors, Shower Cubicles, Shop Fronts, Ceilings, Cabinets."""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True)
    description = Column(Text)
    thumbnail_url = Column(String)
