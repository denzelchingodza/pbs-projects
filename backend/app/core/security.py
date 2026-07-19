"""
Password hashing + JWT helpers for admin login.

How the pieces fit together:
1. When an admin is created, their password is hashed with bcrypt (hash_password)
   and only the hash is stored — the real password is never saved anywhere.
2. On login, verify_password checks the typed password against that stored hash.
3. If it matches, create_access_token issues a JWT (a signed token) containing
   the user's email. The frontend stores this token and sends it back on every
   admin request in an `Authorization: Bearer <token>` header.
4. decode_access_token verifies the token's signature (using SECRET_KEY) and
   expiry, and hands back the email inside it — that's how core/deps.py knows
   who's making the request without hitting the database with a session/cookie.
"""
from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
