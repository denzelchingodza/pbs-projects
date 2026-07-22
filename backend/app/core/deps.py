"""
Shared FastAPI dependency: get_current_admin.

Any route that adds `admin: User = Depends(get_current_admin)` to its function
signature now requires a valid `Authorization: Bearer <token>` header. FastAPI
runs this function first; if it raises, the route never executes and the
caller gets a 401 automatically.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

# Tells FastAPI (and its auto-generated /docs page) where to send login
# requests to get a token — used for the interactive "Authorize" button.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired admin session, please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    email = decode_access_token(token)
    if email is None:
        raise credentials_error

    user = db.query(User).filter(User.email == email).first()
    if user is None or not user.is_admin:
        raise credentials_error
    return user
