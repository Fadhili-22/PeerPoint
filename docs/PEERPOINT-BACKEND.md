# PeerPoint Backend — Study Guide

> Self-contained revision doc for panel prep and onboarding.  
> Stack: **FastAPI 0.136** · **SQLAlchemy 2.0** · **Alembic 1.14** · **PostgreSQL** (`psycopg2-binary`)  
> Verified against repo: July 2026

---

## How to use this doc

1. Read **§1–§3** first (mental model).
2. Use **§4** as your file GPS — "where do I change X?"
3. Use **§9** as a quick cheat sheet during live Q&A.
4. Run the API locally: `cd backend && uvicorn app.main:app --reload` → docs at `http://127.0.0.1:8000/docs`

---

## 1. What is the backend?

**Frontend** = what users see and click (React in `frontend/`).  
**Backend** = the trusted kitchen: auth, business rules, database, emails.

| Term | Meaning |
|------|---------|
| **Client** | Browser running the React app |
| **Server** | FastAPI app (usually `http://127.0.0.1:8000`) |
| **Request** | Message from client → server (method + URL + headers + body) |
| **Response** | Server's reply (status code + JSON) |

**Why not frontend-only?** Secrets, shared data, multi-user rules, and persistence cannot live safely in the browser.

### Example flow: student requests a session

```
Browser (SessionBookingPage.jsx)
  → POST /session-requests  (+ JWT + JSON body)
    → main.py routes to session_requests.py
      → require_student (auth guard)
      → get_db (open PostgreSQL connection)
      → session_requests.create_session_request() (validate + INSERT)
        → session_requests table
      → background email to counsellor
  ← 201 { id, status: "pending" }
```

---

## 2. API & REST basics

- **API** = agreed menu of operations between frontend and backend.
- **REST** = URLs are nouns, HTTP methods are verbs, JSON in/out, stateless (JWT carries identity each request).
- **Route / endpoint** = one URL + method pair (e.g. `POST /session-requests`).

| Method | Meaning | PeerPoint examples |
|--------|---------|-------------------|
| GET | Read (safe, no side effects) | `GET /counsellors/{id}/slots` |
| POST | Create or action | `POST /session-requests`, `POST .../accept` |
| PUT | Replace whole resource | `PUT /counsellor/me/profile` |
| PATCH | Partial update | Rare in this codebase |
| DELETE | Remove | Admin resource archive patterns |

**Note:** `POST .../accept` updates an *existing* row — POST is used for **lifecycle actions with side effects** (emails), not only creation.

---

## 3. FastAPI architecture

```
main.py           ← app startup, CORS, register routers, /static
routers/          ← HTTP layer (thin): URL + Depends(auth) + call service
services/         ← business rules (THE BRAIN)
models.py         ← database table definitions (ORM)
schemas/          ← JSON request/response shapes (Pydantic)
dependencies.py   ← who is allowed (role guards)
oauth2.py         ← JWT create/verify, get_current_user
database.py       ← engine + get_db() per request
config.py         ← .env settings
alembic/          ← schema migration history
```

### Key FastAPI concepts

| Concept | What it does |
|---------|--------------|
| **APIRouter** | Groups related endpoints under a URL prefix |
| **@router.get/post** | Path operation — function called on matching request |
| **Pydantic schema** | Validates incoming JSON; shapes outgoing JSON |
| **Depends()** | Dependency injection — runs guards/helpers before your handler |
| **BackgroundTasks** | Work after response (e.g. send email) |

### Dependency chain example (`POST /session-requests`)

```
1. Depends(get_db)           → open DB session
2. Depends(require_student)  → get_current_user (JWT)
                             → check user_roles for student
                             → check email_verified
3. Parse body → SessionRequestCreate (Pydantic)
4. Handler runs service
5. get_db finally closes connection
```

---

## 4. Folder & file map

### Root (`backend/`)

| File | Purpose | Change when… |
|------|---------|--------------|
| `requirements.txt` | Pinned Python deps | Adding a library |
| `alembic.ini` | Alembic config | Rarely |
| `.env` | Secrets (not in git) | DB URL, SECRET_KEY, SMTP |
| `.env.example` | Env var template | Documenting new config |
| `cursorrules` | Project conventions | Understanding *why* before changing |
| `description.md` | Implementation learning log | Panel reasoning (verify vs code) |
| `frontend_audit.md` | Frontend-derived requirements | Scope questions |

### Core (`backend/app/`)

| File | Purpose | Change when… |
|------|---------|--------------|
| `main.py` | FastAPI app, CORS, 16 routers, `/static` | New router, CORS origins |
| `config.py` | Settings from `.env` | New env variable |
| `database.py` | SQLAlchemy engine, `get_db()` | Connection pooling (rare) |
| `models.py` | All ORM models → tables | New column/table (+ migration) |
| `dependencies.py` | `require_student`, `require_active_counsellor`, etc. | Access control rules |
| `oauth2.py` | JWT + `get_current_user` | Token payload/expiry |
| `utils.py` | Password hash/verify (bcrypt) | Password hashing (rare) |

### Routers (`backend/app/routers/`)

| File | Prefix | Handles |
|------|--------|---------|
| `auth.py` | `/auth` | Register, login, logout, verify email, password reset |
| `users.py` | `/users` | `/me`, admin user list, counsellor user list |
| `public.py` | `/public` | Featured counsellors, platform stats (no auth) |
| `counsellors.py` | `/counsellors` | Directory, profile, availability, slots |
| `session_requests.py` | `/session-requests` | Student create + list own requests |
| `counsellor_sessions.py` | `/counsellor` | Accept/reject/complete requests, upcoming |
| `student_sessions.py` | `/students/me/sessions` | Student sessions + ratings |
| `counsellor_availability.py` | `/counsellor/me` | Counsellor weekly schedule |
| `counsellor_profile.py` | `/counsellor/me` | Counsellor self-edit profile |
| `resources.py` | `/resources` | Public published resources |
| `counsellor_resources.py` | `/counsellor/resources` | Counsellor resource CMS |
| `admin_resources.py` | `/admin/resources` | Admin resource CMS |
| `admin.py` | `/admin` | Dashboard, students, counsellors, sessions, analytics |
| `admin_reports.py` | `/admin/reports` | Report endpoints |
| `newsletter.py` | `/newsletter` | Newsletter subscribe |
| `media.py` | `/media` | Image upload |

### Schemas (`backend/app/schemas/`)

| File | Defines |
|------|---------|
| `enums.py` | `SessionTopic`, `SessionRequestStatus`, `UserRole`, etc. |
| `user.py` | Register/login/user responses |
| `session.py` | Session request + rating shapes |
| `counsellor.py` | Counsellor cards, profile, slots |
| `admin.py` | Admin dashboard, students, counsellors |
| `resource.py` | Resource CMS |
| `newsletter.py` | Newsletter |
| `media.py` | Upload response |
| `__init__.py` | Re-exports all (routers use `from app import schemas`) |

### Services (`backend/app/services/`)

| File | Purpose |
|------|---------|
| `session_requests.py` | **Core session flow** — create, validate, accept, reject, complete, anonymity |
| `session_ratings.py` | Post-session star ratings |
| `availability.py` | Bookable slot computation |
| `user_roles.py` | **Authorization source of truth** — grant/revoke roles, login redirect |
| `email_verification.py` | Email verify tokens |
| `password_reset.py` | Password reset tokens |
| `email.py` | SMTP vs console delivery |
| `email_messages.py` | Email body text |
| `account_emails.py` | Session lifecycle emails |
| `admin_*.py` | Admin dashboard, students, counsellors, sessions, analytics, account requests |
| `resource_cms.py` / `resources.py` | Resource CMS + public reads |
| `media_storage.py` | File upload to `static/uploads/` |
| `newsletter.py` / `newsletter_emails.py` | Newsletter |
| `platform_activity.py` | Admin notification feed |

### Migrations (`backend/alembic/versions/`)

**Head:** `012_add_user_is_active`

```
001 scaffold → 002 user_roles → 003 rating decimal → 004 drop sessions table
→ 005 admission_number → 006 drop student_profiles → 007 email_verified
→ 008 drop rating → 009 drop availability_status → 010 phone
→ 011 session_ratings → 012 is_active
```

**Rule:** Change `models.py` → `alembic revision --autogenerate` → review → `alembic upgrade head`. Never edit old migrations already applied on shared DBs.

### Scripts (`backend/scripts/`)

Dev seed scripts only (`python -m scripts.seed_student`, etc.) — not part of running API.

---

## 5. Database & ORM (SQLAlchemy)

### Basics

- **Table** = spreadsheet (e.g. `session_requests`)
- **Row** = one record (one booking)
- **Column** = one field (`status`, `preferred_date`)
- **Foreign key** = pointer to another table (`student_id` → `users.id`)
- **ORM** = Python classes that map to tables so you write `db.add(request)` instead of raw SQL

### Models (14 classes in `models.py`)

| Model | Table | Key relationships |
|-------|-------|-------------------|
| `User` | `users` | → counsellor profile, session requests, role assignments |
| `UserRoleAssignment` | `user_roles` | user ↔ role (authorization) |
| `CounsellorProfile` | `counsellor_profiles` | 1:1 with User; → availability schedule |
| `CounsellorAvailabilitySchedule` | `counsellor_availability_schedule` | weekly slots per day |
| `PromotionCandidate` | `promotion_candidates` | training pipeline before promotion |
| `SessionRequest` | `session_requests` | student User + counsellor User |
| `SessionRating` | `session_ratings` | 1:1 with SessionRequest |
| `Resource` | `resources` | wellness articles |
| `ResourceSave` | `resource_saves` | user bookmarks |
| `PlatformActivity` | `platform_activity` | admin feed |
| `NewsletterSubscription` | `newsletter_subscriptions` | emails |
| `AccountApprovalRequest` | `account_approval_requests` | promotion approval queue |

### Relationship trace: student ↔ session ↔ counsellor

```
User (student)                    User (counsellor)
  id = 5                            id = 12
    │                                 │
    └──── session_requests ───────────┘
          student_id = 5
          counsellor_id = 12
          status = pending | accepted | rejected | completed
```

In `models.py`, `SessionRequest` has two FKs to `users` with different `relationship()` names: `student` and `counsellor`.

---

## 6. Authentication & authorization

### Auth vs authz

| | Question | Mechanism |
|--|----------|-----------|
| **Authentication** | Who are you? | JWT in `Authorization: Bearer` header |
| **Authorization** | What may you do? | `dependencies.py` + `user_roles` table |

### JWT flow

1. `POST /auth/login` → `create_access_token({ user_id, roles })` in `oauth2.py`
2. Frontend stores token in `localStorage.access_token`
3. Each request: `get_current_user` decodes JWT, loads `User` from DB
4. Role guards check **`user_roles`** table (not `users.role`)

### Three gates (panel favorites)

| Flag / table | Who | Purpose |
|--------------|-----|---------|
| `user_roles` (active rows) | Everyone | **Source of truth** for student/counsellor/admin |
| `email_verified` | Students | Must verify `@strathmore.edu` before student endpoints |
| `is_verified` | Counsellors | Admin must promote/approve before counsellor actions |

### `users.role` column — NOT for security

```python
# models.py ~L119-121
# Non-authoritative default/primary UI context hint only.
# NEVER use this column for authorization checks — use active user_roles rows instead.
```

`activePortal` on the frontend is also **UI only** — backend never trusts it.

### Dependency guards (`dependencies.py`)

| Guard | Checks |
|-------|--------|
| `require_student` | Active student role + `email_verified` |
| `require_active_counsellor` | Active counsellor role + `is_verified` |
| `require_counsellor` | Active counsellor (no is_verified check) |
| `require_admin` | Active admin role |
| `require_admin_or_verified_student` | Admin OR verified student |

### Login redirects (`user_roles.compute_login_redirect`)

| State | Redirect |
|-------|----------|
| Student, email not verified | `/verify-email-pending` |
| Counsellor, not `is_verified` | `/pending-approval` |
| Otherwise | `/student`, `/counsellor`, or `/admin` |

---

## 7. Domain logic — session lifecycle

### Create (`services/session_requests.py`)

**Router:** `POST /session-requests` → `session_requests.py`  
**Guard:** `require_student`

Validation (`validate_create_payload`):
- Cannot book yourself
- Date ≥ today
- Counsellor has active profile
- Date not in `unavailable_dates`
- Time in bookable slots (`availability.get_bookable_slots_for_date`)
- `topic=Other` requires `other_topic`

Creates row: `status=pending`, stores `anonymous_until_accepted`.

### Accept / reject / complete

| Action | Endpoint | Service function |
|--------|----------|------------------|
| Accept | `POST /counsellor/session-requests/{id}/accept` | `accept_request()` |
| Reject | `POST .../reject` | `reject_request()` |
| Complete | `POST .../complete` | `complete_request()` |

**Guard:** `require_active_counsellor` (counsellor + `is_verified`)

Lifecycle: `pending` → `accepted` → `completed` OR `pending` → `rejected`

### Student anonymity (`student_display_name`)

| Status | Counsellor sees |
|--------|-----------------|
| `pending` + anonymous | `"Anonymous D."` (first letter of last name) |
| `pending` + not anonymous | Full name (no contact yet) |
| `accepted` or `completed` | Full name + email + phone in detail view |

**Enforced in:** `services/session_requests.py` — not in frontend display logic alone.

### Other constants

- Session duration: **45 minutes**
- Overdue pending: **24 hours** without counsellor response

---

## 8. Promotion & counsellor verification

Admin promotes student → counsellor:

1. `POST /admin/counsellors/promote/{user_id}` (`admin.py`)
2. `grant_counsellor_role()` in `user_roles.py`:
   - Adds active `counsellor` row in `user_roles` (keeps `student` role)
   - Sets `user.is_verified = True`
   - Creates `CounsellorProfile` via `ensure_counsellor_profile()`
   - Updates cosmetic `users.role = counsellor`

Demotion: `revoke_role(counsellor)` + reset `users.role` if student remains.

---

## 9. Cheat sheet — common changes

| I need to change… | Start here | Also check |
|-------------------|------------|------------|
| Who can call an endpoint | `dependencies.py` + router `Depends()` | — |
| URL or HTTP method | `routers/*.py` | `main.py`, frontend `src/api/` |
| Business rule (validation, anonymity) | `services/*.py` | `schemas/`, `models.py` |
| API JSON shape | `schemas/*.py` | frontend `src/api/` |
| Database column | `models.py` | new Alembic migration |
| Login/token behavior | `oauth2.py`, `routers/auth.py` | `config.py` |
| Email content | `email_messages.py`, `account_emails.py` | `config.py` EMAIL_BACKEND |
| Bookable time slots | `services/availability.py` | `counsellors.py` slots endpoint |
| Counsellor schedule UI data | `counsellor_availability.py` | `availability.py` |
| Admin dashboard numbers | `admin_dashboard.py`, `admin_analytics.py` | `admin.py` |
| Upload size/types | `config.py` MAX_UPLOAD_SIZE_MB | `media_storage.py`, `media.py` |
| Seed demo data | `scripts/seed_*.py` | — |

### Multi-file change example

**Add field to session request (e.g. urgency):**
1. `models.py` — column
2. `alembic/versions/` — migration
3. `schemas/session.py` — `SessionRequestCreate` + responses
4. `services/session_requests.py` — validation
5. `routers/session_requests.py` — usually passes through
6. `frontend/src/api/sessions.js` + `SessionBookingPage.jsx`

---

## 10. Running locally

```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
# Copy .env.example → .env, set DATABASE_URL and SECRET_KEY
alembic upgrade head
uvicorn app.main:app --reload

# Optional seeds
python -m scripts.seed_admin
python -m scripts.seed_student
```

Frontend expects `VITE_API_URL=http://127.0.0.1:8000` in `frontend/.env.development`.

---

## 11. Known quirks (flag in panel if asked)

- `counsellor_profile.py` and `counsellor_availability.py` share prefix `/counsellor/me`
- `users.py` uses `UserRoleAssignment` in a query but may be missing import — verify before demo
- `sentry-sdk` in requirements but unused in app code
- `description.md` may reference removed columns (e.g. `availability_status`) — trust current code + migrations
- No automated backend tests in repo

---

## 12. Panel one-liners

- **Why a backend?** Secrets, shared state, enforced rules, persistence across users/devices.
- **Why services layer?** Routers stay thin; business rules are testable and centralized.
- **Why user_roles table?** Multi-role users (student + counsellor); `users.role` is one cosmetic column.
- **Why POST /accept not PATCH?** Explicit lifecycle action with side effects (email), not generic field edit.
- **Why email_verified vs is_verified?** Students prove email ownership; counsellors prove admin training approval.

---

*Companion doc: `PEERPOINT-FRONTEND.md`*
