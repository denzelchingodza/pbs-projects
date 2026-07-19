"""App settings, loaded from environment variables (.env)."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./pbs_projects.db"
    secret_key: str = "dev-secret-change-me"
    access_token_expire_minutes: int = 1440
    cloudinary_url: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
