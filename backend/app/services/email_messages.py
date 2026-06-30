"""Plain-text email bodies for auth and account lifecycle events."""

from __future__ import annotations

from app.config import settings


def counsellor_promoted(*, full_name: str) -> tuple[str, str]:
    portal_url = f"{settings.FRONTEND_URL.rstrip('/')}/counsellor"
    subject = "PeerPoint — peer counsellor access granted"
    body = (
        f"Hi {full_name},\n\n"
        "You have been promoted to Peer Counsellor on PeerPoint.\n\n"
        f"Open your counsellor portal: {portal_url}\n\n"
        "— PeerPoint"
    )
    return subject, body


def password_reset(*, full_name: str, reset_token: str) -> tuple[str, str]:
    reset_url = (
        f"{settings.FRONTEND_URL.rstrip('/')}/reset-password"
        f"?token={reset_token}"
    )
    subject = "PeerPoint — reset your password"
    body = (
        f"Hi {full_name},\n\n"
        "We received a request to reset your PeerPoint password.\n\n"
        f"Reset your password: {reset_url}\n\n"
        f"This link expires in {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes. "
        "If you did not request a reset, you can ignore this email.\n\n"
        "— PeerPoint"
    )
    return subject, body


def _format_verification_expiry() -> str:
    minutes = settings.EMAIL_VERIFICATION_EXPIRE_MINUTES
    if minutes % 60 == 0:
        hours = minutes // 60
        if hours == 1:
            return "1 hour"
        return f"{hours} hours"
    if minutes == 1:
        return "1 minute"
    return f"{minutes} minutes"


def email_verification(*, full_name: str, verification_token: str) -> tuple[str, str]:
    verify_url = (
        f"{settings.FRONTEND_URL.rstrip('/')}/verify-email"
        f"?token={verification_token}"
    )
    expiry_label = _format_verification_expiry()
    subject = "PeerPoint — verify your email"
    body = (
        f"Hi {full_name},\n\n"
        "Please verify your Strathmore email address to continue using PeerPoint.\n\n"
        f"Verify your email: {verify_url}\n\n"
        f"This link expires in {expiry_label}. "
        "If you did not create a PeerPoint account, you can ignore this email.\n\n"
        "— PeerPoint"
    )
    return subject, body
