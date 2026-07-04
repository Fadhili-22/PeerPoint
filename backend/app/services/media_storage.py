"""Local filesystem storage for uploaded media."""

from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.config import settings

ALLOWED_CONTENT_TYPES: dict[str, str] = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

UPLOAD_SUBDIR = "uploads"


def static_root() -> Path:
    return Path(__file__).resolve().parent.parent.parent / "static"


def uploads_dir() -> Path:
    path = static_root() / UPLOAD_SUBDIR
    path.mkdir(parents=True, exist_ok=True)
    return path


def max_upload_bytes() -> int:
    return settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


def validate_and_save_upload(file: UploadFile) -> tuple[str, str]:
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Unsupported file type. Allowed types: JPEG, PNG, WebP.",
        )

    content = file.file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Empty file.",
        )

    if len(content) > max_upload_bytes():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE_MB} MB."
            ),
        )

    extension = ALLOWED_CONTENT_TYPES[content_type]
    key = f"{uuid.uuid4().hex}{extension}"
    destination = uploads_dir() / key
    destination.write_bytes(content)

    base_url = settings.API_PUBLIC_BASE_URL.rstrip("/")
    url = f"{base_url}/static/{UPLOAD_SUBDIR}/{key}"
    return url, key
