"""
Client testimonials shown on the homepage. Two ways these get created:
seeded starter content (seed.py, marked approved right away), and real
customers submitting their own through the public form on the site, which
come in as "pending" and only show up publicly once the admin approves
them, so a random submission can't put unmoderated text on the site.
"""
from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class Testimonial(Base):
    __tablename__ = "testimonials"
    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String, nullable=False)
    client_role = Column(String)
    quote = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
    status = Column(String, nullable=False, default="pending")  # "pending" or "approved"
