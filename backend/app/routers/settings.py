"""
Public GET so the frontend (footer, contact page, map, About section) always
reads live business info instead of hardcoded text. Admin-only PATCH to edit it.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_admin
from app.models.user import User
from app.models.settings import SiteSettings
from app.schemas.settings import SiteSettingsOut, SiteSettingsUpdate

router = APIRouter()

# Every route below is registered twice, once with a trailing slash and once
# without. Browser requests proxied through the Next.js dev server (used for
# phone testing, see frontend/next.config.js) arrive here with the slash
# stripped off, registering the bare path too means that still matches
# directly instead of triggering FastAPI's own redirect, which would send
# the caller to this server's own address rather than back through the
# proxy, breaking things specifically on a phone. The slash-less copy is
# hidden from the API docs since it's a compatibility detail, not a second
# real endpoint.


@router.get("", response_model=SiteSettingsOut, include_in_schema=False)
@router.get("/", response_model=SiteSettingsOut)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(SiteSettings).first()
    if not settings:
        settings = SiteSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.patch("", response_model=SiteSettingsOut, include_in_schema=False)
@router.patch("/", response_model=SiteSettingsOut)
def update_settings(
    payload: SiteSettingsUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    settings = db.query(SiteSettings).first()
    if not settings:
        settings = SiteSettings()
        db.add(settings)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings
