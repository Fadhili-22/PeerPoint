# PeerPoint Backend — Implementation Learning Log

> This file is a permanent, append-only learning log. Each entry explains the
> *reasoning* behind a slice of work (not just a changelog) so a non-author can
> stand in front of a panel and defend why the backend behaves the way it does.

---

## Prompt 1 — Counsellor Profile Provisioning + Self-Edit + Public/Student Read + Availability

### What this prompt was

The counsellor area of the backend was "schema-and-signature complete, logic-empty":
the models and Pydantic contracts existed and were internally consistent, but every
route handler was a typed stub raising `NotImplementedError`. This prompt fills in
real handler bodies for the public landing carousel, the student-facing counsellor
directory/profile/availability reads, the counsellor self-service profile and
availability-management endpoints, and the availability-status toggle. It also adds
two pieces of new surface — a counsellor self-edit profile endpoint and
default-profile-creation on promotion — plus one schema/type change (`rating`) and
its migration.

Everything was built on the **existing** models/schemas (no parallel or duplicate
types were introduced) and uses **absolute imports** throughout, per `cursorrules` §2.

### Endpoint-by-endpoint: what it does and why

**`GET /public/counsellors/featured`** (`app/routers/public.py`, unauthenticated)
- Returns active counsellor profiles whose `availability_status` matches the `status`
  query param (default `available`), capped at `limit`, mapped to `CounsellorCard`
  using exactly the carousel's fields (`id`, `short_name`, `initials`, `photo_url`,
  `specialties`, `bio`, `availability_note`) — `frontend_audit.md` §5.1.
- Only profiles with `status == active` are eligible. An empty result is an empty
  list, never an error — the frontend renders an empty state (§5.1, §6.4).
- `id` is `users.id` (identity contract §4 — see below).
- `GET /public/stats` was left as the existing stub: it aggregates platform-wide
  counts beyond counsellors and is explicitly out of scope (task §5).

**`GET /counsellors`** (`app/routers/counsellors.py`, `require_student`)
- Lists active counsellors with filters from audit §5.2: `search` (matches full name,
  short name, and specialties), `availability` (status enum), `specialties[]`
  (any-match via Postgres array `&&` overlap), `language` (array membership), and
  `year` (2–4).
- Specialties use *any-match* because the directory filter chips are inclusive ("show
  me anyone who does X *or* Y"), which matches the audit's filter-chip UX.

**`GET /counsellors/{counsellor_id}`** (`require_student`)
- Returns `CounsellorProfileDetail`. `weekly_availability_summary` is a per-weekday
  **slot count** map (`{"0": 2, "1": 0, ...}`) derived from the normalized schedule
  rows — audit §9 risk #16 ("profile shows slot *counts* per weekday", distinct from
  the booking view that shows actual time strings). All 7 weekdays are present so the
  frontend never has to guess at missing keys.

**`GET /counsellors/{counsellor_id}/availability`** (`require_student`)
- Returns `weekly_slots` keyed by `day_of_week` (0–6) → slot list (enabled, non-empty
  rows only), plus `unavailable_dates` and `is_online` from the profile.

**`GET /counsellors/{counsellor_id}/slots?date=YYYY-MM-DD`** (`require_student`)
- Returns the bookable slots for that date's weekday. Per audit §6.4: **past dates
  return an empty list**, dates in `unavailable_dates` return an empty list, and a
  weekday with no enabled schedule row returns an empty list. This is the server-side
  enforcement of the booking rules the frontend currently only checks client-side.

**`GET /counsellor/me/profile` + `PUT /counsellor/me/profile`** (NEW,
`app/routers/counsellor_profile.py`, `require_active_counsellor`)
- `GET` returns the caller's own profile including system/admin-owned fields so the
  dashboard can *display* (but not edit) them.
- `PUT` updates **self-editable fields only**: `short_name`, `bio`, `quote`,
  `specialties`, `languages`, `photo_url`, `program`, `response_time`,
  `availability_note`. The request schema (`CounsellorProfileSelfUpdate`) physically
  does not contain the admin/system-owned fields (`rating`, `sessions_count`,
  `status`, `year`, `availability_status`, `is_online`), so a counsellor cannot
  escalate by sending them — this is an integrity decision in the spirit of
  `cursorrules` §4.2 (author/role fields locked from the counsellor side) and §4.3
  (additive/least-privilege instincts). Unset fields are left untouched
  (`exclude_unset`).

**`GET /counsellor/me/availability` + `PUT /counsellor/me/availability`**
(`app/routers/counsellor_availability.py`, `require_active_counsellor`)
- `GET` returns the stored weekday rows + `is_online`.
- `PUT` upserts the submitted weekday rows and sets `is_online`. Every submitted slot
  string is validated against the canonical `TIME_SLOT_OPTIONS` palette (audit §5.4);
  out-of-palette values and duplicate weekday entries are rejected with **422**. Free-
  form times are never persisted.
- **Safety:** writes are scoped strictly to the caller's own `profile.id` via the
  UNIQUE `(counsellor_id, day_of_week)` constraint, so a PUT can only ever overwrite
  the caller's own rows — it can never touch another counsellor's schedule.

**`PATCH /counsellor/me/availability-status`** (`app/routers/counsellor_sessions.py`,
`require_active_counsellor`)
- Implemented **only** this handler in that file; the session-request handlers were
  left as stubs (out of scope, Prompt 2 — task §5).
- Complete mapping: `is_available: true` → `availability_status = available` **and**
  `is_online = true`; `false` → `availability_status = offline` **and**
  `is_online = false`. It deliberately never writes `busy` / `busy_until` (task §3/§5
  — there is no product rule yet for when a counsellor is "busy").

**Default profile on promotion** (`app/services/user_roles.py`,
`app/routers/admin.py`)
- `grant_counsellor_role` now creates a default `CounsellorProfile` in the **same
  transaction** as the role grant, via the new idempotent `ensure_counsellor_profile`
  helper. Re-promotion does not create a second profile (honors the UNIQUE `user_id`).
- The promotion route's authorization and additive role-grant behavior are unchanged
  (`cursorrules` §3/§4.1) — only profile provisioning was added underneath.
- The previously inaccurate message ("Counsellor profile setup remains to be
  completed.") was updated to reflect that a default profile is now created.

### `rating` Integer → decimal (task §3)

- `CounsellorProfile.rating` changed from `Integer` to **`Numeric(2,1)`** because the
  frontend renders one decimal place (e.g. `4.9`); an integer can't represent the real
  domain. `Numeric(2,1)` holds 0.0–9.9, comfortably covering the 0.0–5.0 range.
- Pydantic schemas that typed `rating` (`CounsellorDirectoryItem`,
  `CounsellorProfileDetail`, `AdminCounsellorItem`, new `CounsellorOwnProfile`) changed
  from `int` to `float`. Handlers pass `float(profile.rating)` so JSON is clean.
- New migration `alembic/versions/003_counsellor_rating_decimal.py`
  (`revision="003_rating_decimal"`, `down_revision="002_user_roles"`) alters the column
  type with `USING rating::numeric(2,1)`, and `downgrade()` reverses it with
  `round(rating)::integer`.

### Files touched (one line each)

- `app/models.py` — `rating` column → `Numeric(2,1)` (+ `Numeric` import).
- `app/schemas/counsellor.py` — `rating` int→float; added `CounsellorOwnProfile` and
  `CounsellorProfileSelfUpdate`.
- `app/schemas/__init__.py` — exported the two new counsellor schemas.
- `app/services/availability.py` — NEW: `TIME_SLOT_OPTIONS` palette, weekday-convention
  helper, slot validator.
- `app/routers/public.py` — implemented featured carousel; left `/public/stats` stub.
- `app/routers/counsellors.py` — implemented directory list, profile detail,
  availability, and slots reads.
- `app/routers/counsellor_profile.py` — NEW: counsellor self-service profile GET/PUT.
- `app/routers/counsellor_availability.py` — implemented availability GET/PUT (with
  palette validation + per-counsellor-scoped upsert).
- `app/routers/counsellor_sessions.py` — implemented ONLY the availability-status PATCH.
- `app/services/user_roles.py` — default-profile-on-promotion (idempotent) + derivation
  helpers.
- `app/routers/admin.py` — corrected the promotion response message.
- `app/main.py` — registered the new `counsellor_profile` router.
- `alembic/versions/003_counsellor_rating_decimal.py` — NEW migration for the rating
  type change.

---

## ⚠️ Unspecified judgment calls — PLEASE CONFIRM

1. **`TIME_SLOT_OPTIONS` exact values** (`app/services/availability.py`). The audit
   references `timeSlotOptions` but the real values live in the frontend's
   `mockCounsellorAvailability.js`, which is **not in this repo**. I chose an hourly
   business-hours palette:
   `8:00 AM, 9:00 AM, 10:00 AM, 11:00 AM, 12:00 PM, 1:00 PM, 2:00 PM, 3:00 PM,
   4:00 PM, 5:00 PM, 6:00 PM`.
   **Confirm this list against the real frontend file** — availability PUT validation
   rejects anything not in it, so a mismatch would reject legitimate frontend
   submissions.

2. **Weekday convention (Sunday=0 vs Monday=0)** (`app/services/availability.py`). The
   normalized schedule uses `day_of_week` 0–6 but the audit never states the origin.
   I used the **JavaScript `Date.getDay()` convention (Sunday=0 … Saturday=6)** to
   match the frontend's `weeklySlots: { [dayOfWeek: 0-6] }` keys, and convert Python's
   `date.weekday()` (Monday=0) accordingly in `js_day_of_week`. Confirm the frontend
   actually keys on Sunday=0; if it's Monday=0, only this one helper needs to change.

3. **Default `short_name` / `initials` / `year` at promotion**
   (`app/services/user_roles.py`). `CounsellorProfile` has three NOT NULL columns with
   no natural promotion-time value:
   - `short_name` = first token of `full_name` (e.g. "John Doe" → "John").
   - `initials` = first + last initials (e.g. "John Doe" → "JD"; single name → first
     letter).
   - `year` = parsed from the user's `PromotionCandidate.year` (a **String** column —
     I extract the first integer with a regex), else falls back to
     `DEFAULT_COUNSELLOR_YEAR = 2` (the minimum study year in the audit's `studyYears`
     2–4). Confirm the fallback and the string-parsing assumption.

4. **`rating` type = `Numeric(2,1)`** (not `Float`). Chosen for exact one-decimal
   storage and to avoid binary float drift on a user-visible score. Confirm acceptable.

5. **`id` / `user_id` exposure** (identity contract §4). External `id` is set to
   `users.id` on all public/student-facing routes (resolving audit §9 risk #3 and
   matching the `sessions` / `session_requests` FK pattern). I **kept** the redundant
   `user_id` field on `CounsellorDirectoryItem` / `CounsellorProfileDetail` /
   `CounsellorOwnProfile` and set it **equal to `users.id`** so the two are never
   inconsistent (rather than dropping it and risking a frontend that still reads
   `userId`). Recommend dropping `user_id` in a later cleanup once the frontend is
   confirmed not to depend on it.

6. **Is `year` counsellor-editable?** Defaulted to **NOT editable** (it is absent from
   `CounsellorProfileSelfUpdate`). Rationale: study year is a verifiable academic fact
   tied to admin promotion/verification, not free-text self-presentation. Confirm
   whether counsellors should be allowed to update it (e.g. when they advance a year).

---

## 🚩 Flagged for a human decision (do NOT resolve here)

- **Format enum conflict (task §6):** the backend uses
  `in-person / video / phone` (`SessionFormat`), while the audit's counsellor *request*
  UI uses `online / in-person` (audit §5.3, §9 risk #2). No mapping was chosen or
  applied anywhere in this prompt. This mainly bites Prompt 2 (session requests), but
  it is surfaced now for a product decision.

---

## Notes / observations about the existing codebase

- **Shell environment was non-functional during this work** (every command returned
  "no exit status"), so I could **not** run the requested live
  `SELECT COUNT(*) FROM counsellor_availability_schedule` pre-check, nor an import/
  migration smoke test. Instead I verified statically that the table is empty by
  construction: migration `001` creates it with **no** INSERT/seed, migration `002`
  only touches `user_roles`, and the only seed script (`scripts/seed_admin.py`) creates
  just an admin user + role. The availability PUT is additionally written to be
  per-counsellor-scoped, so it is safe even if rows exist for other counsellors.
  **Please run the count check and an `alembic upgrade head` + app-import smoke test
  before relying on this slice.**
- **Pre-existing bug, NOT fixed (out of scope):** `app/routers/users.py`
  `list_counsellors` references `UserRoleAssignment` without importing it (it imports
  only `User, UserRole`), so that endpoint would raise `NameError` at request time.
  Flagging rather than touching it, since it's unrelated to this prompt.
- The normalized schedule table is named `counsellor_availability_schedule`
  (singular) in both the model and migration `001`; the task text referred to it once
  as `counsellor_availability_schedules` (plural). I used the actual table name from
  the model.
- Two routers (`counsellor_availability` and the new `counsellor_profile`) share the
  `/counsellor/me` prefix with distinct sub-paths — this is intentional and supported
  by FastAPI.

---

## Prompt 2 — Full Session Request Lifecycle

### What this prompt was

Implement the full session-request lifecycle end-to-end. A `session_request` **is**
the session — there is no separate `sessions` table and no sequential S-1001 string
IDs. This prompt **supersedes** earlier `cursorrules` guidance that treated
`CounsellingSession` / `sessions` as finalized do-not-touch scaffolding.

Status machine: `pending` → `accepted` | `rejected`; then `accepted` → `completed`
(counsellor-only, manual). All reads/writes go through `session_requests.id` (integer).

### Architecture correction

- **Dropped** the unused `CounsellingSession` SQLAlchemy model and `sessions` table
  (migration `004_drop_sessions`; table was never populated).
- **Session IDs** are integer `session_requests.id` everywhere — no accept-side row
  creation, no string `S-1001` pattern.
- **`cursorrules`** §3 and §5 updated so future agents see `session_requests` as the
  canonical session entity.

### Endpoint-by-endpoint: what it does and why

**`POST /session-requests`** + **`GET /session-requests/mine`**
(`app/routers/session_requests.py`, `require_student`)
- Create validates booking rules server-side (audit §5.3, §6.4): active counsellor,
  topic/`Other`+`other_topic`, `preferred_date >= today`, not in `unavailable_dates`,
  weekday has enabled slots, `preferred_time` in slot list (shared helper with
  `GET /counsellors/{id}/slots`), `format ∈ SessionFormat`, notes ≤500, no
  self-booking. Invalid → **422** with per-field errors. Returns `{ id, status:
  "pending" }`.
- Mine lists all caller-owned requests with computed `overdue` (`pending` and
  `requested_at` older than 24h).

**`GET /students/me/sessions`** + **`GET /students/me/sessions/{session_id}`**
(`app/routers/student_sessions.py`, `require_student`)
- Reads accepted/completed `session_requests` for the caller (not a separate table).
- `session_id` is integer `session_requests.id`. `scheduled_at` is derived from
  `preferred_date` + `preferred_time`; `duration_minutes` defaults to 45 (UI range
  45–60; no DB column yet).

**Counsellor session-request routes** (`app/routers/counsellor_sessions.py`,
`require_active_counsellor`)
- **`GET /counsellor/session-requests`** — caller-owned list; optional `?status=`.
- **`GET /counsellor/session-requests/{request_id}`** — detail incl. notes,
  `duration_minutes`, and post-acceptance `student_email`.
- **`POST .../accept`** — `pending` → `accepted`; reveals student identity (accept =
  consent to share, regardless of `anonymous_until_accepted`).
- **`POST .../reject`** — `pending` → `rejected`; optional `reason` →
  `rejection_reason`.
- **`POST .../complete`** — **NEW** — `accepted` → `completed`; counsellor-only.
- **`GET /counsellor/me/sessions/upcoming`** — accepted requests with
  `preferred_date >= today`, ordered by computed `scheduled_at`.
- **`PATCH /counsellor/me/availability-status`** — unchanged from Prompt 1.

### Anonymity

Pre-acceptance when `anonymous_until_accepted == True` and `status == pending`:
`student_display_name = "Anonymous {LastInitial}."` (e.g. `"Anonymous M."`).
Otherwise pending shows real `full_name`. Post-acceptance (`accepted` / `completed`):
always real name; `student_email` included in detail response only.

### Product decisions applied (not re-litigated)

| Decision | Implementation |
|----------|----------------|
| Format | Stored as `in-person` \| `video` \| `phone` — no enum mapping; counsellor UI may collapse video+phone to "Online session" at display layer only |
| Platform | Share contact on accept; no meeting links / calendar / video integration |
| `sessions_count` | **Computed at read time** (Prompt 9): `COUNT(*) WHERE counsellor_id = ? AND status = 'completed'` — DB column left in place but not read |
| `BookingSessionStatus` / `SessionOutcome` | Left on admin stub schemas only; not used in session-request flows |
| Wrong owner / bad transition | **404** (not 403) to avoid ID leakage |

### Files touched (one line each)

- `cursorrules` — replaced outdated `Session`/`sessions` do-not-touch guidance with
  `session_requests`-as-canonical-session guidance.
- `app/models.py` — removed `CounsellingSession`, `User.bookings_*`, `SessionRequest.booking`.
- `app/schemas/session.py` — integer session IDs, `SessionRequestStatus` on student/upcoming
  items, `student_email` on detail, admin enums kept for later admin prompt.
- `app/services/availability.py` — extracted `get_bookable_slots_for_date` (shared with
  slots GET and booking validation).
- `app/services/session_requests.py` — **NEW:** validation, anonymity, overdue, lifecycle,
  response mappers.
- `app/routers/session_requests.py` — implemented create + mine.
- `app/routers/student_sessions.py` — implemented list + detail from `session_requests`.
- `app/routers/counsellor_sessions.py` — implemented list/detail/accept/reject/complete/upcoming;
  left availability-status PATCH untouched.
- `app/routers/counsellors.py` — slots handler refactored to shared availability helper.
- `alembic/versions/004_drop_sessions_table.py` — **NEW:** drops `sessions` table.

### Verification

- `alembic upgrade head` applied `004_drop_sessions` cleanly (local PostgreSQL).
- App imports without `CounsellingSession` references (`from app.main import app` OK).

### Pre-existing bugs noted (NOT fixed)

- `app/routers/users.py` `list_counsellors` missing `UserRoleAssignment` import
  (same as Prompt 1).

### Deferred / out of scope

- Admin session log, `sessions_count` on counsellor profile, resource CMS, landing carousel full wire.

---

## Prompt 3 — Frontend session-request lifecycle + auth

### What this prompt was

Wire the React frontend to the live FastAPI backend for authentication and the full
session-request lifecycle (book → accept/reject → student view → counsellor complete).
Mock auth and local-only session state were replaced on the wired pages; other areas
(admin sessions, resource CMS, landing carousel) remain on mocks.

### Frontend modules added

- `frontend/.env.development` — `VITE_API_URL`
- `frontend/src/api/client.js` — `apiFetch`, bearer token, 422 field errors, 401 handler
- `frontend/src/api/auth.js` — login (form-encoded), register + auto-login, `/auth/me`
- `frontend/src/api/counsellors.js` — directory list + profile + availability mappers
- `frontend/src/api/sessions.js` — all session-request/session endpoints + display helpers
- `frontend/INTEGRATION.md` — handoff summary

### Booking path

`CounsellorDirectory` now calls `GET /counsellors` so booking links use backend
`users.id` (integer). `SessionBookingPage` loads counsellor, availability, and slots
from the API. Profile page (`CounsellorProfile.jsx`) is still mock for non-booking fields.

### Auth notes

- Login uses OAuth2 form body (`username` = email), not JSON.
- Primary `role` for UI: student > counsellor > admin; `ProtectedRoute` checks
  `user.roles` so dual-role accounts can reach both student and counsellor routes.
- Backend `redirect_to` on login is used for post-login navigation.

### Backend change

- `app/main.py` — CORS for `http://localhost:5173` and `http://127.0.0.1:5173`.

---

## Prompt 4 — Promotion auto-verifies + counsellor profile & availability integration

### What this prompt was

Close the promotion → login gap: admin promotion now sets `users.is_verified = true` in
the same transaction as the counsellor role grant and default profile creation, so
newly promoted counsellors land on `/counsellor` instead of `/pending-approval`. Wire
the student counsellor profile page and counsellor availability editor to the live
API (Prompt 1 endpoints).

### Product decisions applied

| Decision | Implementation |
|----------|----------------|
| Promotion = verification | `grant_counsellor_role` sets `user.is_verified = True` on every successful promotion, including idempotent re-promote (stays `True` if already set) |
| `/pending-approval` | Retained for edge cases only (e.g. legacy rows promoted before this fix with `is_verified = false`) — not the normal post-promotion path |
| No separate admin verify endpoint | Out of scope; promotion is the approval step |
| Shared resources on profile | Placeholder/mock until resource CMS exists |
| Time slot palette | Frontend `src/constants/timeSlots.js` mirrors backend `TIME_SLOT_OPTIONS` (8:00 AM … 6:00 PM) |

### Backend change

- `app/services/user_roles.py` — `grant_counsellor_role` sets `user.is_verified = True`
  after `ensure_counsellor_profile`, same transaction as role grant.

**Existing DB rows:** Users promoted before this fix may still have `is_verified = false`.
Re-run `POST /admin/counsellors/promote/{user_id}` (idempotent) or
`UPDATE users SET is_verified = true WHERE id = …`. No migration required.

### Frontend modules added / wired

- `frontend/src/constants/timeSlots.js` — canonical slot palette (must match backend)
- `frontend/src/api/counsellorAvailability.js` — `GET/PUT /counsellor/me/availability`
- `frontend/src/api/counsellors.js` — profile page mappers (`mapCounsellorProfileForPage`, etc.)
- `CounsellorProfile.jsx` — `GET /counsellors/{id}` (+ mappers); book link uses numeric `users.id`
- `CounsellorAvailability.jsx` — load/save weekly schedule via counsellor availability API
- `frontend/INTEGRATION.md`, `frontend/.cursorrules` — updated wired-pages table and promotion note

### Verification

- Promote student via Swagger → login → `/counsellor` (not `/pending-approval`)
- Student: directory → profile → book with numeric IDs
- Counsellor: `/counsellor/availability` load/save persists; slots appear on student booking

---

## Swagger Authorize — flat token endpoint (OpenAPI-only fix)

### Problem

Swagger UI's OAuth2 password Authorize dialog POSTs to the OpenAPI `tokenUrl` and
reads **top-level** `access_token` from the JSON body. `POST /auth/login` returns
`{ user, token: { access_token, ... }, redirect_to }`, so Swagger stored
`undefined` and sent `Authorization: Bearer undefined` on Try-it-out requests.

### Approach considered

1. **Configure nested token path in the OAuth2 scheme** — **Not supported.** Swagger UI
   only allows selecting a different *top-level* field name via `x-tokenName` (e.g.
   `id_token`), not a nested path like `token.access_token`. FastAPI's
   `OAuth2PasswordBearer` has no nested-path option either.

2. **Separate Swagger-only token route** — **Used.** Added `POST /auth/swagger-token`
   returning flat `schemas.Token` (`{ access_token, token_type }`). Changed
   `OAuth2PasswordBearer(tokenUrl="auth/swagger-token")` in `app/oauth2.py` so the
   OpenAPI security scheme (and Authorize dialog) hit this route instead of
   `/auth/login`. Runtime bearer validation is unchanged — it still reads the
   `Authorization` header only.

### Contract preserved

`POST /auth/login` response shape is **unchanged** — `token.access_token` remains
nested. Real clients and frontend work must keep using `/auth/login`.

### Files touched

- `app/oauth2.py` — `tokenUrl` → `auth/swagger-token` (+ comment).
- `app/routers/auth.py` — `_authenticate_user` helper; new `POST /auth/swagger-token`;
  login refactored to share auth logic.
- `cursorrules` §2 — documents the swagger-token vs login split.

---

## Prompt 5 — Multi-role portal picker (frontend-only)

### Summary

Dual/triple-role users now **choose which portal shell** (student / peer counsellor /
admin) they see and can **switch anytime**. This is entirely a **frontend, client-side**
concern. **No new API, no schema change, no "active role" column or endpoint.**

### Backend stance (unchanged)

- Authorization remains on the `user_roles` table via the `require_*` dependencies —
  **never** the singular `users.role` column.
- `/auth/login` and `/auth/me` keep returning the full active `roles[]` array. The
  frontend derives its `availablePortals` from that array (plus `is_verified` for the
  counsellor portal).
- The selected portal is **client-only** (`localStorage: peerpoint_active_portal`); it is
  never sent to the backend and does not affect JWT claims.

### Doc-only touches this prompt

- `compute_login_redirect` — comment clarifying it is a single-role best guess that the
  frontend may override for multi-role users. Behaviour unchanged (still prioritises
  admin → counsellor → student for the single returned path).
- `grant_counsellor_role` — the `user.role = UserRole.counsellor` write is now explicitly
  documented as cosmetic/legacy (not used by auth or the picker). Left in place; removal
  deferred (out of scope: `users.role` column drop/migration).

---

## Prompt 6 — Admin counsellor management (promote flow end-to-end)

### What this prompt was

Make the admin promote flow fully usable inside the app (no Swagger). The two admin
list endpoints (`GET /admin/counsellors`, `GET /admin/counsellors/promotion-candidates`)
were typed stubs; `POST /admin/counsellors/promote/{user_id}` worked but had no
training gate. This fills in both lists, adds server-side promotion validation, and
ships a seed script so a demo always has a promotable candidate.

### Endpoint-by-endpoint

**`GET /admin/counsellors`** (`require_admin`, `app/services/admin_counsellors.py`)
- Returns users that have **both** an active `counsellor` role in `user_roles` **and** a
  `counsellor_profiles` row (inner join across `CounsellorProfile → User → UserRoleAssignment`,
  filtered to active counsellor assignments). A user with a profile but no active role —
  or vice versa — is correctly excluded.
- Optional `?status=active|inactive` filters on `CounsellorProfile.status`.
- **Order: `full_name` ASC** (stable, scannable directory).
- Maps to `AdminCounsellorItem`: `id` = `counsellor_profiles.id` (profile PK), `user_id`
  = `users.id` (the promote target), `full_name`/`email` from `User`, and
  `year`/`program`/`specialties`/`sessions_count`/`rating`/`status`/`availability_status`/
  `last_active_at` from the profile.
- **`sessions_count`** is read straight from the stub `counsellor_profiles.sessions_count`
  column (still 0). Computing real `COUNT(completed)` is explicitly out of scope (carried
  over from Prompt 2's deferral).

**`GET /admin/counsellors/promotion-candidates`** (`require_admin`)
- Returns `promotion_candidates` joined to `users`, **excluding** any user who already
  holds an active counsellor role (`user_id NOT IN (active counsellor user_ids)`). So a
  candidate **disappears from this list the moment they are promoted** — which is what
  makes the demo's "promote → leaves candidates → appears in counsellors" story work.
- **Order: `applied_on` DESC** (newest application first).
- Maps to `PromotionCandidateItem`: `id` = `promotion_candidates.id`, `user_id` =
  `users.id`, `name` = `users.full_name`, plus `email`/`course`/`year`/`training_status`/
  `sessions_attended`/`applied_on`.

**`POST /admin/counsellors/promote/{user_id}`** (`require_admin`) — extended, not rewritten
- **Idempotent re-promote first:** if the user already has an active counsellor role,
  return **200** with the current roles and an "already a counsellor" message. Chose
  idempotent 200 over 409 per the task's admin-UX preference — re-clicking promote (or
  promoting a dual-role user) is never an error.
- **Training gate (audit §6.6), server-side:** `validate_promotion_candidate` loads the
  `PromotionCandidate` for `user_id`:
  - no row → **422** `"User is not a promotion candidate"`
  - `training_status != "Training Complete"` → **422** `"Training must be complete before promotion"`
  This blocks the Swagger-only path of promoting an arbitrary `user_id` with no candidate
  row, and the "In Review" candidate, even though the UI also disables the button.
- Only after the gate passes does it call the existing `grant_counsellor_role`, which
  (Prompt 4) grants the role, creates the default profile idempotently, **and sets
  `is_verified = true`** in the same transaction. **Promotion = verification** — there is
  no separate verify step.

### Why the gate lives server-side AND in the UI

The disabled button is UX; the 422 is the actual enforcement. An admin hitting the API
directly (Swagger, curl) cannot bypass the training requirement. The two are independent
layers guarding the same product rule.

### Seed script (`scripts/seed_promotion_candidate.py`)

NEW. Creates/updates a student user (active student role + `StudentProfile`) and a
`promotion_candidates` row. Defaults to `training_status = "Training Complete"` so the
candidate is immediately promotable; `--in-review` seeds the negative-path candidate
whose Promote button stays disabled and whose API promote returns 422. Idempotent on
re-run (matches by email). Mirrors the structure of `seed_student.py` / `seed_counsellor.py`.

```
python -m scripts.seed_promotion_candidate \
  --email trainee@strathmore.edu --password 123456 \
  --full-name "Trainee Student" --course "BSc Computer Science" --year "Year 3"
```

### Files touched

- `app/services/admin_counsellors.py` — NEW: list queries + mappers + `validate_promotion_candidate`.
- `app/routers/admin.py` — implemented the two GET handlers; added idempotent-re-promote
  short-circuit + training-gate call to `promote_counsellor`.
- `scripts/seed_promotion_candidate.py` — NEW seed script.

### Out of scope (unchanged)

Admin dashboard KPIs, students/sessions/account-requests endpoints, revoke/deactivate
counsellor, creating candidates from the admin UI, and real `sessions_count` from
completed `session_requests`.

---

## Prompt 7 — Student Resource Hub (Read API + Frontend Integration)

### What this prompt was

Student resource pages (`/student/resources`, detail, dashboard recommended strip)
previously read from in-memory `ResourcesContext` + `mockResources.js` — lost on
refresh and disconnected from the backend `resources` table. This prompt implements
the six **student read** route stubs in `app/routers/resources.py`, adds query/mapper
logic in `app/services/resources.py`, seeds published demo articles, and wires the
three student-facing pages to the API. Admin/counsellor resource CMS stays on local
mock until Prompt 8.

### Published-only rule (student reads)

Every student read endpoint filters to `status == published`. Draft, pending_review,
rejected, and archived rows are **excluded from lists** and return **404** on detail,
related, and view routes. This matches audit §5.5 and prevents leaking unpublished
counsellor submissions to students.

### Endpoint-by-endpoint

**`GET /resources`** (`require_student`)
- Query: optional `?category=` (`ResourceCategory` enum), optional `?search=` (case-insensitive ILIKE on title, description, and category string).
- Order: `published_at DESC`.

**`GET /resources/featured`** (`require_student`)
- Query: `?limit=` default 2, max 10.
- Published + `featured == true`.
- Sort: `featured_order ASC NULLS LAST`, then `published_at DESC` (audit §6.3).

**`GET /resources/recommended`** (`require_student`) — NEW route fixing audit risk #5
- Up to **2** published resources for the student dashboard carousel.
- Prefer featured (same sort as featured endpoint).
- If fewer than 2 featured, backfill from non-featured published by `published_at DESC` without duplicating IDs.

**`GET /resources/{resource_id}`** (`require_student`)
- Lookup by string PK `resources.id` (slug, e.g. `featured-exam-stress`).
- 404 if missing or not published. Returns full `ResourceResponse` including `body[]`.

**`GET /resources/{resource_id}/related`** (`require_student`)
- Base resource must exist and be published; else 404.
- Up to 3 other published resources: same category first, then other categories; exclude self; order within tier by `published_at DESC`.

**`POST /resources/{resource_id}/view`** (`require_student`)
- Published only; else 404.
- Atomically increments `views` (`SELECT … FOR UPDATE` + increment in same transaction).
- Returns `{ id, views }`. Frontend calls once on detail page load (Strict Mode guarded).

### Mapper notes (`to_resource_response`)

- `last_edited_by` / `reviewed_by` → `User.full_name` or null.
- `submitted_by` → `ResourceSubmittedBy` when `submitted_by_id` is set.
- Enum fields serialize as string values via Pydantic `ResourceResponse`.

### Student pages bypass ResourcesContext

`ResourceHub.jsx`, `ResourceDetails.jsx`, and the dashboard recommended strip in
`StudentDashboard.jsx` call `frontend/src/api/resources.js` directly. **Do not**
refactor `ResourcesProvider` for CMS — `/admin/resources/*` and
`/counsellor/resources/*` continue using local mock state until Prompt 8.

### Seed script (`scripts/seed_resources.py`)

NEW. Idempotent upsert by `resources.id`. Seeds **7 published** articles translated
from `mockResources.js` `createInitialResources()` (including 2 featured with
`featured_order` for the hub hero), plus **1 draft** and **1 pending_review** row
to verify they stay hidden from student routes. Uses real external image URLs from
the mock file.

```
python -m scripts.seed_resources
```

### Files touched

- `app/services/resources.py` — NEW: queries, mappers, featured/recommended/related helpers.
- `app/routers/resources.py` — implemented all six student read handlers.
- `scripts/seed_resources.py` — NEW seed script.
- `frontend/src/api/resources.js` — NEW API module + camelCase mapper.
- `frontend/src/pages/ResourceHub.jsx`, `ResourceDetails.jsx`, `StudentDashboard.jsx` — API-driven.

### Out of scope (unchanged)

Admin resource CMS (`admin_resources.py` stubs), counsellor submissions
(`counsellor_resources.py` stubs), `POST /media/upload`, resource saves/bookmarks,
refactoring `ResourcesContext` for admin/counsellor, landing page browse link fix,
newsletter subscribe API.

---

## Prompt 8 — Resource CMS (Counsellor Submissions + Admin Review)

### What this prompt was

Completes the resource **write path**: counsellor draft → submit for review → admin
approve/reject/publish → published article on student hub. Replaces in-memory
`ResourcesContext` CMS mutators with real API calls. Student reads from Prompt 7 are
unchanged.

### Permission matrix

| Action | Counsellor | Admin |
|--------|------------|-------|
| List own submissions | Yes (`submitted_by_id == self`) | — |
| List all resources | — | Yes (all statuses) |
| Create | Draft only; author locked server-side | Draft or publish immediately |
| Edit | Own only; `draft` / `rejected` only | Any resource |
| Submit for review | Own draft/rejected; completeness check | — |
| Review queue | — | `pending_review` counsellor submissions |
| Publish / unpublish / feature / archive / restore | — | Yes |
| Set featured | No | Published only |
| Edit published (counsellor) | Blocked (404 / read-only UI) | Yes |

Wrong owner or invalid status transition → **404** (not 403).

### Counsellor author fields (server-enforced)

- `author` = counsellor `full_name`
- `author_role` = `"Peer Counsellor, PeerPoint"`
- Client overrides ignored on create/update.

### Review decision mapping

| `decision` | Result |
|------------|--------|
| `approve_publish` | `status = published`, set `published_at` if missing, clear `rejection_reason` |
| `approve_draft` | `status = draft`, clear `published_at` and `rejection_reason` |
| `reject` | `status = rejected`, optional `rejection_reason` |

Sets `reviewed_by_id`, `reviewed_at` on all review paths.

### CMS service (`app/services/resource_cms.py`)

Shared helpers:

- `generate_unique_resource_id(db, title)` — slugify title + numeric suffix on collision (mirrors frontend `slugifyTitle` / `ensureUniqueId`).
- `validate_resource_payload(payload)` — title, description, image URL, image alt, ≥1 body paragraph.
- `is_submittable(resource)` — mirrors frontend `isResourceSubmittable`.
- `estimate_read_time(body)` — ~200 words/minute heuristic; empty body → `"5 min read"`.

Reuses `to_resource_response()` from `app/services/resources.py`.

### Counsellor endpoints (`require_active_counsellor`)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/counsellor/resources` | Own submissions; optional `?status=` |
| GET | `/counsellor/resources/{id}` | Own resource any status; else 404 |
| POST | `/counsellor/resources` | Create draft; `publish: true` → 422 |
| PUT | `/counsellor/resources/{id}` | Own; draft/rejected only |
| POST | `/counsellor/resources/{id}/submit` | Completeness → `pending_review`, `submitted_at` |

### Admin endpoints (`require_admin`)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/admin/resources` | All; `?status=` + `?search=` |
| GET | `/admin/resources/stats` | KPI counts |
| GET | `/admin/resources/pending-review` | Counsellor queue |
| GET | `/admin/resources/{id}` | Any resource (edit/preview load) |
| POST | `/admin/resources` | Create; optional `publish: true` |
| PUT | `/admin/resources/{id}` | Edit any |
| POST | `/{id}/publish` | → published |
| POST | `/{id}/unpublish` | → draft, clear `published_at` |
| POST | `/{id}/feature` | Published only |
| POST | `/{id}/archive` | → archived |
| POST | `/{id}/restore` | → draft |
| POST | `/{id}/review` | Counsellor `pending_review` only |

Static routes (`/stats`, `/pending-review`) registered before `/{id}`.

### Frontend integration

- `frontend/src/api/resources.js` — CMS methods + `toApiPayload` / `mapResourceStats`.
- Counsellor/admin CMS pages call API directly (same pattern as Prompt 7 student pages).
- `ResourcesContext` gutted to **activity-feed stubs only** (`counsellorActivity`,
  `adminResourceActivity`); mock resource array and CMS mutators removed.
- Pure helpers remain in `mockResources.js` (`isResourceSubmittable`,
  `formatResourceDisplayDate`, `COUNSELLOR_AUTHOR_ROLE`).

Activity feeds (`counsellorActivity` / `adminResourceActivity`) stay client-side mock;
backend persistence deferred.

### Files touched

- `app/services/resource_cms.py` — NEW CMS write/query layer.
- `app/routers/counsellor_resources.py` — 5 handlers (+ GET detail).
- `app/routers/admin_resources.py` — 12 handlers (+ GET detail).
- `frontend/src/api/resources.js` — counsellor + admin CMS methods.
- CMS pages under `frontend/src/pages/` (Counsellor/Admin resources, forms, previews, dashboard widgets).
- `frontend/src/context/ResourcesContext.jsx` — activity feeds only.

### Out of scope (unchanged)

`POST /media/upload`, resource saves/bookmarks, admin dashboard non-resource KPIs,
session log, students list, landing carousel, persisting activity feeds to backend.

### Handoff

Prompt 9: admin session log, dashboard KPIs, public stats, landing carousel — see § Prompt 9 below.

---

## Prompt 9 — Admin session log, dashboard KPIs, landing carousel (2026-06-24)

### Scope delivered

- **`sessions_count`** — computed at read time via
  `count_completed_sessions_for_counsellor()` in `app/services/session_requests.py`;
  used in counsellor directory, own profile GET, and admin counsellor list. The
  `counsellor_profiles.sessions_count` column remains (no migration) but is not read.
- **`GET /admin/sessions`** — accepted + completed + rejected (`rejected` → `cancelled`
  for admin display); excludes pending. Optional `?status=` and `?search=`. Real student
  and counsellor names (no anonymity). Outcome defaults to `Pending`; `null` on completed.
- **`GET /admin/dashboard`** — headline KPI counts from DB (students, counsellors,
  active sessions, pending/overdue requests, published/pending-review resources,
  newsletter subscribers).
- **`GET /public/stats`** — counsellor count, students supported, sessions completed,
  resources published (no auth).
- **`GET /public/counsellors/featured`** — already existed; frontend wired in Prompt 9.
- **`scripts/seed_sessions.py`** — idempotent sample `session_requests` across statuses.

### Admin session status mapping

| DB status | Admin `BookingSessionStatus` |
|-----------|------------------------------|
| `accepted` | `upcoming` (always, until counsellor marks complete) |
| `completed` | `completed` |
| `rejected` | `cancelled` |

### Frontend wiring

- `frontend/src/api/admin.js` — `listAdminSessions`, `mapAdminSession`,
  `getAdminDashboard`, `mapAdminDashboard`, `computeAdminSessionStats`.
- `frontend/src/api/public.js` — **NEW** — `getFeaturedCounsellors`, `mapCounsellorCard`,
  `getPublicStats`, `mapPublicStats`.
- `AdminSessions.jsx`, `AdminDashboard.jsx` (headline KPIs + platform KPI cards only),
  `LandingCounsellorCarousel.jsx`, `LandingStats.jsx`.

Admin session header stats are **computed client-side from the API response list**
(filtered when status/search query params are applied).

### Still mock / stub (unchanged at Prompt 9 delivery)

- Admin dashboard `platformHealth` / attention widgets (satisfaction, response SLA — no DB).

---

## Prompt 10 — Admin account requests, students directory, platform notifications (2026-06-25)

### Scope delivered

- **`account_approval_requests` queue** — `GET /admin/account-requests` lists open rows
  (`status IN (pending_review, verifying_id)`); approve/reject **deletes** the row.
  Signup approve sets `is_verified=true`, ensures student role + `StudentProfile`.
  Signup reject revokes student role. Promotion approve reuses
  `validate_promotion_candidate` + `grant_counsellor_role`; promotion reject deletes
  request only (keeps `promotion_candidates` row).
- **`POST /auth/register`** — after `grant_role(student)`, creates
  `AccountApprovalRequest(type=signup, status=verifying_id)` when none open.
- **`scripts/seed_promotion_candidate`** — also upserts open promotion account request.
- **`scripts/seed_account_requests`** — idempotent sample rows for existing users.
- **`GET /admin/students`** + **`GET /admin/students/{id}`** — active student role
  directory; session counts via `count_completed_sessions_for_student()`; detail
  includes synthesized `recent_activity` from `session_requests`.
- **`GET /admin/notifications`** — reads `platform_activity` with server-computed
  `relative_time`; `record_platform_activity()` called on signup/promotion approve.
- **`app/services/admin_account_requests.py`**, **`admin_students.py`**,
  **`platform_activity.py`** — new service modules.

### Student stats choice

Admin students page header KPIs (`total`, `activeThisWeek`, `newThisMonth`, `flagged`)
are **computed client-side** from the loaded student list (`computeAdminStudentStats`).
Server helper `get_admin_student_stats()` exists for future use but is not exposed as
an endpoint.

### Frontend wiring

- `frontend/src/api/admin.js` — account requests, students, notifications helpers.
- `AdminDashboard.jsx` — accounts tab + activity/notifications merge with
  `adminResourceActivity`.
- `AdminStudents.jsx`, `AdminPageHeader.jsx` — API-driven lists and notifications.

### Still mock / stub (unchanged)

- Auth password-reset stubs, admin edit student / book session actions.

---

## Prompt 11 — Admin analytics, reports, and `last_active_at` (2026-06-25)

### Scope delivered

- **`POST /auth/login`** (+ **`swagger-token`**) — sets `users.last_active_at` and
  `counsellor_profiles.last_active_at` (when active counsellor) on successful auth.
  Not updated on `GET /auth/me`.
- **`GET /admin/analytics`** — single bundle for dashboard + reports:
  - Session trend: last 8 weeks of **completed** sessions bucketed by **`requested_at`**
    week (Monday-start); bar `height` computed server-side (max week = 100).
  - Status distribution: completed / upcoming (accepted) / cancelled (rejected); pending
    excluded.
  - Counsellor performance: active counsellors with completed session counts, availability
    from profile, proxy response rate per counsellor.
  - Top 3 published resources by `views`; top 5 session categories from completed rows.
  - Reports extras: monthly active users, sessions completed this month,
    `avg_satisfaction` / `avg_response_hours` = `null` (UI shows `—`).
  - Growth + usage breakdown as proxy metrics from existing tables.
- **`GET /admin/reports/*`** — `/analytics` full bundle; `/trends`, `/sessions`,
  `/resources` partial slices; `/exports` → **501**.
- **`app/services/admin_analytics.py`** — shared query helpers.

### Frontend wiring

- `frontend/src/api/admin.js` — `getAdminAnalytics` + mappers.
- `AdminDashboard.jsx` — session chart, status donut, counsellor table, top resources
  from API; `platformHealth` + `attentionItems` remain mock.
- `AdminReports.jsx` — API-driven KPIs, growth, usage, categories.
- Filter enums moved to `frontend/src/constants/counsellorFilters.js`;
  `mockCounsellorProfile.js` deleted.
