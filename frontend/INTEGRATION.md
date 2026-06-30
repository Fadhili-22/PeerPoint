# Frontend ↔ Backend Integration (Prompts 4–5)

## What was wired

| Area | API | Pages |
|------|-----|-------|
| Auth | `POST /auth/login`, `POST /auth/register`, `GET /auth/me` | Login, Signup, AuthContext |
| Counsellor directory (list) | `GET /counsellors` | CounsellorDirectory |
| Counsellor profile (detail) | `GET /counsellors/{id}` | CounsellorProfile |
| Booking | `GET /counsellors/{id}`, `.../availability`, `.../slots`, `POST /session-requests` | SessionBookingPage |
| Student requests | `GET /session-requests/mine`, `GET /students/me/sessions`, `GET /students/me/sessions/{id}` | MySessions, StudentDashboard |
| Counsellor requests | `GET/POST /counsellor/session-requests/*` | CounsellorRequests, CounsellorDashboard |
| Counsellor schedule | `GET /counsellor/me/sessions/upcoming` | CounsellorDashboard |
| Availability toggle | `PATCH /counsellor/me/availability-status` | CounsellorDashboard |
| Availability editor | `GET/PUT /counsellor/me/availability` | CounsellorAvailability |
| Admin counsellors (list + promote) | `GET /admin/counsellors`, `GET /admin/counsellors/promotion-candidates`, `POST /admin/counsellors/promote/{user_id}` | AdminCounsellors |
| Student resources (read) | `GET /resources`, `/featured`, `/recommended`, `/{id}`, `/{id}/related`, `POST /{id}/view` | ResourceHub, ResourceDetails, StudentDashboard |
| Counsellor resource CMS | `GET/POST/PUT /counsellor/resources`, `POST /{id}/submit` | CounsellorResources, CounsellorResourceForm, CounsellorResourcePreview, CounsellorDashboard |
| Admin resource CMS | `GET/POST/PUT /admin/resources`, stats, pending-review, publish/unpublish/feature/archive/restore/review | AdminResources, AdminResourceForm, AdminResourcePreview, AdminDashboard queue |

## Config

- `frontend/.env.development` — `VITE_API_URL=http://127.0.0.1:8000`
- `frontend/src/api/client.js` — shared `apiFetch` + bearer token
- `frontend/src/api/auth.js`, `counsellors.js`, `sessions.js`, `counsellorAvailability.js`, `admin.js`, `resources.js` — domain calls + display mappers
- `frontend/src/constants/timeSlots.js` — slot palette (must match backend `TIME_SLOT_OPTIONS`)

## Promotion = verification

Admin promotion (`POST /admin/counsellors/promote/{user_id}`) sets `users.is_verified = true` in the same transaction as the counsellor role grant. Newly promoted counsellors should log in to `/counsellor`, not `/pending-approval`. The pending screen remains for legacy rows promoted before this fix.

**One-time fix for old rows:** re-run promote (idempotent) or `UPDATE users SET is_verified = true WHERE …`.

## Multi-role portal picker (Prompt 5)

Dual-role users (e.g. `roles: ["student", "counsellor"]`) **choose which portal
shell they wear**. This is a **client-side-only** concern:

- **API authorization is unchanged** — every request still authorizes against the
  full `user.roles[]` array (backend `user_roles` table). The active portal is
  never sent to the backend and does **not** alter JWT claims.
- The DB `users.role` column is **not used** by the frontend or by authorization.
  `resolvePrimaryRole` survives only as a cosmetic fallback label.

### State (`AuthContext`)

| Export | Purpose |
|--------|---------|
| `activePortal` | Current UI shell: `"student"`, `"counsellor"`, `"admin"` |
| `availablePortals` | Derived from `user.roles` (student always; counsellor only when `isVerified`; admin always) |
| `setActivePortal(portal)` | Persist + update state |
| `switchPortal(portal)` | Set portal and return its home path for navigation |

Storage keys: `peerpoint_active_portal` (new), `peerpoint_user`, `peerpoint_access_token`.

### Post-login routing (`resolvePostAuthRedirect`)

1. `availablePortals.length > 1` + a valid stored portal → that portal (last-used wins).
2. `availablePortals.length > 1` + no valid stored portal → `/choose-portal`.
3. `availablePortals.length === 1` → that portal's home.
4. `availablePortals.length === 0` → backend `redirect_to` (single-role / `/pending-approval`).

The **last-selected portal is persisted** so returning users skip the chooser.

### Chooser + switcher

- `/choose-portal` — authenticated, minimal centered layout (not inside a portal shell).
  One card per available portal; clicking calls `switchPortal` + navigates.
- `StudentPortalLayout` / `DashboardLayout` render a `PortalSwitcher` (header pill on
  student, sidebar block on counsellor/admin, both desktop + mobile) that only appears
  when the user has another portal to switch to.
- Each shell syncs `activePortal` to its own route on mount, so **route wins over stale
  storage** (refresh on `/counsellor` keeps the counsellor portal).

### Verification guard (`ProtectedRoute`)

Unverified counsellors are bounced to `/pending-approval` **only on counsellor routes**.
Dual-role users keep full access to student routes regardless of counsellor verification.

## Booking path — counsellor IDs

**Decision:** `CounsellorDirectory` and `CounsellorProfile` use numeric `users.id` from the backend (not mock string IDs). Book links: `/student/book/{id}`.

## Weekday convention

Backend `day_of_week` uses JavaScript `Date.getDay()` (Sunday = 0 … Saturday = 6). Frontend availability mappers in `counsellorAvailability.js` follow the same convention.

## Admin counsellor management (Prompt 6)

`/admin/counsellors` is now **fully API-driven** — admins promote candidates in-app, no
Swagger required.

- `frontend/src/api/admin.js` — `listAdminCounsellors({ status })`,
  `listPromotionCandidates()`, `promoteCounsellor(userId)` + snake_case→UI mappers
  (initials derived from `full_name`).
- `AdminCounsellors.jsx` — parallel-fetches candidates + counsellors on mount. Promote
  button uses `candidate.user_id` (not the candidate row id) and is disabled unless
  `training_status === "Training Complete"`. On success both lists refetch and the API
  `message` is shown; a 422 surfaces its `detail`. KPI header stats (total, active,
  pending promotions, average rating) are derived from the loaded data; only the trend
  line ("+4%") stays static.

**Promote target is `user_id`.** `POST /admin/counsellors/promote/{user_id}` takes
`users.id`, never `promotion_candidates.id`. **Promotion = verification** — the same call
sets `is_verified = true` (Prompt 4), so a promoted user logs in to the portal chooser
(student + counsellor), not `/pending-approval`.

## Still on mocks

- Admin dashboard `platformHealth` / `attentionItems` (satisfaction ring, avg response — no DB source).

## Admin analytics + reports + last_active_at (Prompt 11)

| Area | API | Pages |
|------|-----|-------|
| Analytics bundle | `GET /admin/analytics` | AdminDashboard (charts/tables), AdminReports |
| Report slices | `GET /admin/reports/analytics`, `/trends`, `/sessions`, `/resources` | Optional |
| Exports | `GET /admin/reports/exports` → 501 | AdminReports (ComingSoonButton unchanged) |
| Login activity | `POST /auth/login` | Updates `users.last_active_at` + counsellor profile |

- Bar chart `height` is **computed server-side** (max week = 100).
- Satisfaction / avg response time show `—` when API returns `null`.
- Filter chip enums live in `src/constants/counsellorFilters.js` (not mock counsellor data).

## Admin account requests, students, notifications (Prompt 10)

| Area | API | Pages |
|------|-----|-------|
| Account approval queue | `GET /admin/account-requests`, `POST .../approve`, `POST .../reject` | AdminDashboard (accounts tab) |
| Students directory | `GET /admin/students`, `GET /admin/students/{id}` | AdminStudents |
| Platform notifications | `GET /admin/notifications` | AdminPageHeader, AdminDashboard activity |

- `frontend/src/api/admin.js` — `listAccountRequests`, `mapAccountRequest`,
  `approveAccountRequest`, `rejectAccountRequest`, `listAdminStudents`,
  `getAdminStudent`, `mapAdminStudent`, `mapAdminStudentDetail`,
  `computeAdminStudentStats`, `listAdminNotifications`, `mapPlatformActivity`.
- Signup (`POST /auth/register`) creates an open `account_approval_requests` row
  (`type=signup`, `status=verifying_id`); admin approve sets `is_verified=true`.
- Promotion seeds (`seed_promotion_candidate`) also create a promotion queue row.
- Student header KPIs are **computed client-side** from the loaded student list
  (`computeAdminStudentStats`); session counts are computed server-side from completed
  `session_requests`.
- Platform activity merges **API notifications** with client-side
  `adminResourceActivity` from `ResourcesContext` (resource review events stay
  client-side for now).

**Seed account requests (smoke test):**

```powershell
python -m scripts.seed_promotion_candidate --email trainee@strathmore.edu --password 123456 --full-name "Trainee Student"
python -m scripts.seed_account_requests
```

## Admin sessions + dashboard KPIs + landing (Prompt 9)

| Area | API | Pages |
|------|-----|-------|
| Admin session log | `GET /admin/sessions` | AdminSessions |
| Admin dashboard KPIs | `GET /admin/dashboard` | AdminDashboard (headline + KPI cards only) |
| Landing carousel | `GET /public/counsellors/featured` | LandingCounsellorCarousel |
| Landing stats | `GET /public/stats` | LandingStats |

- `frontend/src/api/admin.js` — `listAdminSessions`, `getAdminDashboard` + mappers.
- `frontend/src/api/public.js` — **NEW** — featured counsellors + public stats (no auth).
- **`sessions_count`** on counsellor reads is computed server-side (completed sessions only).
- Admin session log stats (total / upcoming / completed in page header) are derived
  **client-side from the full session list**; table search/status filters are also
  client-side (API supports `?status=` and `?search=` for future pagination).
- Dashboard analytics charts and counsellor performance table remain mock.

**Seed sessions (smoke test admin log):**

```bash
python -m scripts.seed_sessions
```

Idempotent by `(student_id, counsellor_id, preferred_date, preferred_time)`. Requires
seeded student + counsellor accounts.

## Student resources (Prompt 7)

Student read pages call the real API — they **do not** use `ResourcesContext`:

| Area | API | Pages |
|------|-----|-------|
| Resource hub + detail | `GET /resources`, `/featured`, `/{id}`, `/{id}/related`, `POST /{id}/view` | ResourceHub, ResourceDetails |
| Dashboard carousel | `GET /resources/recommended` | StudentDashboard |

- `frontend/src/api/resources.js` — list, featured, recommended, detail, related, view + snake_case→camelCase mapper.
- **Published only** on all student read endpoints; draft/pending/rejected/archived → 404 on detail, excluded from lists.
- Featured/recommended: up to 2 items; sort `featured_order ASC` (nulls last), then `published_at DESC`; recommended backfills from latest non-featured published when fewer than 2 featured.
- Category chips pass enum display strings (e.g. `"Academic Focus"`) as `?category=`.
- Resource IDs are string slugs (`featured-exam-stress`), matching `resources.id` PK.

## Resource CMS (Prompt 8)

Counsellor/admin CMS pages call the real API — they **do not** use mock resource state:

| Area | API | Pages |
|------|-----|-------|
| Counsellor submissions | `GET/POST/PUT /counsellor/resources`, `POST /{id}/submit` | CounsellorResources, CounsellorResourceForm, CounsellorResourcePreview, CounsellorDashboard widget |
| Admin CMS | `GET/POST/PUT /admin/resources`, stats, pending-review, publish/unpublish/feature/archive/restore/review | AdminResources, AdminResourceForm, AdminResourcePreview, AdminDashboard queue |

- `ResourcesContext` retains **activity-feed stubs only** (optional toast UI); CMS data is API-backed.
- Counsellor create always starts `draft`; author fields server-enforced; wrong owner / invalid edit → 404.
- Review decisions: `approve_publish`, `approve_draft`, `reject` (see `backend/description.md` § Prompt 8).

**Seed published articles:**

```bash
python -m scripts.seed_resources
```

Idempotent by `resources.id`. Seeds 7 published articles (+ 1 draft + 1 pending_review) from `mockResources.js` parity, including 2 featured rows for the hub hero.

## Local verification

1. Start backend: `uvicorn app.main:app --reload` (port 8000)
2. Seed accounts:
   - `python -m scripts.seed_admin --email admin@strathmore.edu --password 123456 --full-name "PeerPoint Admin"`
   - `python -m scripts.seed_promotion_candidate --email trainee@strathmore.edu --password 123456 --full-name "Trainee Student"`
   - (optional negative case) `python -m scripts.seed_promotion_candidate --email inreview@strathmore.edu --password 123456 --full-name "In Review Student" --in-review`
   - `python -m scripts.seed_resources`
3. Start frontend: `npm run dev` (port 5173)
4. Admin promote flow:
   - Login as **admin** → `/admin/counsellors` loads candidates + counsellors from the API.
   - The "In Review" candidate's Promote button is disabled.
   - Promote the "Training Complete" candidate → success message → they leave the
     candidates table and appear in **All Counsellors**.
   - Logout → login as **trainee** → portal chooser (student + counsellor), **not**
     `/pending-approval`. The promoted user is also visible in the student
     `GET /counsellors` directory.
5. Walk through Prompt 3 session lifecycle + Prompt 4 checklist (profile → availability → book).
