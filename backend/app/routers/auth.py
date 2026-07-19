"""Admin login — issues a JWT used to access /api/admin/* routes."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserLogin, Token

router = APIRouter()


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    # TODO: verify credentials against app.models.user.User, return a real JWT
    return {"access_token": "todo-generate-real-jwt", "token_type": "bearer"}
