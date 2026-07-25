"""App settings, loaded from environment variables (.env)."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./pbs_projects.db"
    secret_key: str = "dev-secret-change-me"
    access_token_expire_minutes: int = 1440
    cloudinary_url: str = ""

    # Comma-separated list of extra origins allowed to call this API, on top
    # of the local dev origins that are always allowed (see app/main.py).
    # Empty by default (local dev needs nothing extra). Set this to a real
    # deployment's frontend URL, e.g. "https://pbs-projects.vercel.app",
    # without needing to edit main.py directly for each new deployment.
    allowed_origins: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
