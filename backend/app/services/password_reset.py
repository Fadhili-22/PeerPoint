"""Short-lived JWTs for password reset links."""

from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import HTTPException, status
from jose import JWTError, jwt

from app.config import settings

_PASSWORD_RESET_TYPE = "password_reset"


def create_password_reset_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "type": _PASSWORD_RESET_TYPE,
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_password_reset_token(token: str) -> int:
    invalid = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid or expired password reset token",
    )
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except JWTError as exc:
        raise invalid from exc

    if payload.get("type") != _PASSWORD_RESET_TYPE:
        raise invalid

    user_id = payload.get("sub")
    if user_id is None:
        raise invalid

    return int(user_id)
