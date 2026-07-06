"""Insert or update the Getting Started with PeerPoint platform guide.

Standalone one-off script — does not modify other seed scripts.
Idempotent by ``resources.id``.

Usage (from backend/ with venv active):
    python -m scripts.seed_getting_started_resource
"""

from __future__ import annotations

from datetime import datetime, timezone

from app.database import SessionLocal
from app.models import Resource, ResourceCategory, ResourceStatus

RESOURCE_ID = "getting-started-with-peerpoint"

BODY = [
    (
        "PeerPoint is Strathmore University's peer-to-peer mental health support "
        "platform, built with the Mental Health Club. It connects students with "
        "trained peer counsellors for confidential, judgement-free conversations "
        "— no appointments through a front desk, no waiting rooms."
    ),
    (
        "You can browse the counsellor directory anonymously. Counsellors won't see "
        "your name or details until you've booked and they've accepted a specific "
        "session — you're in control of when you're ready to be known."
    ),
    (
        "Not sure who to book? Use Find My Counsellor. It's a short quiz about what "
        "you're going through and what kind of support you're looking for, and it "
        "points you toward counsellors whose focus areas are the closest match."
    ),
    (
        "Once you find a counsellor, check their Weekly Availability to see which "
        "days they have open slots, then use Request a Session to propose a time. "
        "They'll accept, decline, or suggest an alternative."
    ),
    (
        "Contact details — email and phone — are only exchanged once a session is "
        "accepted. Before that, everything stays anonymous. This is deliberate: you "
        "should be able to browse and request without exposing yourself unless you "
        "choose to."
    ),
    (
        "After a completed session, you'll have the option to leave a private rating. "
        "It's anonymous to the counsellor and only visible to platform admins — it's "
        "there to help us keep quality high, not to put pressure on you or the "
        "counsellor."
    ),
    (
        "PeerPoint is peer support, not clinical therapy. Peer counsellors are trained "
        "students, not licensed professionals. If you're in crisis or need urgent "
        "help, use the Crisis Support button available throughout the app, or check "
        "the Emergency Info page for helplines."
    ),
    (
        "If you have questions the app doesn't answer, reach out to the SU Mental "
        "Health Club directly through Contact Support in the footer."
    ),
]


def seed_getting_started_resource() -> None:
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        values = {
            "slug": RESOURCE_ID,
            "title": "Getting Started with PeerPoint",
            "category": ResourceCategory.self_care,
            "description": (
                "A quick guide to finding a peer counsellor, booking a session, "
                "and understanding how privacy works on PeerPoint."
            ),
            "read_time": "3 min read",
            "author": "Fadhili Njenga",
            "author_role": "Developer",
            "image": "/static/uploads/mhc-getting-started-cover.png",
            "image_alt": "SU Mental Health Club logo",
            "body": BODY,
            "status": ResourceStatus.published,
            "featured": False,
            "featured_order": None,
            "published_at": now,
            "updated_at": now,
        }

        existing = db.query(Resource).filter(Resource.id == RESOURCE_ID).first()
        if existing is None:
            db.add(
                Resource(
                    id=RESOURCE_ID,
                    created_at=now,
                    **values,
                )
            )
            action = "inserted"
        else:
            for key, value in values.items():
                setattr(existing, key, value)
            action = "updated"

        db.commit()
        print(f"Getting Started resource {action} (id={RESOURCE_ID})")
    finally:
        db.close()


def main() -> None:
    seed_getting_started_resource()


if __name__ == "__main__":
    main()
