from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    FRONTEND_URL: str = "http://localhost:5173"
    API_PUBLIC_BASE_URL: str = "http://127.0.0.1:8000"
    MAX_UPLOAD_SIZE_MB: int = 5

    EMAIL_BACKEND: Literal["console", "smtp"] = "console"
    EMAIL_FROM: str = "PeerPoint <noreply@peerpoint.local>"
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_USE_TLS: bool = True
    PASSWORD_RESET_EXPIRE_MINUTES: int = 30
    EMAIL_VERIFICATION_EXPIRE_MINUTES: int = 1440


settings = Settings()
