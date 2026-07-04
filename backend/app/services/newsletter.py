"""Newsletter subscription persistence."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import NewsletterSubscription


def subscribe(db: Session, email: str) -> NewsletterSubscription:
    normalized = email.strip().lower()
    subscription = (
        db.query(NewsletterSubscription)
        .filter(NewsletterSubscription.email == normalized)
        .first()
    )
    if subscription is not None:
        if not subscription.active:
            subscription.active = True
            db.commit()
            db.refresh(subscription)
        return subscription

    subscription = NewsletterSubscription(email=normalized, active=True)
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


def list_active_subscriber_emails(db: Session) -> list[str]:
    rows = (
        db.query(NewsletterSubscription.email)
        .filter(NewsletterSubscription.active.is_(True))
        .all()
    )
    return [email for (email,) in rows]
