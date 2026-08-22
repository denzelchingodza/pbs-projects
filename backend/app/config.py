"""App settings, loaded from environment variables (.env)."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./pbs_projects.db"
    secret_key: str = "dev-secret-change-me"
    access_token_expire_minutes: int = 1440
    cloudinary_url: str = ""

    # Google reCAPTCHA v2 secret key (from google.com/recaptcha/admin). Left
    # empty in local dev by default, quote submissions then skip reCAPTCHA
    # verification entirely rather than rejecting every single one with no
    # way to pass it (see services/recaptcha_service.py).
    recaptcha_secret_key: str = ""

    # Comma-separated list of extra origins allowed to call this API, on top
    # of the local dev origins that are always allowed (see app/main.py).
    # Empty by default (local dev needs nothing extra). Set this to a real
    # deployment's frontend URL, e.g. "https://pbs-projects.vercel.app",
    # without needing to edit main.py directly for each new deployment.
    allowed_origins: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
