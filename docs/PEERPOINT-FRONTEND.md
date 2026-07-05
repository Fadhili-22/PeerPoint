# PeerPoint Frontend — Study Guide

> Self-contained revision doc for panel prep and onboarding.  
> Stack: **React 18** · **Vite 6** · **React Router 6** · **Tailwind CSS**  
> Verified against repo: July 2026

---

## How to use this doc

1. Read **§1–§2** for the mental model (how UI talks to backend).
2. Use **§3** as your folder GPS.
3. Use **§6–§7** for routing and auth (high panel risk).
4. Use **§10** for end-to-end user flows.
5. Use **§12** as a cheat sheet.

**Run locally:**
```bash
cd frontend
# Create .env.development with: VITE_API_URL=http://127.0.0.1:8000
npm install
npm run dev    # http://127.0.0.1:5173
```

---

## 1. What is the frontend?

The frontend is everything the user **sees and clicks** — running in the browser.

| Piece | Role |
|-------|------|
| **Pages** | Full screens (`src/pages/`) |
| **Components** | Reusable UI chunks (`src/components/`) |
| **Layouts** | Shared chrome — nav, sidebar (`src/layouts/`) |
| **API layer** | Functions that call the backend (`src/api/`) |
| **Context** | Global state — auth, resources (`src/context/`) |
| **Router** | URL → page mapping (`src/routes/`) |

**The frontend does NOT:**
- Store passwords or DB credentials safely
- Enforce security rules (backend does — UI guards are UX only)
- Own the source of truth for sessions, users, or bookings

---

## 2. How the frontend talks to the backend

### HTTP client (`src/api/client.js`)

```javascript
const API_BASE = import.meta.env.VITE_API_URL ?? "";
// fetch(`${API_BASE}${path}`, { method, headers, body })
```

| Setting | Value |
|---------|-------|
| Env var | `VITE_API_URL` (in `frontend/.env.development`) |
| Typical dev URL | `http://127.0.0.1:8000` |
| Auth header | `Authorization: Bearer <access_token>` from `localStorage` |
| Default | `auth: true` on all calls except login/register/public |

### Error handling

- `ApiError` class — `status`, `detail`, `fieldErrors` (422 validation)
- **401** → `onUnauthorized` → clears auth (set in `AuthContext`)

### API modules → backend endpoints

| File | Domain |
|------|--------|
| `auth.js` | `/auth/*` |
| `sessions.js` | Session requests, counsellor inbox, student sessions, slots |
| `counsellors.js` | Directory, profile, availability reads |
| `counsellorProfile.js` | `/counsellor/me/profile` |
| `counsellorAvailability.js` | `/counsellor/me/availability` |
| `resources.js` | Public + counsellor + admin resources |
| `admin.js` | Admin dashboard, students, counsellors, sessions, ratings |
| `public.js` | `/public/*` (no auth) |
| `media.js` | `/media/upload` |
| `newsletter.js` | `/newsletter/subscribe` |

**Contract rule:** If backend endpoint changes, update the matching `src/api/*.js` file AND the page that calls it.

---

## 3. Folder & file map

```
frontend/
├── src/
│   ├── main.jsx              ← React entry
│   ├── App.jsx               ← Providers wrapper
│   ├── index.css             ← Tailwind globals
│   ├── api/                  ← Backend HTTP wrappers (11 files)
│   ├── components/           ← Reusable UI
│   ├── constants/            ← Static config (filters, time slots)
│   ├── context/              ← AuthContext, ResourcesContext
│   ├── data/                 ← Mock/legacy static data (mostly replaced by API)
│   ├── layouts/              ← Public, Student, Dashboard shells
│   ├── pages/                ← 36 route-level screens
│   └── routes/
│       ├── AppRouter.jsx     ← All routes
│       └── ProtectedRoute.jsx← Auth + role guards
├── prototype/                ← Early UI explorations (NOT in live router)
├── INTEGRATION.md            ← Wiring notes
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### Pages (`src/pages/`) — 36 screens

| Page | Route | Purpose |
|------|-------|---------|
| `Landing.jsx` | `/` | Marketing homepage |
| `Login.jsx` | `/login` | Sign in |
| `Signup.jsx` | `/signup` | Student registration |
| `ForgotPassword.jsx` | `/forgot-password` | Request reset email |
| `ResetPassword.jsx` | `/reset-password` | Set new password |
| `VerifyEmail.jsx` | `/verify-email` | Confirm email from link |
| `VerifyEmailPending.jsx` | `/verify-email-pending` | Post-signup waiting |
| `PendingApproval.jsx` | `/pending-approval` | Unverified counsellor hold |
| `ChoosePortal.jsx` | `/choose-portal` | Multi-role portal picker |
| `StudentDashboard.jsx` | `/student` | Student home |
| `CounsellorDirectory.jsx` | `/student/directory` | Find counsellors |
| `CounsellorProfile.jsx` | `/student/counsellors/:id` | Counsellor public profile |
| `SessionBookingPage.jsx` | `/student/book/:id` | Book a session |
| `ResourceHub.jsx` | `/student/resources` | Browse resources |
| `ResourceDetails.jsx` | `/student/resources/:id` | Read one resource |
| `MySessions.jsx` | `/student/sessions` | Requests + sessions + ratings |
| `CounsellorDashboard.jsx` | `/counsellor` | Counsellor home |
| `CounsellorRequests.jsx` | `/counsellor/requests` | Inbox accept/reject/complete |
| `CounsellorAvailability.jsx` | `/counsellor/availability` | Weekly schedule editor |
| `CounsellorProfileEdit.jsx` | `/counsellor/profile` | Edit own profile |
| `CounsellorResources.jsx` | `/counsellor/resources` | Own resource drafts |
| `CounsellorResourceForm.jsx` | `/counsellor/resources/new`, `/:id/edit` | Create/edit resource |
| `CounsellorResourcePreview.jsx` | `.../preview` | Preview before submit |
| `AdminDashboard.jsx` | `/admin` | Admin KPIs + charts |
| `AdminCounsellors.jsx` | `/admin/counsellors` | Manage + promote counsellors |
| `AdminStudents.jsx` | `/admin/students` | Manage students |
| `AdminSessions.jsx` | `/admin/sessions` | All platform sessions |
| `AdminRatings.jsx` | `/admin/ratings` | Session ratings |
| `AdminResources.jsx` | `/admin/resources` | Resource CMS |
| `AdminResourceForm.jsx` | `/admin/resources/new`, `/:id/edit` | Admin resource editor |
| `AdminResourcePreview.jsx` | `.../preview` | Admin preview |
| `PrivacyPolicy.jsx` | `/privacy-policy` | Static legal |
| `TermsOfService.jsx` | `/terms-of-service` | Static legal |
| `ContactSupport.jsx` | `/contact-support` | Static contact |
| `EmergencyInfo.jsx` | `/emergency-info` | Crisis numbers |

### Key components

| Component | Purpose |
|-----------|---------|
| `SessionRequestCTA.jsx` | "Request a Session" button → `/student/book/:id` |
| `CounsellorCard.jsx` | Directory card |
| `CounsellorMatchWidget.jsx` | Specialty quiz → filtered directory |
| `FilterDrawer.jsx` / `FilterChip.jsx` | Directory filters |
| `ProfileHeader.jsx` | Counsellor profile hero |
| `AvailabilityCard.jsx` | Weekly availability summary |
| `RejectSessionModal.jsx` | Reject with optional reason |
| `ResourceForm.jsx` | Shared resource editor |
| `ImageUploadControl.jsx` | Upload via `/media/upload` |
| `PortalSwitcher.jsx` | Switch student/counsellor/admin shell |
| `ProtectedRoute.jsx` | Auth + role route guard |
| `NewsletterSignup.jsx` | Landing newsletter form |
| `landing/*` | Landing page sections |

### Constants & data

| File | Contents |
|------|----------|
| `constants/timeSlots.js` | `TIME_SLOT_OPTIONS` — must match backend slot palette |
| `constants/counsellorFilters.js` | Topics, specialties, languages, years |
| `constants/media.js` | Max upload size, allowed image types |
| `data/mockCounsellorDashboard.js` | Placeholder response rate (94%) |
| `data/mockResources.js` | Static campus support cards + category metadata |

### Layouts

| Layout | Used for |
|--------|----------|
| `PublicLayout.jsx` | Landing, login, signup, static pages |
| `StudentPortalLayout.jsx` | All `/student/*` — top nav, crisis button, match widget |
| `DashboardLayout.jsx` | `/counsellor/*` and `/admin/*` — sidebar nav |

---

## 4. App bootstrap

```
main.jsx
  → App.jsx
      → BrowserRouter
      → AuthProvider (AuthContext)
      → ResourcesProvider
      → AppRouter
```

---

## 5. Routing (`src/routes/AppRouter.jsx`)

```
PublicLayout
  /, /login, /signup, /forgot-password, /reset-password
  /verify-email, /verify-email-pending, /pending-approval
  /privacy-policy, /terms-of-service, /contact-support, /emergency-info

ProtectedRoute (any auth)
  /choose-portal

ProtectedRoute (student) + StudentPortalLayout
  /student, /student/directory, /student/counsellors/:id
  /student/book/:id, /student/resources, /student/resources/:id
  /student/sessions

ProtectedRoute (counsellor) + DashboardLayout
  /counsellor, /counsellor/requests, /counsellor/availability
  /counsellor/profile, /counsellor/resources/*

ProtectedRoute (admin) + DashboardLayout
  /admin, /admin/counsellors, /admin/students, /admin/sessions
  /admin/ratings, /admin/resources/*
```

**Change routes here** when adding a new page.

---

## 6. Authentication (`src/context/AuthContext.jsx`)

### Stored in localStorage

| Key | Contents |
|-----|----------|
| `access_token` | JWT from login |
| `peerpoint_user` | Cached user object |
| `peerpoint_active_portal` | Last UI portal (`student` / `counsellor` / `admin`) |

### User object shape (from `auth.js` `mapAuthUser`)

```javascript
{ id, fullName, email, role, roles[], isVerified, emailVerified }
```

### Portal eligibility (`computeAvailablePortals` in `auth.js`)

| Portal | Requires |
|--------|----------|
| `student` | `student` in roles + `emailVerified` |
| `counsellor` | `counsellor` in roles + `isVerified` |
| `admin` | `admin` in roles |

### Methods

| Method | Action |
|--------|--------|
| `login(email, password)` | `POST /auth/login` → store token + user |
| `signup({...})` | `POST /auth/register` → no auto-login |
| `logout()` | `POST /auth/logout` → clear storage |
| `switchPortal(portal)` | UI only — persists `peerpoint_active_portal` |

### Boot sequence

1. If `access_token` exists → `GET /auth/me` to refresh user
2. Failure → clear token
3. Register 401 handler → auto-logout on expired token

### Post-login redirect (`resolvePostAuthRedirect`)

| Situation | Goes to |
|-----------|---------|
| One portal available | That portal's home |
| Multiple portals + saved portal | Saved portal home |
| Multiple portals, no saved | `/choose-portal` |
| Zero portals | Backend `redirect_to` (e.g. verify-email-pending) |

### Route guards (`ProtectedRoute.jsx`)

| Check | Redirect |
|-------|----------|
| Not logged in | `/login` |
| Wrong role | `/` |
| Student + `!emailVerified` | `/verify-email-pending` |
| Counsellor + `!isVerified` | `/pending-approval` |

**Panel point:** `activePortal` is **UI only**. Backend uses JWT + `user_roles` — never trusts which portal the user is viewing.

---

## 7. API reference by file

### `auth.js`

| Function | Endpoint |
|----------|----------|
| `loginRequest` | `POST /auth/login` |
| `registerRequest` | `POST /auth/register` |
| `fetchCurrentUser` | `GET /auth/me` |
| `logoutRequest` | `POST /auth/logout` |
| `forgotPassword` | `POST /auth/forgot-password` |
| `resetPassword` | `POST /auth/reset-password` |
| `verifyEmail` | `POST /auth/verify-email` |
| `resendVerificationEmail` | `POST /auth/resend-verification` |

### `sessions.js`

| Function | Endpoint |
|----------|----------|
| `createSessionRequest` | `POST /session-requests` |
| `getMySessionRequests` | `GET /session-requests/mine` |
| `getMySessions` | `GET /students/me/sessions` |
| `getMySessionDetail` | `GET /students/me/sessions/{id}` |
| `submitSessionRating` | `POST /students/me/sessions/{id}/rating` |
| `getCounsellorSessionRequests` | `GET /counsellor/session-requests` |
| `getCounsellorSessionRequestDetail` | `GET /counsellor/session-requests/{id}` |
| `acceptSessionRequest` | `POST /counsellor/session-requests/{id}/accept` |
| `rejectSessionRequest` | `POST /counsellor/session-requests/{id}/reject` |
| `completeSessionRequest` | `POST /counsellor/session-requests/{id}/complete` |
| `getCounsellorUpcomingSessions` | `GET /counsellor/me/sessions/upcoming` |
| `getCounsellorSlots` | `GET /counsellors/{id}/slots?date=` |

### `counsellors.js`

| Function | Endpoint |
|----------|----------|
| `listCounsellors` | `GET /counsellors?search&language&year&specialties` |
| `getCounsellor` | `GET /counsellors/{id}` |
| `getCounsellorAvailability` | `GET /counsellors/{id}/availability` |

### `counsellorProfile.js` / `counsellorAvailability.js`

| Function | Endpoint |
|----------|----------|
| `getMyCounsellorProfile` | `GET /counsellor/me/profile` |
| `updateMyCounsellorProfile` | `PUT /counsellor/me/profile` |
| `getMyAvailability` | `GET /counsellor/me/availability` |
| `updateMyAvailability` | `PUT /counsellor/me/availability` |

### `admin.js` (highlights)

| Function | Endpoint |
|----------|----------|
| `getAdminDashboard` | `GET /admin/dashboard` |
| `getAdminAnalytics` | `GET /admin/analytics` |
| `listAdminCounsellors` | `GET /admin/counsellors` |
| `promoteCounsellor` | `POST /admin/counsellors/promote/{userId}` |
| `demoteCounsellor` | `POST /admin/counsellors/{userId}/demote` |
| `toggleCounsellorActive` | `POST /admin/counsellors/{userId}/toggle-active` |
| `listAdminStudents` | `GET /admin/students` |
| `toggleStudentActive` | `POST /admin/students/{userId}/toggle-active` |
| `listAdminSessions` | `GET /admin/sessions` |
| `listAdminRatings` | `GET /admin/ratings` |

**Note:** `listAccountRequests` / `approveAccountRequest` / `rejectAccountRequest` exist in `admin.js` but are **not wired to any page yet**.

### `public.js` / `newsletter.js` / `media.js`

| Function | Endpoint | Auth |
|----------|----------|------|
| `getFeaturedCounsellors` | `GET /public/counsellors/featured` | No |
| `getPublicStats` | `GET /public/stats` | No |
| `subscribeToNewsletter` | `POST /newsletter/subscribe` | No |
| `uploadMedia` | `POST /media/upload` | Yes |

---

## 8. Three-layer change model

| Layer | Location | Change when… |
|-------|----------|--------------|
| **UI** | `pages/`, `components/` | What user sees, form fields, buttons |
| **API wrapper** | `src/api/*.js` | Endpoint path, payload mapping, response mapping |
| **Route/guard** | `AppRouter.jsx`, `ProtectedRoute.jsx` | New page, who can access |

**Backend must also change** for new fields, rules, or endpoints — see `PEERPOINT-BACKEND.md`.

---

## 9. Key user flows

### A. Student signup

```
Signup.jsx
  → AuthContext.signup()
  → POST /auth/register { full_name, email, password, admission_number, phone, role: "student" }
  → Navigate /verify-email-pending
  → Email link → VerifyEmail.jsx → POST /auth/verify-email
  → ProtectedRoute allows /student/* once emailVerified
```

Client validations: `@strathmore.edu`, password match, privacy checkbox.

### B. Login

```
Login.jsx
  → POST /auth/login
  → Store access_token + user
  → resolvePostAuthRedirect → portal home or choose-portal or pending pages
  → 403 ACCOUNT_INACTIVE → "account deactivated" message
```

### C. Session booking (student)

```
CounsellorDirectory → GET /counsellors
CounsellorProfile → GET /counsellors/:id
  → SessionRequestCTA → /student/book/:id
SessionBookingPage:
  → GET /counsellors/:id
  → GET /counsellors/:id/availability
  → GET /counsellors/:id/slots?date= (per selected date)
  → POST /session-requests { counsellor_id, topic, preferred_date, preferred_time, format, notes, anonymous_until_accepted }
MySessions:
  → GET /session-requests/mine (pending/rejected)
  → GET /students/me/sessions (accepted/completed)
  → POST /students/me/sessions/:id/rating
```

### D. Counsellor session lifecycle

```
CounsellorRequests.jsx (or dashboard quick actions)
  → GET /counsellor/session-requests
  → POST .../accept | .../reject | .../complete
  → GET .../session-requests/:id (detail — student contact after accept)
```

Anonymous students show masked name until accepted (enforced **backend-side**; UI reflects API response).

### E. Admin promote counsellor

```
AdminCounsellors.jsx → Promote tab
  → GET /admin/counsellors/promotable-students?search=
  → POST /admin/counsellors/promote/{userId}
  → Backend sets is_verified=True, grants counsellor role, creates profile
  → User can access /counsellor (no longer /pending-approval)
```

### F. Dual-role users

User with both `student` and `counsellor` roles:
- `ChoosePortal.jsx` or `PortalSwitcher.jsx` picks UI shell
- Each route group applies its own `ProtectedRoute` guard
- API always sends same JWT — backend checks role per endpoint

---

## 10. Cheat sheet — common changes

| I need to change… | File(s) |
|-------------------|---------|
| Add a new page | `pages/NewPage.jsx` + `AppRouter.jsx` + maybe `ProtectedRoute` role |
| Student nav links | `StudentPortalLayout.jsx` |
| Counsellor/admin sidebar | `DashboardLayout.jsx` → `navByRole` |
| Login/signup form fields | `Login.jsx` / `Signup.jsx` + `auth.js` + backend schema |
| Session booking form | `SessionBookingPage.jsx` + `sessions.js` + backend |
| Counsellor accept/reject UI | `CounsellorRequests.jsx` + `RejectSessionModal.jsx` |
| Directory filters | `CounsellorDirectory.jsx` + `counsellorFilters.js` + `counsellors.js` |
| Landing carousel | `LandingCounsellorCarousel.jsx` + `public.js` |
| Resource article display | `ResourceDetails.jsx` + `ResourceArticleView.jsx` |
| Admin KPI cards | `AdminDashboard.jsx` + `admin.js` |
| Image upload | `ImageUploadControl.jsx` + `media.js` |
| Who can see a route | `ProtectedRoute.jsx` |
| API base URL | `frontend/.env.development` → `VITE_API_URL` |
| Post-login redirect logic | `auth.js` → `resolvePostAuthRedirect` |
| Portal availability rules | `auth.js` → `computeAvailablePortals` |

---

## 11. Architecture diagram

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ pages/      │  │ components/  │  │ layouts/      │ │
│  └──────┬──────┘  └──────────────┘  └───────────────┘ │
│         │                                               │
│  ┌──────▼──────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ AuthContext │  │ AppRouter    │  │ ProtectedRoute│ │
│  └──────┬──────┘  └──────────────┘  └───────────────┘ │
│         │                                               │
│  ┌──────▼──────────────────────────────────────────┐  │
│  │ src/api/*.js  →  client.js  →  fetch()           │  │
│  └──────┬──────────────────────────────────────────┘  │
└─────────┼─────────────────────────────────────────────┘
          │ HTTP + JWT
          ▼
   FastAPI backend (see PEERPOINT-BACKEND.md)
```

---

## 12. Panel one-liners

- **Why separate api/ folder?** Single place for endpoint paths and payload mapping; pages stay UI-focused.
- **Why ProtectedRoute?** UX guard — redirects unauthenticated users; real security is backend `Depends()`.
- **Why activePortal?** Multi-role users pick which dashboard shell to wear; not used for API authorization.
- **Why localStorage for token?** Persists login across refresh; trade-off vs httpOnly cookies (document if asked).
- **Mock data still in repo?** `data/mockResources.js` has static campus cards; live counsellors/sessions/admin use API.

---

## 13. Known quirks

- `frontend/.env.development` not in repo — must create locally
- `prototype/` folders are not wired to `AppRouter`
- `listAccountRequests` API exists but no admin UI page yet
- `MOCK_COUNSELLOR_RESPONSE_RATE` in dashboard is placeholder
- Deleted mock files (per git status) — app now uses live API for admin/counsellors/sessions

---

*Companion doc: `PEERPOINT-BACKEND.md`*
