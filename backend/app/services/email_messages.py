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


def session_accepted(
    *,
    student_name: str,
    counsellor_name: str,
    scheduled_at: str,
    session_format: str,
) -> tuple[str, str]:
    subject = "PeerPoint — your session request was accepted"
    body = (
        f"Hi {student_name},\n\n"
        f"{counsellor_name} has accepted your peer counselling session request.\n\n"
        f"When: {scheduled_at}\n"
        f"Format: {session_format}\n\n"
        "Log in to PeerPoint to view your upcoming sessions.\n\n"
        "— PeerPoint"
    )
    return subject, body


def session_rejected(
    *,
    student_name: str,
    counsellor_name: str,
    scheduled_at: str,
    session_format: str,
    rejection_reason: str | None = None,
) -> tuple[str, str]:
    subject = "PeerPoint — update on your session request"
    reason_block = ""
    if rejection_reason:
        reason_block = f"\nReason: {rejection_reason}\n"
    body = (
        f"Hi {student_name},\n\n"
        f"{counsellor_name} was unable to accept your session request "
        f"for {scheduled_at} ({session_format})."
        f"{reason_block}\n"
        "You can request another time or choose a different counsellor on PeerPoint.\n\n"
        "— PeerPoint"
    )
    return subject, body


def resource_published(
    *,
    title: str,
    category: str,
    description: str,
    url: str,
) -> tuple[str, str]:
    subject = f"PeerPoint — new resource: {title}"
    body = (
        "A new wellness resource is available on PeerPoint.\n\n"
        f"Title: {title}\n"
        f"Category: {category}\n\n"
        f"{description}\n\n"
        f"Read it here: {url}\n\n"
        "— PeerPoint"
    )
    return subject, body


def session_requested(
    *,
    counsellor_name: str,
    student_display_name: str,
    topic: str,
    scheduled_at: str,
    session_format: str,
    notes: str | None = None,
) -> tuple[str, str]:
    subject = "PeerPoint — new session request"
    notes_block = ""
    if notes and notes.strip():
        notes_block = f"Notes: {notes.strip()}\n"
    body = (
        f"Hi {counsellor_name},\n\n"
        "You have a new peer counselling session request.\n\n"
        f"Student: {student_display_name}\n"
        f"Topic: {topic}\n"
        f"When: {scheduled_at}\n"
        f"Format: {session_format}\n"
        f"{notes_block}\n"
        "Open your counsellor dashboard to review and respond.\n\n"
        "— PeerPoint"
    )
    return subject, body


def resource_approved(
    *,
    counsellor_name: str,
    title: str,
    url: str,
) -> tuple[str, str]:
    subject = "PeerPoint — your resource was approved"
    body = (
        f"Hi {counsellor_name},\n\n"
        f"Your resource \"{title}\" was approved and published.\n\n"
        f"View it here: {url}\n\n"
        "— PeerPoint"
    )
    return subject, body


def resource_rejected(
    *,
    counsellor_name: str,
    title: str,
    rejection_reason: str | None = None,
) -> tuple[str, str]:
    subject = "PeerPoint — your resource review outcome"
    reason_block = ""
    if rejection_reason and rejection_reason.strip():
        reason_block = f"\nReason: {rejection_reason.strip()}\n"
    body = (
        f"Hi {counsellor_name},\n\n"
        f"Your resource \"{title}\" was not approved for publishing."
        f"{reason_block}\n"
        "Please update the resource and resubmit it for review.\n\n"
        "— PeerPoint"
    )
    return subject, body


def account_deactivated(*, full_name: str) -> tuple[str, str]:
    subject = "Your PeerPoint account has been deactivated."
    body = (
        f"Hi {full_name},\n\n"
        "Your PeerPoint student account has been deactivated. "
        "You will not be able to sign in until it is reactivated.\n\n"
        "If you have questions, please contact the Strathmore University "
        "Mental Health Club.\n\n"
        "— PeerPoint"
    )
    return subject, body


def account_reactivated(*, full_name: str) -> tuple[str, str]:
    subject = "Your PeerPoint account has been reactivated."
    body = (
        f"Hi {full_name},\n\n"
        "Your PeerPoint student account has been reactivated. "
        "You can sign in again at any time.\n\n"
        "If you have questions, please contact the Strathmore University "
        "Mental Health Club.\n\n"
        "— PeerPoint"
    )
    return subject, body
