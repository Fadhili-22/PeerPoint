/*
 * THROWAWAY PROTOTYPE — PeerPoint Admin Dashboard redesign.
 * Self-contained: runs via React UMD + Babel + Tailwind CDN (see index.html).
 * NOT wired into the production app. Safe to review or delete.
 * Colors stay strictly within tailwind.config.js tokens.
 * crisis / crisis-light are NOT used anywhere here.
 */
const { useState } = React;

/* ----------------------------- Inline icons ------------------------------ */
/* Mirror lucide-react glyphs as inline SVG (no npm import in the CDN sandbox). */
function Icon({ paths, className = "h-5 w-5", strokeWidth = 2 }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
}

const Users = (p) => (
  <Icon {...p} paths={<>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>} />
);
const Headphones = (p) => (
  <Icon {...p} paths={<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a9 9 0 0 1 18 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />} />
);
const Calendar = (p) => (
  <Icon {...p} paths={<>
    <path d="M8 2v4" /><path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </>} />
);
const Clock = (p) => (
  <Icon {...p} paths={<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>} />
);
const BookOpen = (p) => (
  <Icon {...p} paths={<>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </>} />
);
const TrendingUp = (p) => (
  <Icon {...p} paths={<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>} />
);
const AlertTriangle = (p) => (
  <Icon {...p} paths={<>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" /><path d="M12 17h.01" />
  </>} />
);
const Bell = (p) => (
  <Icon {...p} paths={<>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </>} />
);
const Search = (p) => (
  <Icon {...p} paths={<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>} />
);
const Plus = (p) => (
  <Icon {...p} paths={<><path d="M5 12h14" /><path d="M12 5v14" /></>} />
);
const ChevronRight = (p) => (
  <Icon {...p} paths={<path d="m9 18 6-6-6-6" />} />
);
const CheckCircle = (p) => (
  <Icon {...p} paths={<><path d="M21.801 10A10 10 0 1 1 17 3.335" /><path d="m9 11 3 3L22 4" /></>} />
);
const XCircle = (p) => (
  <Icon {...p} paths={<><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></>} />
);
const Filter = (p) => (
  <Icon {...p} paths={<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />} />
);
const Zap = (p) => (
  <Icon {...p} paths={<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />} />
);
const ShieldCheck = (p) => (
  <Icon {...p} paths={<>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </>} />
);
const Heart = (p) => (
  <Icon {...p} paths={<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />} />
);
const Activity = (p) => (
  <Icon {...p} paths={<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />} />
);

/* ------------------------------- Mock data ------------------------------- */
const kpis = [
  { id: "students", label: "Total Students", value: "2,840", trend: "+12%",
    sub: "vs. last term", Icon: Users, chip: "bg-primary/10 text-primary" },
  { id: "counsellors", label: "Active Counsellors", value: "48", trend: "+4%",
    sub: "38 online now", Icon: Headphones, chip: "bg-soft-teal text-primary" },
  { id: "sessions", label: "Sessions This Month", value: "512", trend: "+18%",
    sub: "Goal 600", Icon: Calendar, chip: "bg-primary-accent/30 text-primary" },
  { id: "pending", label: "Pending Approvals", value: "11", urgent: true,
    sub: "3 urgent · waiting >24h", Icon: Clock, chip: "bg-accent-gold/15 text-accent-gold" },
  { id: "resources", label: "Resources Published", value: "156", trend: "+6%",
    sub: "Last 7 days", Icon: BookOpen, chip: "bg-primary-accent/30 text-primary" },
];

const accountRequests = [
  { id: 1, name: "Eric Mutua", email: "emutua@strathmore.edu", initials: "EM",
    role: "Counsellor Promotion", date: "Oct 22", status: "Pending Review" },
  { id: 2, name: "Alice Lemayian", email: "alemayian@strathmore.edu", initials: "AL",
    role: "New Student Signup", date: "Oct 23", status: "Verifying ID" },
  { id: 3, name: "Brian Ochieng", email: "bochieng@strathmore.edu", initials: "BO",
    role: "Counsellor Promotion", date: "Oct 24", status: "Pending Review" },
  { id: 4, name: "Faith Wanjiku", email: "fwanjiku@strathmore.edu", initials: "FW",
    role: "New Student Signup", date: "Oct 24", status: "Verifying ID" },
];

const resourceRequests = [
  { id: 1, name: "Dr. Anne Kiama", email: "akiama@strathmore.edu", initials: "AK",
    role: "Managing Social Anxiety on Campus", date: "Oct 25", status: "Pending Review" },
  { id: 2, name: "Samuel Mutua", email: "smutua@strathmore.edu", initials: "SM",
    role: "Sleep Hygiene for Students", date: "Oct 25", status: "Pending Review" },
  { id: 3, name: "Grace Mwangi", email: "gmwangi@strathmore.edu", initials: "GM",
    role: "Building Resilience During Exams", date: "Oct 26", status: "Awaiting Edit" },
];

const attentionItems = [
  { id: 1, title: "Delayed Responses", desc: "3 sessions waiting on a counsellor for >24h.",
    Icon: AlertTriangle, tone: "danger" },
  { id: 2, title: "Counsellor Availability", desc: '"Stress Management" demand at 95% capacity.',
    Icon: Zap, tone: "warning" },
  { id: 3, title: "System Update", desc: "Monthly report data is ready for export.",
    Icon: ShieldCheck, tone: "info" },
];

const weeks = [
  { label: "W1", value: 42, h: 40 },
  { label: "W2", value: 58, h: 55 },
  { label: "W3", value: 74, h: 70 },
  { label: "W4", value: 90, h: 86 },
  { label: "W5", value: 63, h: 60 },
  { label: "W6", value: 79, h: 75 },
  { label: "W7", value: 53, h: 50 },
  { label: "W8", value: 100, h: 96 },
];

const statusSegments = [
  { label: "Completed", percent: 60, dash: "60, 100", offset: 0, color: "text-primary", dot: "bg-primary" },
  { label: "Upcoming", percent: 25, dash: "25, 100", offset: -60, color: "text-accent-gold", dot: "bg-accent-gold" },
  { label: "Cancelled", percent: 15, dash: "15, 100", offset: -85, color: "text-danger", dot: "bg-danger" },
];

const counsellors = [
  { id: 1, name: "Dr. Jane Foster", handled: 142, rate: 98, label: "Excellent",
    tone: "success", status: "Online Now", online: true, last: "Active 5m ago" },
  { id: 2, name: "Anne Kiama", handled: 115, rate: 94, label: "Excellent",
    tone: "success", status: "Online Now", online: true, last: "Active 12m ago" },
  { id: 3, name: "Prof. Mark Otieno", handled: 98, rate: 82, label: "Average",
    tone: "warning", status: "Away", online: false, last: "Yesterday, 16:40" },
];

const activity = [
  { id: 1, title: "Counsellor Promotion Approved", desc: "Eric Mutua promoted to Peer Counsellor",
    time: "12 mins ago", dot: "bg-primary" },
  { id: 2, title: "Critical Alert: Delay", desc: "3 sessions flagged for response lag",
    time: "1 hr ago", dot: "bg-accent-gold" },
  { id: 3, title: "New Student Verified", desc: "Alice Lemayian verified her Strathmore email",
    time: "3 hrs ago", dot: "bg-primary-light" },
  { id: 4, title: "Resource Approved", desc: '"Mindfulness 101" published to the hub',
    time: "5 hrs ago", dot: "bg-primary" },
];

/* ------------------------------ Subcomponents ----------------------------- */
function KpiCard({ kpi }) {
  const { Icon: I } = kpi;
  return (
    <article
      className={`group rounded-3xl bg-surface p-5 shadow-[0_8px_30px_rgba(17,29,39,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(17,29,39,0.10)] ${
        kpi.urgent ? "ring-2 ring-accent-gold/40 bg-gradient-to-br from-surface to-accent-gold/5" : ""
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className={`rounded-2xl p-2.5 transition-transform duration-300 group-hover:scale-105 ${kpi.chip}`}>
          <I className="h-5 w-5" />
        </div>
        {kpi.urgent ? (
          <span className="rounded-full bg-accent-gold px-2.5 py-1 font-heading text-[10px] font-bold uppercase tracking-wide text-on-primary">
            Urgent
          </span>
        ) : (
          <span className="flex items-center gap-0.5 rounded-full bg-success/10 px-2 py-1 font-body text-[11px] font-bold text-success">
            {kpi.trend}
            <TrendingUp className="h-3 w-3" />
          </span>
        )}
      </div>
      <p className="font-heading text-[11px] font-semibold uppercase tracking-wide text-on-surface-subtle">
        {kpi.label}
      </p>
      <h3 className="mt-1 font-heading text-[40px] font-extrabold leading-none text-on-surface">
        {kpi.value}
      </h3>
      <p className="mt-2 font-body text-xs text-on-surface-muted">{kpi.sub}</p>
    </article>
  );
}

function StatusPill({ status }) {
  return (
    <span className="rounded-full bg-accent-gold/10 px-2.5 py-1 font-body text-[11px] font-bold text-accent-gold">
      {status}
    </span>
  );
}

function PendingApprovals() {
  const [tab, setTab] = useState("accounts");
  const rows = tab === "accounts" ? accountRequests : resourceRequests;
  const isResource = tab === "resources";

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-3xl bg-surface shadow-[0_8px_30px_rgba(17,29,39,0.06)]">
      <div className="flex items-center justify-between gap-4 border-b border-outline-muted/15 p-6">
        <div role="tablist" aria-label="Request categories" className="flex gap-5">
          {[
            { key: "accounts", label: `New Accounts`, count: accountRequests.length },
            { key: "resources", label: `New Resources`, count: resourceRequests.length },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`pb-1 font-heading text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                tab === t.key
                  ? "border-b-2 border-primary font-bold text-primary"
                  : "font-semibold text-on-surface-subtle hover:text-primary"
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>
        <button
          type="button"
          className="flex items-center gap-1 font-heading text-sm font-semibold text-primary transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          View All <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-muted/60 font-heading text-[11px] font-bold uppercase tracking-wide text-on-surface-subtle">
              <th scope="col" className="px-6 py-3">Applicant</th>
              <th scope="col" className="px-6 py-3">{isResource ? "Submission" : "Role"}</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-muted/15">
            {rows.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-soft-teal/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-soft-teal font-heading text-xs font-bold text-primary">
                      {r.initials}
                    </div>
                    <div>
                      <p className="font-heading text-sm font-semibold text-on-surface">{r.name}</p>
                      <p className="font-body text-xs text-on-surface-subtle">{r.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-body text-sm text-on-surface-muted">{r.role}</td>
                <td className="px-6 py-4 font-body text-sm text-on-surface-muted">{r.date}</td>
                <td className="px-6 py-4"><StatusPill status={r.status} /></td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      aria-label={`Approve ${r.name}`}
                      className="rounded-xl p-2 text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-soft-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Reject ${r.name}`}
                      className="rounded-xl p-2 text-danger transition-all duration-200 hover:-translate-y-0.5 hover:bg-danger/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const attentionTone = {
  danger: { ring: "bg-danger/10", title: "text-danger", icon: "text-danger" },
  warning: { ring: "bg-accent-gold/10", title: "text-accent-gold", icon: "text-accent-gold" },
  info: { ring: "bg-soft-teal", title: "text-primary", icon: "text-primary" },
};

function AttentionCard() {
  return (
    <section className="rounded-3xl border-l-4 border-danger bg-surface p-6 shadow-[0_8px_30px_rgba(17,29,39,0.06)]">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-danger" />
        <h2 className="font-heading text-base font-bold text-on-surface">Attention Needed</h2>
      </div>
      <div className="space-y-3">
        {attentionItems.map((a) => {
          const t = attentionTone[a.tone];
          const I = a.Icon;
          return (
            <div key={a.id} className={`flex gap-3 rounded-2xl p-3 ${t.ring}`}>
              <I className={`mt-0.5 h-4 w-4 shrink-0 ${t.icon}`} />
              <div>
                <p className={`font-heading text-sm font-bold ${t.title}`}>{a.title}</p>
                <p className="font-body text-xs text-on-surface-muted">{a.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* Dark "hero" focal card — the bento contrast element (primary-dark tokens). */
function PlatformHealthHero() {
  const satisfaction = 92;
  const circumference = 2 * Math.PI * 26;
  const offset = circumference - (satisfaction / 100) * circumference;
  return (
    <section className="rounded-3xl bg-surface-dark p-6 text-on-primary shadow-[0_18px_45px_rgba(17,29,39,0.28)]">
      <div className="mb-5 flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary-accent" />
        <h2 className="font-heading text-base font-bold">Platform Health</h2>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative inline-flex shrink-0 items-center justify-center">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="26" fill="transparent" stroke="rgba(164,238,253,0.18)" strokeWidth="6" />
            <circle cx="32" cy="32" r="26" fill="transparent" stroke="#A4EEFD" strokeWidth="6"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
          </svg>
          <span className="absolute font-heading text-lg font-bold">{satisfaction}%</span>
        </div>
        <div>
          <p className="font-body text-xs uppercase tracking-wide text-on-dark-accent/70">Satisfaction</p>
          <p className="font-heading text-sm font-semibold text-on-primary/90">Excellent — trending up</p>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-heading text-3xl font-extrabold">38</span>
            <span className="font-body text-sm text-on-dark-accent/70">/48 active</span>
          </div>
        </div>
      </div>
      <div className="mt-5 border-t border-on-primary/10 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-body text-xs text-on-primary/80">Avg Response Time</span>
          <span className="font-heading text-xs font-bold text-primary-accent">1.8h</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-on-primary/15">
          <div className="h-1.5 rounded-full bg-primary-accent" style={{ width: "80%" }} />
        </div>
      </div>
    </section>
  );
}

function SessionAnalytics() {
  return (
    <section className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgba(17,29,39,0.06)] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(17,29,39,0.10)]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-base font-bold text-on-surface">Session Analytics</h2>
          <p className="font-body text-xs text-on-surface-subtle">Weekly completed sessions</p>
        </div>
        <select
          aria-label="Analytics period"
          className="rounded-xl bg-surface-muted px-3 py-1.5 font-body text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary-light"
          defaultValue="8w"
        >
          <option value="8w">Last 8 Weeks</option>
          <option value="6m">Last 6 Months</option>
        </select>
      </div>
      <div className="flex h-44 items-end justify-between gap-2.5">
        {weeks.map((w) => {
          const isPeak = w.h >= 86;
          return (
            <div key={w.label} className="group flex h-full flex-1 flex-col items-center justify-end">
              <span className="mb-1 font-heading text-[10px] font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                {w.value}
              </span>
              <div
                className={`w-full rounded-t-lg transition-all duration-300 ${isPeak ? "bg-primary" : "bg-primary-light/35 group-hover:bg-primary-light/60"}`}
                style={{ height: `${Math.round((w.h / 100) * 150)}px` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between font-heading text-[10px] font-bold uppercase tracking-wide text-on-surface-subtle">
        {weeks.map((w) => <span key={w.label} className="flex-1 text-center">{w.label}</span>)}
      </div>
    </section>
  );
}

function StatusDistribution() {
  return (
    <section className="flex flex-col rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgba(17,29,39,0.06)] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(17,29,39,0.10)]">
      <h2 className="mb-4 font-heading text-base font-bold text-on-surface">Status Distribution</h2>
      <div className="flex flex-1 items-center gap-5">
        <div className="relative h-32 w-32 shrink-0">
          <svg className="h-full w-full" viewBox="0 0 36 36" aria-hidden="true">
            {statusSegments.map((s) => (
              <path
                key={s.label}
                className={s.color}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={s.dash}
                strokeDashoffset={s.offset}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-heading text-2xl font-extrabold text-on-surface">512</span>
            <span className="font-body text-[10px] uppercase text-on-surface-subtle">Sessions</span>
          </div>
        </div>
        <div className="space-y-3">
          {statusSegments.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
              <span className="font-body text-sm text-on-surface">{s.label}</span>
              <span className="font-heading text-sm font-bold text-on-surface-muted">{s.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function toneBadge(tone) {
  return tone === "success" ? "bg-success/10 text-success" : "bg-accent-gold/10 text-accent-gold";
}

function CounsellorPerformance() {
  return (
    <section className="overflow-hidden rounded-3xl bg-surface shadow-[0_8px_30px_rgba(17,29,39,0.06)]">
      <div className="flex items-center justify-between border-b border-outline-muted/15 p-6">
        <h2 className="font-heading text-base font-bold text-on-surface">Counsellor Performance</h2>
        <button
          type="button"
          aria-label="Filter counsellors"
          className="rounded-full p-2 text-on-surface-subtle transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-muted/60 font-heading text-[11px] font-bold uppercase tracking-wide text-on-surface-subtle">
              <th scope="col" className="px-6 py-3">Counsellor</th>
              <th scope="col" className="px-6 py-3">Handled</th>
              <th scope="col" className="px-6 py-3">Response Rate</th>
              <th scope="col" className="px-6 py-3">Availability</th>
              <th scope="col" className="px-6 py-3">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-muted/15">
            {counsellors.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-soft-teal/30">
                <td className="px-6 py-4 font-heading text-sm font-semibold text-on-surface">{c.name}</td>
                <td className="px-6 py-4 font-body text-sm text-on-surface-muted">{c.handled} sessions</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 font-body text-[11px] font-bold ${toneBadge(c.tone)}`}>{c.rate}%</span>
                    <span className="font-body text-[11px] text-on-surface-subtle">{c.label}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${c.online ? "bg-success" : "bg-outline-muted"}`} />
                    <span className={`font-body text-xs ${c.online ? "text-on-surface" : "text-on-surface-subtle"}`}>{c.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-body text-xs text-on-surface-subtle">{c.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ActivityFeed() {
  return (
    <section className="flex flex-col rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgba(17,29,39,0.06)]">
      <div className="mb-5 flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="font-heading text-base font-bold text-on-surface">Platform Activity</h2>
      </div>
      <div className="relative flex-1 space-y-5 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-0.5 before:bg-outline-muted/20">
        {activity.map((a) => (
          <div key={a.id} className="relative flex gap-4 pl-1">
            <span className={`z-10 mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ring-surface ${a.dot}`} />
            <div>
              <p className="font-heading text-sm font-semibold leading-tight text-on-surface">{a.title}</p>
              <p className="font-body text-xs text-on-surface-muted">{a.desc}</p>
              <span className="font-heading text-[10px] font-bold uppercase tracking-wide text-on-surface-subtle">{a.time}</span>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-5 w-full rounded-2xl bg-surface-muted py-2.5 font-heading text-sm font-semibold text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-soft-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        View All Activity
      </button>
    </section>
  );
}

/* --------------------------------- Shell --------------------------------- */
function Sidebar() {
  const items = [
    { label: "Dashboard", active: true },
    { label: "Manage Counsellors" },
    { label: "Manage Students" },
    { label: "Sessions" },
    { label: "Resource Hub" },
    { label: "Reports" },
    { label: "Settings" },
  ];
  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-1 rounded-3xl bg-surface p-4 shadow-[0_8px_30px_rgba(17,29,39,0.05)] lg:flex">
      <div className="mb-4 flex items-center gap-2 px-2 py-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary font-heading text-sm font-extrabold text-on-primary">P</span>
        <span className="font-heading text-lg font-extrabold text-primary">PeerPoint</span>
      </div>
      {items.map((it) => (
        <button
          key={it.label}
          type="button"
          className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left font-heading text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            it.active
              ? "bg-primary font-bold text-on-primary shadow-sm"
              : "font-semibold text-on-surface-muted hover:bg-surface-muted hover:text-primary"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${it.active ? "bg-on-primary" : "bg-outline-muted"}`} />
          {it.label}
        </button>
      ))}
      <div className="mt-auto rounded-2xl bg-soft-teal p-4">
        <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-primary">Endorsed by</p>
        <p className="mt-1 font-body text-xs text-on-surface-muted">Strathmore University Mental Health Club</p>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="flex items-center gap-4">
      <div className="relative flex-1 sm:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
        <input
          type="search"
          placeholder="Search platform analytics..."
          aria-label="Search platform analytics"
          className="w-full rounded-2xl border-none bg-surface py-2.5 pl-10 pr-4 font-body text-sm text-on-surface shadow-[0_4px_18px_rgba(17,29,39,0.05)] transition-all focus:outline-none focus:ring-2 focus:ring-primary-light"
        />
      </div>
      <button
        type="button"
        aria-label="View notifications"
        className="relative rounded-full bg-surface p-2.5 text-on-surface-muted shadow-[0_4px_18px_rgba(17,29,39,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
      </button>
      <div className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-1.5 shadow-[0_4px_18px_rgba(17,29,39,0.05)]">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-heading text-xs font-bold text-on-primary">SA</div>
        <div className="hidden sm:block">
          <p className="font-heading text-sm font-bold leading-tight text-on-surface">Admin Sarah</p>
          <p className="font-body text-[11px] text-on-surface-subtle">Administrator</p>
        </div>
      </div>
    </header>
  );
}

function PrototypeAdminDashboard() {
  return (
    <div className="min-h-screen bg-background p-5">
      <div className="mx-auto flex max-w-[1320px] gap-6">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Topbar />

          {/* Page header */}
          <section className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h1 className="font-heading text-[34px] font-extrabold leading-tight text-on-surface">Platform Overview</h1>
              <p className="font-body text-sm text-on-surface-muted">
                Monitor platform health, counsellor activity, and student engagement.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-2.5 shadow-[0_4px_18px_rgba(17,29,39,0.05)]">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-heading text-sm font-bold text-on-surface">Jun 18, 2026 · 02:46 PM</span>
            </div>
          </section>

          {/* KPI row */}
          <section aria-label="Platform key metrics" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {kpis.map((k) => <KpiCard key={k.id} kpi={k} />)}
          </section>

          {/* Main bento: approvals (8) + attention/health (4) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8"><PendingApprovals /></div>
            <div className="flex flex-col gap-6 lg:col-span-4">
              <AttentionCard />
              <PlatformHealthHero />
            </div>
          </div>

          {/* Analytics bento: sessions (7) + status (5) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7"><SessionAnalytics /></div>
            <div className="lg:col-span-5"><StatusDistribution /></div>
          </div>

          {/* Bottom bento: performance (8) + activity (4) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8"><CounsellorPerformance /></div>
            <div className="lg:col-span-4"><ActivityFeed /></div>
          </div>

          <footer className="flex flex-col items-center justify-between gap-3 border-t border-outline-muted/30 pt-6 pb-2 md:flex-row">
            <p className="font-body text-xs text-on-surface-subtle">Endorsed by Strathmore University Mental Health Club</p>
            <div className="flex gap-6">
              <a href="#" className="font-body text-xs text-on-surface-subtle transition-colors hover:text-primary">Privacy Policy</a>
              <a href="#" className="font-body text-xs text-on-surface-subtle transition-colors hover:text-primary">Contact Support</a>
              <a href="#" className="font-body text-xs text-on-surface-subtle transition-colors hover:text-primary">Terms of Service</a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PrototypeAdminDashboard />);
