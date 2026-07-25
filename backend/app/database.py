"""SQLAlchemy engine/session setup — swap DATABASE_URL to move from SQLite to Postgres."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

def _get_db_url() -> str:
    url = settings.database_url
    # Neon (and most Postgres providers) give you a plain postgresql:// URL,
    # but SQLAlchemy routes that to psycopg2. We installed psycopg v3, so
    # rewrite the scheme to postgresql+psycopg:// so SQLAlchemy uses the
    # right driver. SQLite URLs are left untouched.
    if url.startswith("postgresql://") or url.startswith("postgres://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        url = url.replace("postgres://", "postgresql+psycopg://", 1)
    return url

_db_url = _get_db_url()
connect_args = {"check_same_thread": False} if _db_url.startswith("sqlite") else {}
engine = create_engine(_db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
