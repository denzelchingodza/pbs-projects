"""
Single-row 'site settings' table — one source of truth for business info that
shows up in multiple places on the site (footer, contact page, map, About page).
Admin-editable, so if PBS moves premises or the owner's bio changes, it's a
form edit, not a code change.
"""
from sqlalchemy import Column, Integer, String, Text, Float
from app.database import Base


class SiteSettings(Base):
    __tablename__ = "site_settings"
    id = Column(Integer, primary_key=True, default=1)

    # Business info (feeds footer, contact page, map)
    business_name = Column(String, default="PBS Projects")
    address = Column(String, default="09 Sherwood Rd, Waterfalls, Harare")
    phone_primary = Column(String, default="+263 71 212 2020")
    phone_secondary = Column(String, default="+263 77 743 3279")
    whatsapp_number = Column(String, default="+263 71 212 2020")
    email = Column(String, default="pbs@gmail.com")

    # Map — lat/lng drive the embedded map pin. Free Google Maps iframe embed
    # needs no API key; only switch to the JS Maps API/Places if you later want
    # live directions or search inside the page.
    map_lat = Column(Float, nullable=True)
    map_lng = Column(Float, nullable=True)

    # "Meet the Founder" / About-the-owner section
    owner_name = Column(String, nullable=True)
    owner_role = Column(String, default="Founder")
    owner_bio = Column(Text, nullable=True)
    owner_photo_url = Column(String, nullable=True)
    years_experience = Column(Integer, nullable=True)
    founded_year = Column(Integer, nullable=True)
