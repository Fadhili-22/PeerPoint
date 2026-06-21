# PeerPoint Frontend → Backend Requirements Audit

**Audit date:** 21 June 2026  
**Scope:** Current Vite + React 18 frontend as implemented in `src/` — re-derived from routes, contexts, pages, components, and mock data.  
**Purpose:** Handoff document for backend/API design before production integration.

---

## 1. Executive Summary

The frontend is a **mock-authenticated, mostly read-only demo** with two areas of **real in-session state management**:

| Area | Persistence today | Backend needed |
|------|-------------------|----------------|
| Auth (login/signup/logout) | `localStorage` | Full auth service |
| Resources (admin + counsellor CMS) | React state only — **lost on refresh** | Full resource API + media storage |
| Sessions, requests, availability, admin tables | Static mock JS | Full domain APIs |
| Landing counsellor carousel | Static `mockCounsellors.js` | Public counsellor listing API |

**New since prior audits (now reflected below):**

1. **Landing counsellor carousel** (`LandingCounsellorCarousel.jsx`) — cycles peer counsellors where `availabilityStatus === "available"`, with empty-state fallback.
2. **Admin resource management** — dedicated routes under `/admin/resources/*` with create, edit, publish/unpublish, feature, archive/restore, and counsellor-submission review workflow wired through `ResourcesContext`.

---

## 2. Application Architecture (Frontend)

```
App.jsx
├── AuthProvider          → localStorage user + registered users
├── ResourcesProvider     → in-memory resource CMS (NOT persisted)
└── AppRouter             → role-gated routes via ProtectedRoute
```

**Layouts:**
- `PublicLayout` — `/`, `/login`, `/signup`, `/pending-approval`
- `StudentPortalLayout` — student routes + `CrisisHelpButton`
- `DashboardLayout` — counsellor + admin sidebar nav

**No HTTP client exists.** All “API behavior” is implied by UI actions that mutate local state or mock arrays.

---

## 3. Auth & Authorization

### 3.1 Public user shape (stored in session)

```js
{
  id: number,
  fullName: string,
  email: string,           // must end with @strathmore.edu
  role: "student" | "counsellor" | "admin",
  isVerified: boolean
}
```

Password is **never** exposed to the client after signup (stored in mock/localStorage server-side equivalent).

### 3.2 Account lifecycle (business rules)

| Rule | Frontend behavior | Backend implication |
|------|-------------------|---------------------|
| Signup | Students only; `role: "student"`, `isVerified: true` | Reject counsellor/admin self-registration |
| Email domain | Must end with `@strathmore.edu`; inline error if not | Server-side validation required |
| Duplicate email | `"An account with this email already exists."` | Unique constraint on email |
| Password (signup UI) | `minLength={8}` on form | Enforce ≥8 chars server-side |
| Student ID (signup UI) | Collected but **not saved** anywhere | Decide: persist as `studentId` or drop field |
| Counsellor creation | Admin promotes student (`AdminCounsellors`) | `PATCH /users/:id/role` or promotion endpoint |
| Admin accounts | Predefined (`admin@strathmore.edu`) | Seed/system accounts only |
| Counsellor verification | `isVerified: false` → `/pending-approval` | Admin approval sets `isVerified: true` |
| Test accounts | student/counsellor/admin @strathmore.edu, password `123456` | Seed data for demo |

### 3.3 Route protection (`ProtectedRoute.jsx`)

| Condition | Redirect |
|-----------|----------|
| Not authenticated | `/login` |
| Wrong role | `/` |
| Counsellor + `!isVerified` | `/pending-approval` |

**Gap:** `/pending-approval` is **public** (not inside `ProtectedRoute`). Unauthenticated users can view it.

### 3.4 Post-login redirects

| Role | Verified | Redirect |
|------|----------|----------|
| student | — | `/student` |
| counsellor | yes | `/counsellor` |
| counsellor | no | `/pending-approval` |
| admin | — | `/admin` |

### 3.5 Implied auth endpoints

| Method | Path | Auth | Role | Request | Response |
|--------|------|------|------|---------|----------|
| POST | `/auth/signup` | None | — | `{ fullName, email, password }` | `{ user, token }` or field errors |
| POST | `/auth/login` | None | — | `{ email, password }` | `{ user, token, redirectTo }` |
| POST | `/auth/logout` | Bearer | Any | — | `204` |
| GET | `/auth/me` | Bearer | Any | — | Public user object |
| POST | `/auth/forgot-password` | None | — | `{ email }` | **Coming Soon in UI** |
| POST | `/auth/reset-password` | Token | — | `{ token, newPassword }` | **Not in UI yet** |

**Token strategy not chosen in frontend.** Expect JWT or session cookie; frontend will need an interceptor and `GET /auth/me` on app load.

---

## 4. Database Models (Implied)

### 4.1 `users`

```js
{
  id: number | uuid,
  fullName: string,
  email: string,              // unique, @strathmore.edu
  passwordHash: string,
  role: "student" | "counsellor" | "admin",
  isVerified: boolean,
  studentId: string | null,   // UI collects this — not persisted yet
  createdAt: ISO8601,
  updatedAt: ISO8601,
  lastActiveAt: ISO8601 | null
}
```

### 4.2 `counsellor_profiles`

Directory, profile, booking, and admin views use **different shapes** today — backend should unify.

```js
{
  id: string | uuid,          // ⚠️ frontend uses string "1"–"12" in directory, numeric in admin mock
  userId: number,             // FK → users
  fullName: string,
  shortName: string,
  initials: string,
  year: number,               // study year 2–4
  program: string | null,
  bio: string,
  quote: string | null,
  specialties: string[],
  languages: string[],
  photoUrl: string | null,
  rating: number,
  sessionsCount: number,
  joinedAt: ISO8601,
  // Real-time presence
  availabilityStatus: "available" | "busy" | "offline",
  isOnline: boolean,
  busyUntil: string | null,   // e.g. "4:00 PM"
  availabilityNote: string,
  responseTime: string,
  // Booking
  weeklySlots: { [dayOfWeek: 0-6]: string[] },  // e.g. ["9:00 AM", "2:00 PM"]
  unavailableDates: string[], // YYYY-MM-DD
  // Admin
  status: "active" | "inactive",
  lastActiveAt: ISO8601
}
```

### 4.3 `counsellor_availability_schedule` (normalized alternative)

```js
{
  counsellorId,
  dayOfWeek: 0-6,
  enabled: boolean,
  slots: string[]             // from fixed palette in mockCounsellorAvailability.js
}
```

### 4.4 `promotion_candidates` / training records

From `mockAdminCounsellors.js`:

```js
{
  id,
  userId,
  name, email,
  course: string,
  year: string,
  trainingStatus: "Training Complete" | "In Review" | ...,
  sessionsAttended: number,
  appliedOn: date
}
```

Promotion action should: set `users.role = "counsellor"`, create `counsellor_profiles`, set `isVerified` per policy.

### 4.5 `session_requests` (student → counsellor)

Created by booking flow; **not persisted** in frontend.

```js
{
  id,
  studentId,
  counsellorId,
  topic: enum,                // sessionTopics in mockCounsellors.js
  otherTopic: string | null, // required when topic === "Other"
  preferredDate: date,        // YYYY-MM-DD
  preferredTime: string,      // e.g. "2:00 PM"
  format: "in-person" | "video" | "phone",
  notes: string | null,       // max 500 chars
  anonymousUntilAccepted: boolean,
  status: "pending" | "accepted" | "rejected" | "completed",
  requestedAt: ISO8601,
  overdue: boolean            // computed: >24h pending
}
```

**⚠️ Status vocabulary mismatch across UI:**
- Student sessions: `confirmed` | `pending`
- Counsellor requests: `pending` | `accepted` | `rejected` | `completed`
- Admin sessions: `completed` | `upcoming` | `cancelled`

Backend must define a **single state machine** and map to role-specific labels.

### 4.6 `sessions` (confirmed bookings)

```js
{
  id: string,                 // e.g. "S-1042"
  requestId: number | null,
  studentId,
  counsellorId,
  scheduledAt: ISO8601,
  topic: string,
  format: string,
  durationMinutes: number,    // UI shows 45–60 min
  status: "upcoming" | "completed" | "cancelled",
  outcome: "Resolved" | "Follow-up Booked" | "Rescheduled" | "No-show" | "Pending",
  notes: string | null,
  // For counsellor dashboard display
  studentDisplayId: string    // e.g. "Anonymous M." or student name
}
```

### 4.7 `resources` (Mental Health Resources CMS)

Canonical shape from `mockResources.js` + `ResourcesContext`:

```js
{
  id: string,                 // slugified from title, e.g. "featured-exam-stress"
  slug: string,
  title: string,
  category: enum,             // Anxiety | Depression | Stress | Academic Focus | Self-Care | Relationships
  description: string,
  readTime: string,           // display string, e.g. "5 min read"
  author: string,
  authorRole: string,
  image: string,              // URL today — should become storage key/URL
  imageAlt: string,
  body: string[],             // array of paragraphs
  status: "draft" | "pending_review" | "published" | "rejected" | "archived",
  featured: boolean,
  featuredOrder: number | null,
  publishedAt: ISO8601 | null,
  createdAt, updatedAt: ISO8601,
  lastEditedBy: string,       // display name — should become userId FK
  submittedBy: { id, fullName, email } | null,
  submittedAt, reviewedBy, reviewedAt: ISO8601 | null,
  rejectionReason: string | null,
  views: number,
  saves: number
}
```

**No hard delete in UI** — only `archived` status + `restore → draft`.

### 4.8 `resource_saves` (implied, not implemented)

Admin dashboard and reports show `saves` counts; student UI has no save button yet. Model anyway:

```js
{ userId, resourceId, savedAt }
```

### 4.9 `students` (admin view extensions)

```js
{
  userId,
  course, year,
  sessions: number,
  engagement: "High" | "Medium" | "Low",
  status: "active" | "inactive" | "at-risk",
  summary: string,
  lastActiveAt
}
```

### 4.10 `platform_activity` / notifications

Admin dashboard merges `adminResourceActivity` (in-memory) + `platformActivity` (mock). Implied:

```js
{
  id, title, description,
  variant: "primary" | "warning" | "info" | "success",
  entityType, entityId,
  createdAt,
  relativeTime: string       // computed
}
```

### 4.11 `newsletter_subscriptions`

```js
{ email, subscribedAt, active: boolean }
```

### 4.12 `account_approval_requests` (admin dashboard tab)

From `newAccountRequests` — mixes signup verification and counsellor promotion:

```js
{
  id, userId,
  type: "signup" | "promotion",
  name, email, role: string,
  status: "Pending Review" | "Verifying ID",
  date, note
}
```

---

## 5. API Endpoints

Convention: all authenticated routes use `Authorization: Bearer <token>` unless noted.

### 5.1 Public / landing

| Method | Path | Auth | Role | Query / body | Response |
|--------|------|------|------|--------------|----------|
| GET | `/public/counsellors/featured` | None | — | `?status=available&limit=N` | `{ counsellors: CounsellorCard[] }` |
| GET | `/public/stats` | None | — | — | `{ counsellorCount, studentsSupported, ... }` |

**Carousel requirements:** Returns counsellors with `availabilityStatus === "available"` only. Fields used: `id`, `shortName`, `initials`, `photoUrl`, `specialties[]` (first 2 shown), `bio`, `availabilityNote`. Empty array → frontend shows empty state.

**⚠️ Landing CTA mismatch:** Carousel “Request Session” links to `/signup`, not booking. Hero “Browse Resources” links to `/login`, not resources.

### 5.2 Counsellor directory (student)

| Method | Path | Auth | Role | Notes |
|--------|------|------|------|-------|
| GET | `/counsellors` | Student | student | Search, filters: availability, specialties[], language, year |
| GET | `/counsellors/:id` | Student | student | Full profile + weekly availability summary |
| GET | `/counsellors/:id/availability` | Student | student | `weeklySlots`, `unavailableDates`, slots for date |
| GET | `/counsellors/:id/slots` | Student | student | `?date=YYYY-MM-DD` → `{ slots: string[] }` |

**Filter enums (from `mockCounsellors.js`):**
- `sessionTopics`: Academic Stress, Anxiety, Relationships, Career Guidance, Time Management, Other
- `directoryFilterChips` specialties overlap but include Personal Growth, Stress
- `counsellorLanguages`: English, Swahili, French
- `studyYears`: 2, 3, 4
- Availability filter `available-now` → `availabilityStatus === "available"`

### 5.3 Session requests & sessions

| Method | Path | Auth | Role | Body | Response |
|--------|------|------|------|------|----------|
| POST | `/session-requests` | Student | student | See §4.5 | `{ id, status: "pending" }` |
| GET | `/session-requests/mine` | Student | student | — | Student’s pending/confirmed view |
| GET | `/counsellor/session-requests` | Counsellor | counsellor | `?status=` | Request list |
| GET | `/counsellor/session-requests/:id` | Counsellor | counsellor | — | Detail incl. message, duration |
| POST | `/counsellor/session-requests/:id/accept` | Counsellor | counsellor | — | Creates session; may reveal student identity |
| POST | `/counsellor/session-requests/:id/reject` | Counsellor | counsellor | `{ reason? }` | Updated request |
| GET | `/students/me/sessions` | Student | student | — | Upcoming sessions |
| GET | `/students/me/sessions/:id` | Student | student | — | Detail modal fields |
| PATCH | `/counsellor/me/availability-status` | Counsellor | counsellor | `{ isAvailable: boolean }` | Toggle on dashboard |
| GET | `/counsellor/me/sessions/upcoming` | Counsellor | counsellor | — | Dashboard schedule |

**Booking validation (frontend):**
- Topic required; if `Other`, free-text required
- Date ≥ today; must not be in counsellor’s `unavailableDates`; day must have slots
- Time must be in available slots for that date
- Format required: `in-person` | `video` | `phone`
- Notes optional, max 500 chars
- `anonymousUntilAccepted` optional boolean

**⚠️ Format enum mismatch:** Counsellor request UI uses `mode: "online" | "in-person"` — booking uses `video` | `phone` | `in-person`. Align before backend.

**⚠️ Privacy copy mismatch:**
- Booking page: “counsellor will only see your information after you submit the request”
- Profile CTA: “won't see your name until you confirm a specific time slot”
- Counsellor mock data shows `Anonymous M.` — implies anonymity until acceptance

### 5.4 Counsellor availability management

| Method | Path | Auth | Role | Body | Response |
|--------|------|------|------|------|----------|
| GET | `/counsellor/me/availability` | Counsellor | counsellor | — | Weekly schedule + online toggle |
| PUT | `/counsellor/me/availability` | Counsellor | counsellor | `{ schedule[], isOnline }` | Saved schedule |

**Slot palette** (`timeSlotOptions` in `mockCounsellorAvailability.js`): fixed list of AM/PM strings. Backend should either enforce this enum or accept free-form times with validation.

### 5.5 Resources — student (read)

| Method | Path | Auth | Role | Notes |
|--------|------|------|------|-------|
| GET | `/resources` | Student | student | `?category=&search=` — **published only** |
| GET | `/resources/featured` | Student | student | `?limit=2` — published + featured, sorted by `featuredOrder` then `publishedAt` |
| GET | `/resources/:id` | Student | student | Published only; 404 otherwise |
| GET | `/resources/:id/related` | Student | student | Same category first, limit 3 |
| POST | `/resources/:id/view` | Student | student | Increment views (not called in UI yet) |

### 5.6 Resources — counsellor (submissions)

| Method | Path | Auth | Role | Body | Notes |
|--------|------|------|------|------|-------|
| GET | `/counsellor/resources` | Counsellor | counsellor | — | Filter by status |
| POST | `/counsellor/resources` | Counsellor | counsellor | Resource payload | Creates draft; auto-sets `submittedBy`, author locked |
| PUT | `/counsellor/resources/:id` | Counsellor | counsellor | Payload | Only owner; only `draft` or `rejected` |
| POST | `/counsellor/resources/:id/submit` | Counsellor | counsellor | — | Validates completeness → `pending_review` |

**Submittable when:** title, category, description, image, imageAlt, ≥1 body paragraph (see `isResourceSubmittable`).

**Blocked edits:** `pending_review`, `published` (UI shows read-only message).

### 5.7 Resources — admin (CMS) — **NEW full capability**

| Method | Path | Auth | Role | Body | Notes |
|--------|------|------|------|------|-------|
| GET | `/admin/resources` | Admin | admin | `?status=&search=` | All statuses |
| GET | `/admin/resources/stats` | Admin | admin | — | total, published, drafts, pendingReview, featured, archived |
| POST | `/admin/resources` | Admin | admin | Payload + `publish?: boolean` | Create draft or publish |
| PUT | `/admin/resources/:id` | Admin | admin | Payload | Edit any resource |
| POST | `/admin/resources/:id/publish` | Admin | admin | — | Sets `published`, `publishedAt` |
| POST | `/admin/resources/:id/unpublish` | Admin | admin | — | → `draft`, clears `publishedAt` |
| POST | `/admin/resources/:id/feature` | Admin | admin | `{ featured, featuredOrder? }` | |
| POST | `/admin/resources/:id/archive` | Admin | admin | — | → `archived` |
| POST | `/admin/resources/:id/restore` | Admin | admin | — | → `draft` |
| GET | `/admin/resources/pending-review` | Admin | admin | — | Counsellor submissions queue |
| POST | `/admin/resources/:id/review` | Admin | admin | `{ decision, rejectionReason? }` | See decisions below |

**Review decisions (`ResourcesContext.reviewResource`):**
- `approve_publish` → `published`
- `approve_draft` → `draft` (admin edits before publishing)
- `reject` → `rejected` + optional `rejectionReason`

Side effects today: pushes activity to counsellor + admin activity feeds.

### 5.8 Admin — users & platform

| Method | Path | Auth | Role | Notes |
|--------|------|------|------|-------|
| GET | `/admin/dashboard` | Admin | admin | KPIs, health, analytics aggregates |
| GET | `/admin/account-requests` | Admin | admin | Signup + promotion queue |
| POST | `/admin/account-requests/:id/approve` | Admin | admin | |
| POST | `/admin/account-requests/:id/reject` | Admin | admin | |
| GET | `/admin/students` | Admin | admin | Search, status filter |
| GET | `/admin/students/:id` | Admin | admin | Activity modal |
| GET | `/admin/counsellors` | Admin | admin | Active/inactive filter |
| GET | `/admin/counsellors/promotion-candidates` | Admin | admin | |
| POST | `/admin/counsellors/promote/:userId` | Admin | admin | Requires training complete |
| GET | `/admin/sessions` | Admin | admin | Session log |
| GET | `/admin/reports/*` | Admin | admin | Analytics, trends, exports |
| GET | `/admin/notifications` | Admin | admin | Activity feed |

Most admin pages are **read-only mock tables** except resource review (wired) and account approve/reject (local state only).

### 5.9 Newsletter

| Method | Path | Auth | Body | Validation |
|--------|------|------|------|------------|
| POST | `/newsletter/subscribe` | None | `{ email }` | `@strathmore.edu` suffix |

---

## 6. Business Logic & Validation Rules

### 6.1 Auth
- Email must end with `@strathmore.edu` (login + signup + newsletter)
- Signup requires privacy checkbox agreement (links are Coming Soon)
- New users: `role: "student"`, `isVerified: true`
- Counsellor accounts: admin promotion + verification flow

### 6.2 Resource CMS

| Action | Who | Rules |
|--------|-----|-------|
| Create | Admin | All fields validated in `ResourceForm`; can publish immediately |
| Create | Counsellor | Author/role locked; always starts `draft`; no featured flags |
| Submit for review | Counsellor | Completeness check; → `pending_review` |
| Review | Admin | 3 decision paths; rejection reason optional in UI |
| Feature | Admin | Only on published; order positive integer or auto-assigned |
| Archive | Admin | Hidden from student hub; restorable to draft |
| Edit published | Counsellor | **Blocked** — intentional product rule in UI |

**ID generation:** slug from title with numeric suffix if collision (`ResourcesContext.ensureUniqueId`).

### 6.3 Featured resources
- Student hub shows up to **2** featured published resources in hero when no search/filter active
- Sort: `featuredOrder` ASC (nulls last), then `publishedAt` DESC

### 6.4 Counsellor directory & booking
- Past dates blocked
- Dates with no weekly slots or in `unavailableDates` blocked
- Landing carousel: only `availabilityStatus === "available"`

### 6.5 Session request SLA
- UI copy: counsellor responds within **24 hours**
- Admin “Attention Needed”: flags requests waiting **>24h**
- Counsellor dashboard shows request **age** and `overdue` flag

### 6.6 Promotion
- Promote button disabled unless `trainingStatus === "Training Complete"`

---

## 7. File Upload / Media Requirements

**Current state:** Resource forms accept **image URL strings** only (`type="url"` input). All images are external Google CDN URLs in mock data.

**Backend should provide:**

| Need | Suggested approach |
|------|-------------------|
| Resource cover images | `POST /media/upload` → `{ url, key }` or presigned S3 URL |
| Counsellor profile photos | Same; most counsellors use initials fallback when `photoUrl` null |
| Validation | MIME: jpeg/png/webp; max size TBD; require `imageAlt` for accessibility |
| Body content | Array of plain-text paragraphs today — no rich text/markdown |

**No video/audio upload** in current UI.

---

## 8. Third-Party Integration Points

| Integration | UI location | Status |
|-------------|-------------|--------|
| Google Fonts (Plus Jakarta Sans, Work Sans) | `index.html` | Active — CDN |
| External image URLs | Resources, counsellors, dashboard cards | Active — should migrate to owned storage |
| Email service | Signup verification, pending approval, password reset | **Implied, not built** |
| Crisis helpline / emergency routing | `CrisisHelpButton` | **Coming Soon** — needs real phone/link integration |
| Video sessions | Booking format “Video Call”, counsellor dashboard | **Coming Soon** — likely WebRTC or external link (Zoom/Teams) |
| Newsletter | `NewsletterSignup` | Mock success only |
| Report exports (PDF/CSV) | `AdminReports` | **Coming Soon** |
| Strathmore SSO | Not in UI | Future consideration for `@strathmore.edu` verification |

---

## 9. Inconsistencies, Ambiguities & Risks

### 🔴 High — resolve before backend schema freeze

1. **Three different session status models** (student `confirmed/pending`, counsellor `pending/accepted/rejected/completed`, admin `completed/upcoming/cancelled`). Define one canonical lifecycle.

2. **Session format enums differ** (`in-person/video/phone` vs `online/in-person`). Map explicitly.

3. **Counsellor ID types inconsistent** — directory uses string IDs (`"1"`), admin mock uses numbers, `users.id` is numeric. Use UUID everywhere or document mapping.

4. **Two unrelated counsellor datasets** — `mockCounsellors.js` (student-facing, 12 peer counsellors) vs `mockAdminCounsellors.js` (admin tables with “Dr. Jane Foster”). Same product entity, different names/counts.

5. **Student dashboard `recommendedResources`** uses numeric IDs `1`, `2` — **do not match** real resource slugs (`featured-exam-stress`, etc.). Links to `/student/resources/1` will 404 against `ResourcesContext`.

6. **Resources not persisted** — unlike auth, all admin/counsellor resource work is lost on page refresh. Backend is blocking for CMS.

7. **Signup `studentId` collected but discarded** — backend must decide to store or remove from UI.

8. **Auth `signup()` accepts `role` param** but only Signup page calls it (always `"student"`). Counsellor/admin signup paths exist in code but are unreachable — remove or guard server-side.

### 🟡 Medium

9. **Privacy/anonymity rules inconsistent** across booking page, profile CTA, and counsellor request mock names (`Anonymous M.`).

10. **`isVerified` on signup** sets `role !== "counsellor"` — irrelevant for current signup flow; counsellor verification only matters after promotion.

11. **Admin dashboard resource KPI** (`156 published`) is static mock — doesn’t read from `ResourcesContext.stats`.

12. **Views/saves counters** displayed in admin tables but never incremented when students read articles.

13. **Shared resources on counsellor profile** link to `/student/resources` hub, not specific articles — placeholder behavior.

14. **Landing stats** (`120+` counsellors, `500+` students) are static marketing copy, not tied to API data.

15. **Admin account-request “Verifying ID” status** — no UI or workflow for ID verification exists beyond label text.

16. **Counsellor profile `weeklyAvailability`** shows slot *counts* per weekday; booking uses actual time strings — related but different representations.

### 🟢 Low / product decisions

17. **No resource hard-delete** — archive only. Confirm retention policy.

18. **Counsellor cannot edit published resources** — by design in UI; confirm for v1.

19. **Featured order** can be blank (null) — sorts after ordered items.

20. **`readTime`** is a free-text display field, not computed from body length.

21. **Admin reject from dashboard** calls `reviewResource` with empty rejection reason — modal on dedicated admin resources page allows reason, dashboard quick-reject does not.

---

## 10. Non-Functional / “Coming Soon” UI

| Feature | Component / location |
|---------|---------------------|
| Forgot password | `Login.jsx` |
| Privacy Policy, Terms, Contact Support | Auth footers, landing footer, multiple pages |
| Settings | `DashboardLayout`, `StudentPortalLayout` sidebars |
| Crisis “Contact Crisis Team” | `CrisisHelpButton.jsx` |
| Join Mental Health Club | `SupportNetworkCard` |
| Admin “Publish New” (dashboard shortcut) | `AdminDashboard.jsx` — `/admin/resources/new` exists and works via nav |
| Report exports (PDF/CSV) | `AdminReports.jsx` |
| Admin book session for student | `AdminStudents.jsx` |
| Counsellor “View Session” (video room) | `CounsellorDashboard.jsx` |
| Landing footer links | `LandingFooter.jsx` |

---

## 11. Route → Required Endpoint Mapping

| Route | Auth | Role | Primary endpoints |
|-------|------|------|-------------------|
| `/` | None | — | `GET /public/counsellors/featured`, `GET /public/stats` |
| `/login` | None | — | `POST /auth/login` |
| `/signup` | None | — | `POST /auth/signup` |
| `/pending-approval` | None* | counsellor (unverified) | `GET /auth/me` (optional) |
| `/student` | Yes | student | `GET /students/me/sessions`, `GET /resources/recommended` |
| `/student/directory` | Yes | student | `GET /counsellors` |
| `/student/counsellors/:id` | Yes | student | `GET /counsellors/:id` |
| `/student/book/:id` | Yes | student | `GET /counsellors/:id/availability`, `POST /session-requests` |
| `/student/resources` | Yes | student | `GET /resources`, `GET /resources/featured` |
| `/student/resources/:id` | Yes | student | `GET /resources/:id`, `GET /resources/:id/related` |
| `/student/sessions` | Yes | student | `GET /students/me/sessions` |
| `/counsellor` | Yes | counsellor | `GET /counsellor/session-requests`, `GET /counsellor/me/sessions/upcoming`, `PATCH /counsellor/me/availability-status`, `GET /counsellor/resources` |
| `/counsellor/requests` | Yes | counsellor | `GET /counsellor/session-requests`, accept/reject actions |
| `/counsellor/resources` | Yes | counsellor | `GET /counsellor/resources`, submit action |
| `/counsellor/resources/new` | Yes | counsellor | `POST /counsellor/resources` |
| `/counsellor/resources/:id/edit` | Yes | counsellor | `PUT /counsellor/resources/:id` |
| `/counsellor/resources/:id/preview` | Yes | counsellor | `GET /counsellor/resources/:id` |
| `/counsellor/availability` | Yes | counsellor | `GET/PUT /counsellor/me/availability` |
| `/admin` | Yes | admin | `GET /admin/dashboard`, account requests, resource pending review |
| `/admin/counsellors` | Yes | admin | `GET /admin/counsellors`, promotion, promote |
| `/admin/students` | Yes | admin | `GET /admin/students` |
| `/admin/sessions` | Yes | admin | `GET /admin/sessions` |
| `/admin/resources` | Yes | admin | Full resource CMS + review queue |
| `/admin/resources/new` | Yes | admin | `POST /admin/resources` |
| `/admin/resources/:id/edit` | Yes | admin | `PUT /admin/resources/:id` |
| `/admin/resources/:id/preview` | Yes | admin | `GET /admin/resources/:id` |
| `/admin/reports` | Yes | admin | `GET /admin/reports/*`, export endpoints (future) |

---

## 12. Recommended Backend Priorities

1. **Auth + `@strathmore.edu` validation + role routing** — unblocks everything else.  
2. **Unified counsellor model** — merge student directory, profile, admin, and landing carousel data sources.  
3. **Session request → session state machine** — core product flow; align enums first.  
4. **Resource API + media upload** — admin CMS is UI-complete but non-persistent; counsellor submission workflow depends on it.  
5. **Availability API** — counsellor schedule + real-time status for carousel/directory.  
6. **Analytics/admin aggregates** — lower priority; most dashboards are illustrative mock data today.

---

## 13. Context Providers → Backend Service Mapping

| Frontend module | Becomes |
|-----------------|---------|
| `AuthContext` | Auth service + user repository |
| `ResourcesContext` | Resource service (admin + counsellor + student read paths) |
| `mockCounsellors.js` + booking helpers | Counsellor + availability service |
| `mockCounsellorRequests.js` + booking page | Session request service |
| `mockStudentDashboard.js` (sessions) | Student session service |
| `mockAdmin*.js` | Admin aggregation / reporting services |
| `LandingCounsellorCarousel` | `GET /public/counsellors/featured?status=available` |
| `NewsletterSignup` | Newsletter subscription service |

This audit reflects the codebase as it exists today. Resolve the flagged inconsistencies — especially session statuses, counsellor identity, and resource persistence — before locking API contracts or database migrations.