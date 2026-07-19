"""
Admin login — checks the email/password against the users table, and if they
match, issues a JWT the frontend will send back on every admin request.

This does NOT create admin accounts (there's no public "sign up" — by design,
since this is a single-business site with one or two known admins). New
admins are created with the seed script (Stage 5) or a future admin-invite
flow, never through an open registration endpoint.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.core.security import verify_password, create_access_token
from app.core.deps import get_current_admin
from app.schemas.user import UserLogin, Token, AdminOut

router = APIRouter()


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    token = create_access_token(subject=user.email)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=AdminOut)
def read_current_admin(admin: User = Depends(get_current_admin)):
    """Lets the frontend check 'am I still logged in, and who am I' on page load."""
    return admin
