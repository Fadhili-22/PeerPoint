"""Bulk-seed demo counsellor and student accounts (100 each).

Idempotent by email: re-run updates existing rows in place.

Usage (from backend/ with venv active):
    python -m scripts.seed_demo_data
"""

from __future__ import annotations

import time
from collections import Counter

from app import utils
from app.database import SessionLocal
from app.models import User, UserRole
from app.services.user_roles import ensure_counsellor_profile, grant_role
from scripts.seed_counsellor import configure_always_available

DEMO_PASSWORD = "Demo1234!"
COUNSELLOR_COUNT = 100
STUDENT_COUNT = 100
BATCH_SIZE = 20

# Verbatim from frontend/src/constants/counsellorFilters.js
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

COUNSELLOR_FIRST_NAMES = [
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
]

COUNSELLOR_SURNAMES = [
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
]

STUDENT_FIRST_NAMES = [
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

STUDENT_SURNAMES = [
    "Macharia",
    "Atieno",
    "Kiptoo",
    "Nyongesa",
    "Wairimu",
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
    "Wanjala",
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


def _focus_phrase(specialties: list[str]) -> str:
    if len(specialties) == 1:
        return specialties[0].lower()
    return f"{specialties[0].lower()} and {specialties[1].lower()}"


def _generate_full_names(
    first_names: list[str],
    surnames: list[str],
    count: int,
    *,
    pair_offset: int = 0,
) -> list[str]:
    names: list[str] = []
    used: set[str] = set()
    index = pair_offset
    while len(names) < count:
        first = first_names[index % len(first_names)]
        last = surnames[(index // len(first_names) + pair_offset) % len(surnames)]
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


def _build_specialty_assignments(count: int) -> list[list[str]]:
    """Assign 2-3 specialties per counsellor with roughly even coverage."""
    specialty_counts = Counter({specialty: 0 for specialty in CANONICAL_SPECIALTIES})
    assignments: list[list[str]] = []

    for index in range(count):
        target_size = 3 if index % 5 == 0 else 2
        ordered = sorted(CANONICAL_SPECIALTIES, key=lambda s: specialty_counts[s])
        picked: list[str] = []
        for specialty in ordered:
            if len(picked) >= target_size:
                break
            if specialty not in picked:
                picked.append(specialty)
                specialty_counts[specialty] += 1
        assignments.append(picked)

    return assignments


def _languages_for_index(index: int) -> list[str]:
    primary = LANGUAGES[index % len(LANGUAGES)]
    if index % 3 == 0:
        secondary = LANGUAGES[(index + 2) % len(LANGUAGES)]
        if secondary != primary:
            return [primary, secondary]
    return [primary]


def _build_counsellor_rows() -> list[dict]:
    used_emails: set[str] = set()
    full_names = _generate_full_names(
        COUNSELLOR_FIRST_NAMES,
        COUNSELLOR_SURNAMES,
        COUNSELLOR_COUNT,
        pair_offset=0,
    )
    specialty_assignments = _build_specialty_assignments(COUNSELLOR_COUNT)

    rows: list[dict] = []
    for index, full_name in enumerate(full_names):
        specialties = specialty_assignments[index]
        rows.append(
            {
                "email": _email_from_name(full_name, used_emails),
                "full_name": full_name,
                "specialties": specialties,
                "bio": BIO_TEMPLATES[index % len(BIO_TEMPLATES)].format(
                    focus=_focus_phrase(specialties)
                ),
                "quote": QUOTE_TEMPLATES[index % len(QUOTE_TEMPLATES)],
                "program": PROGRAMS[index % len(PROGRAMS)],
                "languages": _languages_for_index(index),
            }
        )
    return rows


def _build_student_rows() -> list[dict]:
    used_emails: set[str] = set()
    full_names = _generate_full_names(
        STUDENT_FIRST_NAMES,
        STUDENT_SURNAMES,
        STUDENT_COUNT,
        pair_offset=7,
    )
    return [
        {
            "email": _email_from_name(full_name, used_emails),
            "full_name": full_name,
        }
        for full_name in full_names
    ]


def _upsert_counsellor(
    db,
    row: dict,
    hashed_password: str,
) -> str:
    user = db.query(User).filter(User.email == row["email"]).first()
    created = user is None

    if user is None:
        user = User(
            email=row["email"],
            password=hashed_password,
            full_name=row["full_name"],
            role=UserRole.counsellor,
            is_verified=True,
            email_verified=True,
        )
        db.add(user)
        db.flush()
    else:
        user.is_verified = True
        user.email_verified = True
        user.password = hashed_password
        user.full_name = row["full_name"]

    grant_role(db, user_id=user.id, role=UserRole.student, granted_by=None)
    grant_role(db, user_id=user.id, role=UserRole.counsellor, granted_by=None)

    profile = ensure_counsellor_profile(db, user)
    db.flush()
    configure_always_available(db, profile)

    profile.specialties = row["specialties"]
    profile.bio = row["bio"]
    profile.quote = row["quote"]
    profile.program = row["program"]
    profile.languages = row["languages"]

    user.role = UserRole.counsellor
    return "created" if created else "updated"


def _upsert_student(
    db,
    row: dict,
    hashed_password: str,
) -> str:
    user = db.query(User).filter(User.email == row["email"]).first()
    created = user is None

    if user is None:
        user = User(
            email=row["email"],
            password=hashed_password,
            full_name=row["full_name"],
            role=UserRole.student,
            is_verified=True,
            email_verified=True,
        )
        db.add(user)
        db.flush()
    else:
        user.is_verified = True
        user.email_verified = True
        user.password = hashed_password
        user.full_name = row["full_name"]

    grant_role(db, user_id=user.id, role=UserRole.student, granted_by=None)
    user.role = UserRole.student
    return "created" if created else "updated"


def seed_demo_data() -> None:
    started = time.perf_counter()
    hashed_password = utils.hash_password(DEMO_PASSWORD)

    counsellor_rows = _build_counsellor_rows()
    student_rows = _build_student_rows()

    counsellor_stats = {"created": 0, "updated": 0}
    student_stats = {"created": 0, "updated": 0}
    specialty_distribution: Counter[str] = Counter()

    db = SessionLocal()
    try:
        for index, row in enumerate(counsellor_rows, start=1):
            outcome = _upsert_counsellor(db, row, hashed_password)
            counsellor_stats[outcome] += 1
            specialty_distribution.update(row["specialties"])
            if index % BATCH_SIZE == 0:
                db.commit()

        for index, row in enumerate(student_rows, start=1):
            outcome = _upsert_student(db, row, hashed_password)
            student_stats[outcome] += 1
            if index % BATCH_SIZE == 0:
                db.commit()

        db.commit()
    finally:
        db.close()

    elapsed = time.perf_counter() - started
    print("Demo seed complete")
    print(
        f"Counsellors: {counsellor_stats['created']} created, "
        f"{counsellor_stats['updated']} updated"
    )
    print(
        f"Students: {student_stats['created']} created, "
        f"{student_stats['updated']} updated"
    )
    print("Specialty distribution:")
    for specialty in CANONICAL_SPECIALTIES:
        print(f"  {specialty}: {specialty_distribution[specialty]}")
    print(f"Elapsed: {elapsed:.2f}s")


def main() -> None:
    seed_demo_data()


if __name__ == "__main__":
    main()
