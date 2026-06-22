"""Canonical counsellor availability vocabulary and helpers.

The frontend audit (§5.4) references a fixed `timeSlotOptions` palette defined in
`mockCounsellorAvailability.js`, but that file does not live in this backend repo,
so the exact strings are NOT reproduced here verbatim. `TIME_SLOT_OPTIONS` below is
the backend's canonical palette and MUST be confirmed against the real frontend file
before launch (see description.md). Availability writes are validated against it so
free-form times can never be persisted.
"""

from datetime import date

# Canonical, hourly business-hours palette (Strathmore peer-counselling hours).
# FLAG: confirm against frontend mockCounsellorAvailability.js timeSlotOptions.
TIME_SLOT_OPTIONS: tuple[str, ...] = (
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
)

TIME_SLOT_OPTIONS_SET: frozenset[str] = frozenset(TIME_SLOT_OPTIONS)

# Weekdays use the JavaScript Date.getDay() convention (Sunday = 0 ... Saturday = 6),
# matching the frontend's `weeklySlots: { [dayOfWeek: 0-6]: ... }` keys.
# FLAG: confirm Sunday=0 vs Monday=0 against the frontend.
MIN_DAY_OF_WEEK = 0
MAX_DAY_OF_WEEK = 6


def js_day_of_week(value: date) -> int:
    """Return the JS getDay() weekday (Sunday=0) for a date.

    Python's date.weekday() is Monday=0; this converts to the frontend convention.
    """
    return (value.weekday() + 1) % 7


def invalid_slots(slots: list[str]) -> list[str]:
    """Return any submitted slot strings that are not in the canonical palette."""
    return [slot for slot in slots if slot not in TIME_SLOT_OPTIONS_SET]


def get_bookable_slots_for_date(
    profile,
    target_date: date,
    *,
    today: date | None = None,
) -> list[str]:
    """Return bookable slot strings for a date (audit §6.4).

    Past dates, dates in ``unavailable_dates``, and weekdays with no enabled
    schedule row all yield an empty list — the same rules as
    ``GET /counsellors/{id}/slots``.
    """
    today = today if today is not None else date.today()
    if target_date < today:
        return []

    if target_date.isoformat() in profile.unavailable_dates:
        return []

    weekday = js_day_of_week(target_date)
    row = next(
        (
            r
            for r in profile.availability_schedule
            if r.day_of_week == weekday and r.enabled
        ),
        None,
    )
    if row is None or not row.slots:
        return []

    return list(row.slots)
