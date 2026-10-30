import os
from pydantic import BaseSettings, Field, PostgresDsn, RedisDsn

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "SciCollab Backend"
    DEBUG: bool = False

    # Database
    POSTGRES_DSN: PostgresDsn = Field(..., env="POSTGRES_DSN")

    # Redis
    REDIS_URL: RedisDsn = Field(default="redis://localhost:6379", env="REDIS_URL")

    # JWT
    JWT_SECRET_KEY: str = Field(..., env="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Security
    PASSWORD_SALT: str = Field(..., env="PASSWORD_SALT")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()