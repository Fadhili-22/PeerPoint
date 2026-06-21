# PeerPoint Frontend — Project Rules
(Save this content as a file literally named `.cursorrules` in your project root — no extension, no "cursorrules.md".)

## Context
PeerPoint is a peer counselling platform for Strathmore University. This is the frontend-only phase: mock auth, no backend calls, realistic placeholder data only. The goal is a clean, demoable UI — not a finished product.

## Tech Stack
- Vite + React 18
- React Router v6
- Tailwind CSS
- React Context for state (no Redux/Zustand/other state libs)
- lucide-react for all icons (no inline SVGs unless lucide doesn't have the icon)
- One component per file

## Folder Structure
```
src/
├── components/   (shared UI: Button, Card, Badge, Input, CrisisSupportCard, etc.)
├── context/      (AuthContext.jsx)
├── data/         (mock data files)
├── layouts/      (PublicLayout, DashboardLayout)
├── pages/        (actual screens — Landing, Login, Signup, dashboards, etc.)
├── routes/       (AppRouter.jsx, ProtectedRoute.jsx — routing config only, no screens here)
├── App.jsx
├── main.jsx
└── index.css
```

## Design Tokens (registered in tailwind.config.js theme.extend.colors)
- primary: #006470
- primary-light: #2D7D8A
- primary-dark: #004E59
- primary-accent: #A4EEFD
- background: #F7F9FF
- surface: #FFFFFF
- surface-muted: #ECF4FF
- surface-dark: #26323D
- soft-teal: #E9F2F3
- on-surface: #111D27
- on-surface-muted: #3F484A
- on-surface-subtle: #6F797B
- on-primary: #FFFFFF
- on-dark-accent: #A4EEFD
- outline: #6F797B
- outline-muted: #BEC8CA
- accent-gold: #E79D19
- strathmore-blue: #02338D
- success: #10B981
- warning: #F59E0B
- danger: #EF4444
- crisis: #CC0000
- crisis-light: #FFDAD4

### Usage rules
- `primary` = main interactive color (buttons, links, focus rings). `primary-light` = secondary/decorative accent only — never the main CTA color.
- Body/secondary text uses `on-surface-muted` or `on-surface-subtle` — never raw `gray-*`.
- `surface-dark` is for dark backgrounds (footer) only — never as text color.
- Star ratings use `accent-gold`, not `warning`.
- `crisis`/`crisis-light` remain reserved for CrisisSupportCard only.

## CRITICAL COLOR RULE
`crisis` and `crisis-light` exist ONLY for the CrisisSupportCard component (the 24/7 emergency helpline card seen on student/counsellor dashboards). Never use `crisis` colors for buttons, nav items, badges, links, active states, or anything else anywhere in the app. If something needs urgent/error styling outside the crisis card, use `danger`, not `crisis`. This is a hard rule, not a style suggestion.

## Typography
- Headings: `font-heading` → Plus Jakarta Sans
- Body: `font-body` → Work Sans
- Both loaded via Google Fonts `<link>` tags in `index.html`, and mapped in `tailwind.config.js` under `theme.extend.fontFamily`.

## Visual Style
Calm, trustworthy, soft, student-friendly, modern. Generous spacing, rounded corners (`rounded-xl` / `rounded-2xl`), layered cards, soft shadows, subtle gradients where tasteful. Avoid sharp corners, dense enterprise-SaaS layouts, or default Bootstrap-looking components.

## Interactions (required on all interactive elements)
- Buttons: hover → `scale(1.02)` + `translateY(-2px)`, smooth transition
- Cards: subtle lift/shadow increase on hover
- Inputs: animated focus state with a visible focus ring
- No static, lifeless interfaces

## Auth (mock only — no API calls anywhere in this phase)
User shape:
```js
{ id, fullName, email, role: "student" | "counsellor" | "admin", isVerified }
```
Test logins:
- student@strathmore.edu / 123456 → redirect /student
- counsellor@strathmore.edu / 123456 → redirect /counsellor if isVerified, else /pending-approval
- admin@strathmore.edu / 123456 → redirect /admin

Signup validation: email must end in `@strathmore.edu` for both student and counsellor signup. If not, show an inline error: "Please use your Strathmore University email address." Do not block on this silently — show the message under the email field.

## Mock Data
Keep schemas generic and simple for now — they are NOT meant to mirror the production database schema yet (that'll be aligned later once the backend is finalized). Just enough shape to make the dashboards look realistic: counsellor profiles (bio, specialties, availability), sessions, pending requests, recent activity, platform stats.

## Output Rules
No TODOs. No omitted files. No placeholder comments like `// add logic here`. Every file must be complete and runnable as written.


## When converting Stitch HTML into React:

Preserve the visual hierarchy, spacing, section ordering,
and layout structure of the source design.

Refactor only for code quality, reusability, accessibility,
and React best practices.

Do not redesign sections unless explicitly requested.