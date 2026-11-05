from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Non-sensitive — safe to have defaults
    PROJECT_NAME: str = "Scientific Collaboration Network API"
    API_V1_STR: str = "/api/v1"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 4320  # 3 days

    # Sensitive — MUST be set in .env, no hardcoded defaults
    SECRET_KEY: str
    POSTGRES_SERVER: str
    POSTGRES_PORT: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    DATABASE_URL: str
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_URL: str
    SEED_USER_PASSWORD: str  # Default password for seeded demo accounts

    # CORS — safe to have defaults for local dev
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:8443",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8443",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
