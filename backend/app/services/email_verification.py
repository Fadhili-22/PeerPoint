"""Short-lived JWTs for email verification links."""

from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import HTTPException, status
from jose import JWTError, jwt

from app.config import settings

_EMAIL_VERIFICATION_TYPE = "email_verification"


def create_email_verification_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(
        minutes=settings.EMAIL_VERIFICATION_EXPIRE_MINUTES
    )
    payload = {
        "sub": str(user_id),
        "type": _EMAIL_VERIFICATION_TYPE,
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_email_verification_token(token: str) -> int:
    invalid = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid or expired verification link",
    )
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except JWTError as exc:
        raise invalid from exc

    if payload.get("type") != _EMAIL_VERIFICATION_TYPE:
        raise invalid

    user_id = payload.get("sub")
    if user_id is None:
        raise invalid

    return int(user_id)
