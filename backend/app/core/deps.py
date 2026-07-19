"""Shared FastAPI dependencies, e.g. get_current_admin for protecting /api/admin/* routes."""
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db


def get_current_admin(db: Session = Depends(get_db)):
    # TODO: decode JWT from Authorization header, look up the user, verify is_admin
    raise NotImplementedError
