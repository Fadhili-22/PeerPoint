"""Outbound email delivery for auth and account notifications."""

from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage
from typing import Literal

from app.config import settings

logger = logging.getLogger(__name__)

EmailBackend = Literal["console", "smtp"]


class EmailDeliveryError(Exception):
    """Raised when an email cannot be delivered via the configured backend."""


def send_email(
    *,
    to: str,
    subject: str,
    body_text: str,
    body_html: str | None = None,
) -> None:
    """Send a single email using the configured backend."""
    backend: EmailBackend = settings.EMAIL_BACKEND
    if backend == "console":
        _send_console(to=to, subject=subject, body_text=body_text)
        return
    if backend == "smtp":
        _send_smtp(
            to=to,
            subject=subject,
            body_text=body_text,
            body_html=body_html,
        )
        return
    raise EmailDeliveryError(f"Unsupported EMAIL_BACKEND: {backend!r}")


def _send_console(*, to: str, subject: str, body_text: str) -> None:
    logger.info(
        "\n--- PeerPoint email (console backend) ---\n"
        "To: %s\n"
        "Subject: %s\n\n"
        "%s\n"
        "--- end email ---",
        to,
        subject,
        body_text,
    )


def _send_smtp(
    *,
    to: str,
    subject: str,
    body_text: str,
    body_html: str | None,
) -> None:
    if not settings.SMTP_HOST:
        raise EmailDeliveryError("SMTP_HOST is required when EMAIL_BACKEND=smtp")

    message = EmailMessage()
    message["From"] = settings.EMAIL_FROM
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body_text)
    if body_html:
        message.add_alternative(body_html, subtype="html")

    try:
        if settings.SMTP_USE_TLS:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as client:
                client.starttls()
                if settings.SMTP_USER:
                    client.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                client.send_message(message)
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as client:
                if settings.SMTP_USER:
                    client.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                client.send_message(message)
    except smtplib.SMTPException as exc:
        raise EmailDeliveryError(str(exc)) from exc


def send_email_safe(
    *,
    to: str,
    subject: str,
    body_text: str,
    body_html: str | None = None,
) -> bool:
    """Best-effort send — logs failures without raising."""
    try:
        send_email(
            to=to,
            subject=subject,
            body_text=body_text,
            body_html=body_html,
        )
        return True
    except EmailDeliveryError:
        logger.exception("Failed to send email to %s (%s)", to, subject)
        return False
