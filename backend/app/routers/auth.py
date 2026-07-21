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
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_admin
from app.schemas.user import ChangePasswordRequest, UserLogin, Token, AdminOut

router = APIRouter()

MIN_PASSWORD_LENGTH = 8


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


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Lets a logged in admin set a new password for their own account. Requires
    the current password (proves it's really the account owner making the
    change, a stolen but still valid session token alone isn't enough), and
    the new one has to actually be a real password, not left as whatever the
    site was first set up with."""
    if not verify_password(payload.current_password, admin.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    if len(payload.new_password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"New password must be at least {MIN_PASSWORD_LENGTH} characters.",
        )

    if payload.new_password == payload.current_password:
        raise HTTPException(status_code=400, detail="New password must be different from the current one.")

    admin.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"changed": True}
