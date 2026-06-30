"""Seed published mental-health resources for student read demos.

Idempotent by ``resources.id``. Translates published articles from the frontend
``mockResources.js`` ``createInitialResources()`` payload (plus one draft and one
pending_review row to verify they stay hidden from student routes).

Usage:
    python -m scripts.seed_resources
"""

from __future__ import annotations

from datetime import datetime, timezone

from app.database import SessionLocal
from app.models import Resource, ResourceCategory, ResourceStatus, User


def _parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _category(value: str) -> ResourceCategory:
    mapping = {
        "Anxiety": ResourceCategory.anxiety,
        "Depression": ResourceCategory.depression,
        "Stress": ResourceCategory.stress,
        "Academic Focus": ResourceCategory.academic_focus,
        "Self-Care": ResourceCategory.self_care,
        "Relationships": ResourceCategory.relationships,
    }
    return mapping[value]


def _resource_rows() -> list[dict]:
    return [
        {
            "id": "featured-exam-stress",
            "slug": "featured-exam-stress",
            "title": "Navigating Exam Stress with Mindfulness",
            "category": "Stress",
            "description": (
                "Practical techniques to stay grounded during the most demanding weeks "
                "of the semester. Learn how five minutes of breathing can transform your focus."
            ),
            "read_time": "8 min read",
            "author": "Dr. Amina Wanjiru",
            "author_role": "Lead Counsellor, SU Wellbeing Centre",
            "image": (
                "https://lh3.googleusercontent.com/aida-public/AB6AXuC1vTDSBSzDeznTLOEpj0OtMBEt06_64W4stn_SIhfIGbyLAhidO3h8qaltQWgxHvJniZEjyT1lDCspumuZD4BmbZuSkHtGLDXKXSC9_DxDxQohxVdi2etEZmFgi0slnf9KQsRRSIPpuzdxqJp1UR1TPGLU4C2U4ssY9dxbyHW0LCL-BXXd_CBujhmVR-rVQjJ_KRxFAQ-deIl8QCPmNRo0vW8UEHQXaQMK8WLyhBI6hKyTb2sXLNU6iYnv_uS0lGIashcFNcWI6qc"
            ),
            "image_alt": (
                "A serene sunlit library interior with large windows overlooking a peaceful garden."
            ),
            "body": [
                "Exam season at Strathmore can feel relentless. Between back-to-back papers, group projects, and the pressure to perform, it's easy to lose sight of your wellbeing.",
                "Mindfulness doesn't require an hour of meditation. Start with five minutes of box breathing before you open your notes: inhale for four counts, hold for four, exhale for four, hold for four.",
                "Pair breathing with a simple grounding ritual — a cup of tea, a short walk around campus, or writing three things you're grateful for before studying.",
                "Remember: your worth is not defined by a single grade. Reach out to a peer counsellor if stress starts to feel unmanageable.",
            ],
            "status": ResourceStatus.published,
            "featured": True,
            "featured_order": 1,
            "published_at": "2026-05-12T09:00:00.000Z",
            "created_at": "2026-05-01T09:00:00.000Z",
            "updated_at": "2026-05-12T09:00:00.000Z",
            "views": 1240,
            "saves": 452,
        },
        {
            "id": "nighttime-sleep-routine",
            "slug": "nighttime-sleep-routine",
            "title": "Creating a Nighttime Routine for Better Sleep",
            "category": "Self-Care",
            "description": (
                "Consistent sleep is the foundation of mental clarity. Discover rituals "
                "to disconnect from screens and rest deeply."
            ),
            "read_time": "5 min read",
            "author": "Brian Otieno",
            "author_role": "Peer Counsellor, PeerPoint",
            "image": (
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAN5jWl_rP_bvEcHNJI_NLrsJig7ibJcDkuKnK0NkCxHYpusEbQTcl50B4TArKz-JjxXAbAqIxrXpWPEE_62TrQmohFCPX-EYK8qjAOn7OV8Fz7XsxNgRCZqisg5CCjhpnBolOubJc1j-zDHVFCCMvKHSnPPGahcqBemV2vhb3fAVIIcTaG-CpRbBbr-OmYUdfafVEMYjq0fQnOsXHQx9XluDFVC7NSW-RORpe9hnrpagr1OgjlyYuY7o7lJQghiAaXBSax_gXWJcA"
            ),
            "image_alt": (
                "A minimalist workspace with a journal, a small plant, and a steaming cup of tea."
            ),
            "body": [
                "Sleep is when your brain consolidates what you learned during the day. Skimping on rest makes everything harder — focus, mood, and memory all suffer.",
                "Try a digital sunset: put your phone on charge in another corner of the room at least 30 minutes before bed.",
                "Build a short wind-down sequence — dim lights, light stretching, journaling three lines about tomorrow's top priority.",
                "Consistency matters more than perfection. Even shifting your bedtime by 15 minutes earlier each week can make a noticeable difference.",
            ],
            "status": ResourceStatus.published,
            "featured": True,
            "featured_order": 2,
            "published_at": "2026-04-28T09:00:00.000Z",
            "created_at": "2026-04-20T09:00:00.000Z",
            "updated_at": "2026-04-28T09:00:00.000Z",
            "views": 856,
            "saves": 289,
        },
        {
            "id": "supporting-friend-in-distress",
            "slug": "supporting-friend-in-distress",
            "title": "Supporting a Friend in Distress",
            "category": "Relationships",
            "description": (
                "How to listen actively and provide meaningful support without becoming overwhelmed yourself."
            ),
            "read_time": "6 min read",
            "author": "Grace Njeri",
            "author_role": "Peer Counsellor, PeerPoint",
            "image": (
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCcXeSQkAkDsRZ7te_zl0gK2WEG3FEA9JH4ifOBU9M0n84_ARQwBajQN6x2tN7IeFGYY11rMdrYba3GGRLGL5YxDApnLHdyt6yKOyvaSz5vtfXNIp42d1trXTRpweBdGm3OJGCeWHPIeQbDkRtn1K8druLpEABFh12tzh1a2UnMOxo4bLvrb_02d03Jq6hDHfBRxuI1YDejFntcsXAO1lyONnKvHySTS2jDICUDHr5yYLHrSpIc3Sansc3Fxp3XVl7vQFtv3J4Q7WA"
            ),
            "image_alt": (
                "Two university students in supportive conversation in a brightly lit common area."
            ),
            "body": [
                "When a friend opens up about distress, your first job is to listen — not to fix.",
                "Use reflective phrases: 'That sounds really hard' or 'I'm glad you told me.' Avoid jumping to advice unless they ask for it.",
                "Know your limits. You can be a caring friend without being their only support. Encourage professional help when needed.",
                "Take care of yourself too. Supporting someone in crisis can be emotionally heavy — debrief with a counsellor if you need to.",
            ],
            "status": ResourceStatus.published,
            "featured": False,
            "featured_order": None,
            "published_at": "2026-04-19T09:00:00.000Z",
            "created_at": "2026-04-10T09:00:00.000Z",
            "updated_at": "2026-04-19T09:00:00.000Z",
            "views": 980,
            "saves": 312,
        },
        {
            "id": "panic-attack-grounding",
            "slug": "panic-attack-grounding",
            "title": "Panic Attack SOS: Grounding Techniques",
            "category": "Anxiety",
            "description": (
                "Immediate, evidence-based steps to manage physical symptoms of anxiety in public spaces."
            ),
            "read_time": "4 min read",
            "author": "Dr. Amina Wanjiru",
            "author_role": "Lead Counsellor, SU Wellbeing Centre",
            "image": (
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAAeSU6b18ZOp29tVXKc9fqZjphWdp6qumT4elvkpWk3l7ibVc8N--63Z-8Dn5Kj3t4Dls4sMJ8lv8Y66KGLoIxaP7wBOisewBQ160KHR0JMgON11KYz5n-bir7Sbb_kE4sk7pqpqOAfzDFnjVHk7ycSyS_Db5fbMmX_mFhQyXPzs3FnEZi6FSD6FNhGInrLn306Wu_OFJ6nOnnn_9n65RHQYkRBZn-yCKSL5YbPOwy8Sn88QzWyFZk3R4QKD9M8MG8Elfsp3mer1s"
            ),
            "image_alt": (
                "A peaceful meditation studio with soft morning light and a teal yoga mat."
            ),
            "body": [
                "Panic attacks are frightening but not dangerous. Your body is flooding with adrenaline — it will pass, usually within 10–20 minutes.",
                "Try the 5-4-3-2-1 technique: name five things you see, four you hear, three you can touch, two you smell, and one you taste.",
                "Slow your breathing deliberately. Longer exhales than inhales signal safety to your nervous system.",
                "If panic attacks are recurring, book a session with a peer counsellor to build a personalised coping plan.",
            ],
            "status": ResourceStatus.published,
            "featured": False,
            "featured_order": None,
            "published_at": "2026-04-10T09:00:00.000Z",
            "created_at": "2026-04-01T09:00:00.000Z",
            "updated_at": "2026-04-10T09:00:00.000Z",
            "views": 740,
            "saves": 210,
        },
        {
            "id": "understanding-low-mood",
            "slug": "understanding-low-mood",
            "title": "Understanding Low Mood and Depression",
            "category": "Depression",
            "description": (
                "Recognise the signs of persistent low mood and learn when to reach out for professional support on campus."
            ),
            "read_time": "7 min read",
            "author": "Dr. Samuel Kariuki",
            "author_role": "Clinical Psychologist, SU Wellbeing Centre",
            "image": (
                "https://lh3.googleusercontent.com/aida-public/AB6AXuA_0PV1bDE1y2FS_aaGF8mMP2IR4N-AUiTw9f7t0Eft6h2925k13Cs1kh_J6t-GuELqPOecr5xfytSeyiBq8q9oiT6Tf3CH2CuXPpq1TYJ5nW7L1UMqPBSzKQOpIfO7boaY5PVMfqEgoPJhsjHQw8DgR7Zi2yyJxDrjHZClej-PLhj2hvcmKjmFNhw03EF_PIkCAsLknFCQXVm_T8w8wC0eUZAZ2Z6L13VOK8Q6NOkV93icGSpfIu_AI71LmYrB3ecAWr4AcRQ5Kg8"
            ),
            "image_alt": "A calm desk scene with an open journal and soft natural light.",
            "body": [
                "Low mood is more than a bad day. When sadness, fatigue, or loss of interest persist for two weeks or more, it's worth paying attention.",
                "Common signs include withdrawing from friends, struggling to attend lectures, or feeling hopeless about the future.",
                "Peer support helps, but depression often benefits from professional intervention. Strathmore's counselling services are confidential.",
                "Small steps count: one shower, one meal, one message to someone you trust. You don't have to do it all at once.",
            ],
            "status": ResourceStatus.published,
            "featured": False,
            "featured_order": None,
            "published_at": "2026-03-30T09:00:00.000Z",
            "created_at": "2026-03-20T09:00:00.000Z",
            "updated_at": "2026-03-30T09:00:00.000Z",
            "views": 620,
            "saves": 198,
        },
        {
            "id": "exam-season-focus",
            "slug": "exam-season-focus",
            "title": "Staying Focused During Exam Season",
            "category": "Academic Focus",
            "description": (
                "Build sustainable study habits that protect your wellbeing while meeting academic deadlines."
            ),
            "read_time": "6 min read",
            "author": "Brian Otieno",
            "author_role": "Peer Counsellor, PeerPoint",
            "image": (
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAajAnjD-DH_nDYYqSahNTTPhdo52Ub3qOmNlYmhc3J-3hIFHqTvYaqRzZ0KrefALO_xYE7om6J1MfSiF0ULEgRE4zHbt8lGnotNegiee8f8K--tr0tKY4HWb_7wwG59tESEp5NT9toCv8thFjV60dlCftvhWt2ZY4nuh6kBk7hKrVXjujWWoq6xeIFdG68IGFwdBs94QdSxy-2I0MGjNW0UglA3StntQPzyKK4wiUw2xVgmdyDpHqX6b2swxdOw7gTWkmNQNb3ryE"
            ),
            "image_alt": "A serene landscape with soft morning light over calm hills.",
            "body": [
                "Exam season rewards consistency over cramming. Block study sessions in 45-minute chunks with 10-minute breaks.",
                "Protect your basics: sleep, meals, and movement. Sacrificing all three for extra study hours usually backfires.",
                "Use a weekly review every Sunday — what's due, what's started, and what can wait until after exams.",
                "If perfectionism is driving burnout, talk to a peer counsellor about setting kinder expectations for yourself.",
            ],
            "status": ResourceStatus.published,
            "featured": False,
            "featured_order": None,
            "published_at": "2026-03-22T09:00:00.000Z",
            "created_at": "2026-03-15T09:00:00.000Z",
            "updated_at": "2026-03-22T09:00:00.000Z",
            "views": 540,
            "saves": 175,
        },
        {
            "id": "five-minute-mindfulness",
            "slug": "five-minute-mindfulness",
            "title": "Five-Minute Mindfulness Reset",
            "category": "Self-Care",
            "description": (
                "A quick guided practice you can use between lectures to recentre and release tension."
            ),
            "read_time": "3 min read",
            "author": "Grace Njeri",
            "author_role": "Peer Counsellor, PeerPoint",
            "image": (
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAAeSU6b18ZOp29tVXKc9fqZjphWdp6qumT4elvkpWk3l7ibVc8N--63Z-8Dn5Kj3t4Dls4sMJ8lv8Y66KGLoIxaP7wBOisewBQ160KHR0JMgON11KYz5n-bir7Sbb_kE4sk7pqpqOAfzDFnjVHk7ycSyS_Db5fbMmX_mFhQyXPzs3FnEZi6FSD6FNhGInrLn306Wu_OFJ6nOnnn_9n65RHQYkRBZn-yCKSL5YbPOwy8Sn88QzWyFZk3R4QKD9M8MG8Elfsp3mer1s"
            ),
            "image_alt": "A yoga mat unrolled in a bright, peaceful room.",
            "body": [
                "You don't need a silent room or 30 minutes. A mindfulness reset can happen between lectures in five minutes.",
                "Sit comfortably, close your eyes, and focus on the sensation of breath at your nostrils.",
                "When your mind wanders — and it will — gently return to the breath without judging yourself.",
                "Practice daily for a week and notice whether your baseline stress feels even slightly lower.",
            ],
            "status": ResourceStatus.published,
            "featured": False,
            "featured_order": None,
            "published_at": "2026-03-15T09:00:00.000Z",
            "created_at": "2026-03-10T09:00:00.000Z",
            "updated_at": "2026-03-15T09:00:00.000Z",
            "views": 410,
            "saves": 142,
        },
        {
            "id": "social-anxiety-campus-draft",
            "slug": "social-anxiety-campus-draft",
            "title": "Managing Social Anxiety on Campus",
            "category": "Anxiety",
            "description": (
                "Practical strategies for navigating social situations, group work, and campus events when anxiety feels overwhelming."
            ),
            "read_time": "6 min read",
            "author": "Dr. Anne Kiama",
            "author_role": "SU Wellbeing Centre",
            "image": (
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAAeSU6b18ZOp29tVXKc9fqZjphWdp6qumT4elvkpWk3l7ibVc8N--63Z-8Dn5Kj3t4Dls4sMJ8lv8Y66KGLoIxaP7wBOisewBQ160KHR0JMgON11KYz5n-bir7Sbb_kE4sk7pqpqOAfzDFnjVHk7ycSyS_Db5fbMmX_mFhQyXPzs3FnEZi6FSD6FNhGInrLn306Wu_OFJ6nOnnn_9n65RHQYkRBZn-yCKSL5YbPOwy8Sn88QzWyFZk3R4QKD9M8MG8Elfsp3mer1s"
            ),
            "image_alt": "Students walking together on a university campus pathway.",
            "body": [
                "Social anxiety is common among students adjusting to university life. You're not alone, and small steps can make gatherings feel more manageable.",
                "Prepare conversation openers before events — a question about coursework or a club activity can ease the pressure to improvise.",
                "It's okay to step outside for a breather. Excusing yourself briefly is a valid coping strategy, not a failure.",
            ],
            "status": ResourceStatus.draft,
            "featured": False,
            "featured_order": None,
            "published_at": None,
            "created_at": "2026-06-01T09:00:00.000Z",
            "updated_at": "2026-06-10T09:00:00.000Z",
            "views": 0,
            "saves": 0,
        },
        {
            "id": "sleep-hygiene-students",
            "slug": "sleep-hygiene-students",
            "title": "Sleep Hygiene for Students",
            "category": "Self-Care",
            "description": (
                "Evidence-based habits to protect your rest during busy semesters — from screen boundaries to wind-down rituals."
            ),
            "read_time": "6 min read",
            "author": "Jane Doe",
            "author_role": "Peer Counsellor, PeerPoint",
            "image": (
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAN5jWl_rP_bvEcHNJI_NLrsJig7ibJcDkuKnK0NkCxHYpusEbQTcl50B4TArKz-JjxXAbAqIxrXpWPEE_62TrQmohFCPX-EYK8qjAOn7OV8Fz7XsxNgRCZqisg5CCjhpnBolOubJc1j-zDHVFCCMvKHSnPPGahcqBemV2vhb3fAVIIcTaG-CpRbBbr-OmYUdfafVEMYjq0fQnOsXHQx9XluDFVC7NSW-RORpe9hnrpagr1OgjlyYuY7o7lJQghiAaXBSax_gXWJcA"
            ),
            "image_alt": "A calm bedroom desk with a journal and soft lamp light.",
            "body": [
                "Sleep is the foundation of focus, mood, and memory. During exam season, sacrificing rest often feels necessary — but it usually makes everything harder.",
                "Try a digital sunset: charge your phone away from your bed at least 30 minutes before sleep.",
                "Build a short wind-down sequence — dim lights, light stretching, and writing tomorrow's top priority in a notebook.",
            ],
            "status": ResourceStatus.pending_review,
            "featured": False,
            "featured_order": None,
            "published_at": None,
            "created_at": "2026-06-15T09:00:00.000Z",
            "updated_at": "2026-06-18T14:00:00.000Z",
            "submitted_at": "2026-06-18T14:00:00.000Z",
            "views": 0,
            "saves": 0,
            "submitted_by_email": "counsellor@strathmore.edu",
        },
    ]


def seed_resources() -> None:
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@strathmore.edu").first()
        counsellor = (
            db.query(User).filter(User.email == "counsellor@strathmore.edu").first()
        )

        seeded = 0
        for row in _resource_rows():
            existing = db.query(Resource).filter(Resource.id == row["id"]).first()
            category = _category(row["category"])
            submitted_by_id = None
            if row.get("submitted_by_email") and counsellor is not None:
                submitted_by_id = counsellor.id

            values = {
                "slug": row["slug"],
                "title": row["title"],
                "category": category,
                "description": row["description"],
                "read_time": row["read_time"],
                "author": row["author"],
                "author_role": row["author_role"],
                "image": row["image"],
                "image_alt": row["image_alt"],
                "body": row["body"],
                "status": row["status"],
                "featured": row["featured"],
                "featured_order": row["featured_order"],
                "published_at": _parse_dt(row.get("published_at")),
                "created_at": _parse_dt(row["created_at"]) or datetime.now(timezone.utc),
                "updated_at": _parse_dt(row["updated_at"]) or datetime.now(timezone.utc),
                "last_edited_by_id": admin.id if admin is not None else None,
                "submitted_by_id": submitted_by_id,
                "submitted_at": _parse_dt(row.get("submitted_at")),
                "views": row["views"],
                "saves": row["saves"],
            }

            if existing is None:
                db.add(Resource(id=row["id"], **values))
                seeded += 1
            else:
                for key, value in values.items():
                    setattr(existing, key, value)

        db.commit()
        print(f"Resource seed complete ({seeded} inserted, {len(_resource_rows())} total rows upserted)")
    finally:
        db.close()


def main() -> None:
    seed_resources()


if __name__ == "__main__":
    main()
