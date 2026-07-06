"""Reset core user/session tables and seed 50 panel-demo accounts with phones.

Standalone script for panel demos — does not modify other seed scripts.

Truncates (FK-safe): session_ratings, session_requests, counsellor_availability_schedule,
counsellor_profiles, user_roles, users. Also clears user-linked rows that would block
users truncation (promotion_candidates, account_approval_requests, resource_saves) and
nulls optional resources.*_by_id references.

Uses the `phone` column on users (not phone_number). Targets DATABASE_URL with port 5433.

Usage (from backend/ with venv active):
    python -m scripts.seed_panel_users
"""

from __future__ import annotations

import sys

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

from app import utils
from app.config import settings
from app.models import (
    CounsellorProfile,
    CounsellorProfileStatus,
    User,
    UserRole,
)
from app.services.user_roles import grant_role

PANEL_PASSWORD = "PanelDemo1!"
USER_COUNT = 50
COUNSELLOR_COUNT = 20
EXPECTED_DB_PORT = 5433

CANONICAL_SPECIALTIES = [
    "Academic Stress",
    "Anxiety",
    "Depression",
    "Relationships",
    "Career Guidance",
    "Time Management",
    "Self-Esteem",
    "Grief & Loss",
    "Family Issues",
    "Adjustment to University Life",
]

PROGRAMS = [
    "BSc Computer Science",
    "BBA Finance",
    "BCom Marketing",
    "BSc Actuarial Science",
    "BSc Informatics and Computer Science",
    "BSc Electrical Engineering",
    "BSc Financial Engineering",
    "BSc Tourism Management",
    "BSc Supply Chain Management",
    "LLB Law",
]

LANGUAGES = ["English", "Swahili", "French", "Arabic", "Spanish"]

KENYAN_MOBILE_PREFIXES = [
    "0701",
    "0702",
    "0710",
    "0712",
    "0720",
    "0722",
    "0733",
    "0740",
    "0751",
    "0768",
    "0790",
    "0112",
]

FIRST_NAMES = [
    "Wanjiku",
    "Otieno",
    "Kamau",
    "Achieng",
    "Njoroge",
    "Wambui",
    "Kiprotich",
    "Nyambura",
    "Mutua",
    "Adhiambo",
    "Njeri",
    "Omondi",
    "Wangari",
    "Mwangi",
    "Cherono",
    "Barasa",
    "Akinyi",
    "Kariuki",
    "Wairimu",
    "Hassan",
    "Faith",
    "Brian",
    "Lucy",
    "Daniel",
    "Grace",
    "Zawadi",
    "Kevin",
    "Mercy",
    "Ian",
    "Purity",
    "Collins",
    "Sharon",
    "Victor",
    "Esther",
    "Felix",
    "Joy",
    "Martin",
    "Cynthia",
    "Dennis",
    "Linet",
    "George",
    "Ann",
    "Samuel",
    "Diana",
    "Peter",
    "Naomi",
    "James",
    "Ruth",
    "Eric",
    "Caroline",
]

LAST_NAMES = [
    "Kimani",
    "Ochieng",
    "Wanjala",
    "Mutiso",
    "Ndungu",
    "Odhiambo",
    "Muthoni",
    "Kiplagat",
    "Githinji",
    "Wafula",
    "Maina",
    "Chebet",
    "Onyango",
    "Wekesa",
    "Njenga",
    "Aoko",
    "Korir",
    "Mugo",
    "Wanjiru",
    "Kilonzo",
    "Macharia",
    "Atieno",
    "Kiptoo",
    "Nyongesa",
    "Ouma",
    "Karanja",
    "Chepkoech",
    "Mboya",
    "Akoth",
    "Rotich",
    "Wambua",
    "Kinyua",
    "Auma",
    "Langat",
    "Mirembe",
    "Koech",
    "Nyokabi",
    "Musyoka",
    "Otieno",
    "Muriuki",
    "Waweru",
    "Kamande",
    "Gitau",
    "Njuguna",
    "Mbugua",
    "Karanja",
    "Wanjohi",
    "Kibet",
    "Cheruiyot",
    "Tanui",
]

BIO_TEMPLATES = [
    "I enjoy helping students navigate {focus} and build practical coping strategies.",
    "My focus is on {focus}, supporting peers through campus life with empathy and structure.",
    "I work with students facing {focus}, using listening and goal-setting to create steady progress.",
    "Students come to me for guidance on {focus}; I believe small, consistent steps make a difference.",
    "I support students working through {focus} and help them find routines that fit university life.",
]

QUOTE_TEMPLATES = [
    "Small steps every day lead to big change.",
    "You do not have to face it alone.",
    "Progress matters more than perfection.",
    "Asking for help is a sign of strength.",
    "Every challenge is a chance to grow.",
    "Be patient with yourself — healing takes time.",
    "Your story is still being written.",
    "Courage starts with showing up.",
]


def _session_factory():
    url = make_url(settings.DATABASE_URL)
    if url.port != EXPECTED_DB_PORT:
        print(
            f"ERROR: DATABASE_URL port is {url.port}, expected {EXPECTED_DB_PORT}.",
            file=sys.stderr,
        )
        sys.exit(1)
    engine = create_engine(url)
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _derive_short_name(full_name: str) -> str:
    parts = full_name.split()
    return parts[0] if parts else full_name.strip()


def _derive_initials(full_name: str) -> str:
    parts = [part for part in full_name.split() if part]
    if not parts:
        return "?"
    if len(parts) == 1:
        return parts[0][0].upper()
    return (parts[0][0] + parts[-1][0]).upper()


def _focus_phrase(specialties: list[str]) -> str:
    if len(specialties) == 1:
        return specialties[0].lower()
    return f"{specialties[0].lower()} and {specialties[1].lower()}"


def _generate_unique_full_names(count: int) -> list[str]:
    names: list[str] = []
    used: set[str] = set()
    index = 0
    while len(names) < count:
        first = FIRST_NAMES[index % len(FIRST_NAMES)]
        last = LAST_NAMES[(index // len(FIRST_NAMES)) % len(LAST_NAMES)]
        full_name = f"{first} {last}"
        if full_name not in used:
            used.add(full_name)
            names.append(full_name)
        index += 1
    return names


def _email_from_name(full_name: str, used_emails: set[str]) -> str:
    parts = full_name.split()
    first = parts[0].lower()
    last = parts[-1].lower()
    base = f"{first}.{last}@strathmore.edu"
    email = base
    suffix = 2
    while email in used_emails:
        email = f"{first}.{last}{suffix}@strathmore.edu"
        suffix += 1
    used_emails.add(email)
    return email


def _kenyan_phone(index: int, used_phones: set[str]) -> str:
    prefix = KENYAN_MOBILE_PREFIXES[index % len(KENYAN_MOBILE_PREFIXES)]
    candidate = f"{prefix}{index:06d}"
    if len(candidate) != 10:
        raise ValueError(f"Invalid Kenyan phone length for index {index}: {candidate}")
    digits = candidate[1:] if candidate.startswith("+") else candidate
    if not digits.isdigit() or not 10 <= len(digits) <= 13:
        raise ValueError(f"Phone failed validation rules: {candidate}")
    while candidate in used_phones:
        index += 1
        prefix = KENYAN_MOBILE_PREFIXES[index % len(KENYAN_MOBILE_PREFIXES)]
        candidate = f"{prefix}{index:06d}"
    used_phones.add(candidate)
    return candidate


def _specialties_for_index(index: int) -> list[str]:
    size = 3 if index % 4 == 0 else 2
    ordered = CANONICAL_SPECIALTIES[index:] + CANONICAL_SPECIALTIES[:index]
    return ordered[:size]


def _languages_for_index(index: int) -> list[str]:
    primary = LANGUAGES[index % len(LANGUAGES)]
    if index % 3 == 0:
        secondary = LANGUAGES[(index + 2) % len(LANGUAGES)]
        if secondary != primary:
            return [primary, secondary]
    return [primary]


def reset_user_domain(db) -> None:
    db.execute(
        text(
            """
            UPDATE resources
            SET last_edited_by_id = NULL,
                submitted_by_id = NULL,
                reviewed_by_id = NULL
            WHERE last_edited_by_id IS NOT NULL
               OR submitted_by_id IS NOT NULL
               OR reviewed_by_id IS NOT NULL
            """
        )
    )
    db.execute(text("DELETE FROM promotion_candidates"))
    db.execute(text("DELETE FROM account_approval_requests"))
    db.execute(text("DELETE FROM resource_saves"))
    db.execute(
        text(
            """
            TRUNCATE TABLE
                session_ratings,
                session_requests,
                counsellor_availability_schedule,
                counsellor_profiles,
                user_roles,
                users
            RESTART IDENTITY CASCADE
            """
        )
    )


def seed_panel_users() -> None:
    session_factory = _session_factory()
    db = session_factory()
    hashed_password = utils.hash_password(PANEL_PASSWORD)

    try:
        reset_user_domain(db)

        used_emails: set[str] = set()
        used_phones: set[str] = set()
        full_names = _generate_unique_full_names(USER_COUNT)
        created_users: list[User] = []

        for index, full_name in enumerate(full_names):
            email = _email_from_name(full_name, used_emails)
            phone = _kenyan_phone(index, used_phones)
            user = User(
                email=email,
                password=hashed_password,
                full_name=full_name,
                phone=phone,
                is_verified=True,
                email_verified=True,
            )
            db.add(user)
            db.flush()

            grant_role(db, user_id=user.id, role=UserRole.student, granted_by=None)
            created_users.append(user)

        for index, user in enumerate(created_users[:COUNSELLOR_COUNT]):
            grant_role(db, user_id=user.id, role=UserRole.counsellor, granted_by=None)
            specialties = _specialties_for_index(index)
            profile = CounsellorProfile(
                user_id=user.id,
                short_name=_derive_short_name(user.full_name),
                initials=_derive_initials(user.full_name),
                year=2 + (index % 3),
                program=PROGRAMS[index % len(PROGRAMS)],
                bio=BIO_TEMPLATES[index % len(BIO_TEMPLATES)].format(
                    focus=_focus_phrase(specialties)
                ),
                quote=QUOTE_TEMPLATES[index % len(QUOTE_TEMPLATES)],
                specialties=specialties,
                languages=_languages_for_index(index),
                status=CounsellorProfileStatus.active,
            )
            db.add(profile)
            user.is_verified = True

        db.commit()

        total_users = db.execute(text("SELECT COUNT(*) FROM users")).scalar()
        total_counsellors = db.execute(
            text(
                """
                SELECT COUNT(DISTINCT user_id)
                FROM user_roles
                WHERE role = 'counsellor' AND is_active = true
                """
            )
        ).scalar()
        empty_phone_count = db.execute(
            text(
                """
                SELECT COUNT(*)
                FROM users
                WHERE phone IS NULL OR length(trim(phone)) = 0
                """
            )
        ).scalar()
        phone_column = db.execute(
            text(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'users'
                  AND column_name IN ('phone', 'phone_number')
                """
            )
        ).fetchall()

        print("Panel user seed complete")
        print(f"Database port: {EXPECTED_DB_PORT}")
        print(f"Users table phone columns: {[row[0] for row in phone_column]}")
        print(f"Total users: {total_users}")
        print(f"Total active counsellors (user_roles): {total_counsellors}")
        print(f"Shared test password: {PANEL_PASSWORD}")
        if empty_phone_count == 0:
            print("Phone check: all users have a non-empty phone value")
        else:
            print(f"Phone check: WARNING — {empty_phone_count} users still have null/empty phone")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def main() -> None:
    seed_panel_users()


if __name__ == "__main__":
    main()
