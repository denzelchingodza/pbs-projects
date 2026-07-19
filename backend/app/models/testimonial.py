"""Client testimonials shown on the homepage."""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class Testimonial(Base):
    __tablename__ = "testimonials"
    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String, nullable=False)
    client_role = Column(String)
    quote = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
