from pydantic import BaseModel


class SiteSettingsOut(BaseModel):
    business_name: str
    address: str
    phone_primary: str
    phone_secondary: str | None = None
    whatsapp_number: str
    email: str
    map_lat: float | None = None
    map_lng: float | None = None
    owner_name: str | None = None
    owner_role: str | None = None
    owner_bio: str | None = None
    owner_photo_url: str | None = None
    years_experience: int | None = None
    founded_year: int | None = None

    class Config:
        from_attributes = True


class SiteSettingsUpdate(BaseModel):
    """Admin-only partial update — every field optional so a PATCH can send just what changed."""
    business_name: str | None = None
    address: str | None = None
    phone_primary: str | None = None
    phone_secondary: str | None = None
    whatsapp_number: str | None = None
    email: str | None = None
    map_lat: float | None = None
    map_lng: float | None = None
    owner_name: str | None = None
    owner_role: str | None = None
    owner_bio: str | None = None
    owner_photo_url: str | None = None
    years_experience: int | None = None
    founded_year: int | None = None
