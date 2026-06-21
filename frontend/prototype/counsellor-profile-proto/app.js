const { useState } = React;
function Icon({ paths, className = "h-5 w-5", strokeWidth = 2 }) {
  return /* @__PURE__ */ React.createElement(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    },
    paths
  );
}
const MessageCircle = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement("path", { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z" }) });
const LayoutDashboard = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { width: "7", height: "9", x: "3", y: "3", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { width: "7", height: "5", x: "14", y: "3", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { width: "7", height: "9", x: "14", y: "12", rx: "1" }), /* @__PURE__ */ React.createElement("rect", { width: "7", height: "5", x: "3", y: "16", rx: "1" })) });
const Users = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }), /* @__PURE__ */ React.createElement("circle", { cx: "9", cy: "7", r: "4" }), /* @__PURE__ */ React.createElement("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }), /* @__PURE__ */ React.createElement("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })) });
const BookOpen = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" }), /* @__PURE__ */ React.createElement("path", { d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" })) });
const Calendar = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M8 2v4" }), /* @__PURE__ */ React.createElement("path", { d: "M16 2v4" }), /* @__PURE__ */ React.createElement("rect", { width: "18", height: "18", x: "3", y: "4", rx: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M3 10h18" })) });
const Settings = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "3" })) });
const LogOut = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }), /* @__PURE__ */ React.createElement("polyline", { points: "16 17 21 12 16 7" }), /* @__PURE__ */ React.createElement("line", { x1: "21", x2: "9", y1: "12", y2: "12" })) });
const ArrowLeft = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "m12 19-7-7 7-7" }), /* @__PURE__ */ React.createElement("path", { d: "M19 12H5" })) });
const Lock = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })) });
const GraduationCap = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" }), /* @__PURE__ */ React.createElement("path", { d: "M22 10v6" }), /* @__PURE__ */ React.createElement("path", { d: "M6 12.5V16a6 3 0 0 0 12 0v-3.5" })) });
const Frown = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /* @__PURE__ */ React.createElement("path", { d: "M16 16s-1.5-2-4-2-4 2-4 2" }), /* @__PURE__ */ React.createElement("line", { x1: "9", x2: "9.01", y1: "9", y2: "9" }), /* @__PURE__ */ React.createElement("line", { x1: "15", x2: "15.01", y1: "9", y2: "9" })) });
const Briefcase = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" }), /* @__PURE__ */ React.createElement("rect", { width: "20", height: "14", x: "2", y: "6", rx: "2" })) });
const UserX = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }), /* @__PURE__ */ React.createElement("circle", { cx: "9", cy: "7", r: "4" }), /* @__PURE__ */ React.createElement("line", { x1: "17", x2: "22", y1: "8", y2: "13" }), /* @__PURE__ */ React.createElement("line", { x1: "22", x2: "17", y1: "8", y2: "13" })) });
const Scale = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" }), /* @__PURE__ */ React.createElement("path", { d: "m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" }), /* @__PURE__ */ React.createElement("path", { d: "M7 21h10" }), /* @__PURE__ */ React.createElement("path", { d: "M12 3v18" }), /* @__PURE__ */ React.createElement("path", { d: "M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" })) });
const Clock = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /* @__PURE__ */ React.createElement("polyline", { points: "12 6 12 12 16 14" })) });
const Star = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }) });
const ExternalLink = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M15 3h6v6" }), /* @__PURE__ */ React.createElement("path", { d: "M10 14 21 3" }), /* @__PURE__ */ React.createElement("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" })) });
const AlertCircle = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /* @__PURE__ */ React.createElement("line", { x1: "12", x2: "12", y1: "8", y2: "12" }), /* @__PURE__ */ React.createElement("line", { x1: "12", x2: "12.01", y1: "16", y2: "16" })) });
const Info = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /* @__PURE__ */ React.createElement("path", { d: "M12 16v-4" }), /* @__PURE__ */ React.createElement("path", { d: "M12 8h.01" })) });
const Languages = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "m5 8 6 6" }), /* @__PURE__ */ React.createElement("path", { d: "m4 14 6-6 2-3" }), /* @__PURE__ */ React.createElement("path", { d: "M2 5h12" }), /* @__PURE__ */ React.createElement("path", { d: "M7 2h1" }), /* @__PURE__ */ React.createElement("path", { d: "m22 22-5-10-5 10" }), /* @__PURE__ */ React.createElement("path", { d: "M14 18h6" })) });
const Award = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "8", r: "6" })) });
const counsellor = {
  id: 1,
  name: "Brian M.",
  firstName: "Brian",
  initials: "BM",
  year: 3,
  program: "Business Science (Finance)",
  status: "available",
  role: "Peer Mentor",
  languages: ["English", "Swahili"],
  sessions: 24,
  joined: "Jan 2026",
  responseTime: "2hr",
  rating: 4.9,
  bio: "I'm a third-year finance student who understands the pressure of balancing academics, internships, and personal life at Strathmore. I believe in creating a calm, judgment-free space where you can unpack what's on your mind \u2014 whether it's exam stress, career decisions, or just feeling overwhelmed.",
  quote: "I became a peer counsellor because I realized that often, the biggest barrier to success at Strathmore isn't the coursework \u2014 it's the feeling of going through it alone. I want to be that supportive bridge for others.",
  focusAreas: [
    { label: "Exam Anxiety", icon: GraduationCap },
    { label: "Grief & Loss", icon: Frown },
    { label: "Career Pressure", icon: Briefcase },
    { label: "Social Isolation", icon: UserX },
    { label: "Work-Life Balance", icon: Scale }
  ],
  weeklyAvailability: [
    { day: "Mon", date: 12, slots: 0 },
    { day: "Tue", date: 13, slots: 3 },
    { day: "Wed", date: 14, slots: 0 },
    { day: "Thu", date: 15, slots: 2 },
    { day: "Fri", date: 16, slots: 4 }
  ],
  sharedResources: [
    { title: "Navigating Exam Stress", type: "Guide" },
    { title: "Healthy Routine Guide", type: "Worksheet" }
  ]
};
function CrisisSupportCard() {
  return /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl border border-crisis/20 bg-crisis-light p-4" }, /* @__PURE__ */ React.createElement("div", { className: "mb-2 flex items-center gap-2 text-crisis" }, /* @__PURE__ */ React.createElement(AlertCircle, { className: "h-5 w-5 shrink-0" }), /* @__PURE__ */ React.createElement("span", { className: "font-heading text-sm font-semibold" }, "Need urgent help?")), /* @__PURE__ */ React.createElement("p", { className: "mb-4 font-body text-xs font-medium text-on-surface-muted" }, "Our crisis support team is available 24/7 for immediate assistance."), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "w-full rounded-xl bg-crisis py-2 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:opacity-90"
    },
    "Contact Crisis Team"
  ));
}
function Sidebar() {
  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, active: false },
    { label: "Directory", icon: Users, active: true },
    { label: "Schedule", icon: Calendar, active: false },
    { label: "Resources", icon: BookOpen, active: false }
  ];
  return /* @__PURE__ */ React.createElement("aside", { className: "flex w-64 shrink-0 flex-col rounded-3xl border border-outline-muted/20 bg-surface shadow-[0_8px_30px_rgba(17,29,39,0.05)]" }, /* @__PURE__ */ React.createElement("div", { className: "border-b border-outline-muted/15 px-6 py-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 font-heading text-lg font-bold text-primary-dark" }, /* @__PURE__ */ React.createElement(MessageCircle, { className: "h-5 w-5 text-primary" }), "PeerPoint"), /* @__PURE__ */ React.createElement("p", { className: "mt-0.5 font-body text-xs text-on-surface-subtle" }, "Student Account")), /* @__PURE__ */ React.createElement("nav", { className: "flex-1 space-y-1 px-3 py-4" }, navItems.map((item) => {
    const NavIcon = item.icon;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: item.label,
        type: "button",
        "aria-current": item.active ? "page" : void 0,
        className: `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 ${item.active ? "bg-primary/10 text-primary-dark" : "text-on-surface-muted hover:bg-primary/5 hover:text-primary-dark"}`
      },
      /* @__PURE__ */ React.createElement(NavIcon, { className: "h-4 w-4" }),
      item.label
    );
  })), /* @__PURE__ */ React.createElement("div", { className: "px-3 pb-3" }, /* @__PURE__ */ React.createElement(CrisisSupportCard, null)), /* @__PURE__ */ React.createElement("div", { className: "space-y-2 border-t border-outline-muted/15 px-3 py-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-on-surface-muted transition-all duration-200 hover:bg-primary/5 hover:text-primary-dark"
    },
    /* @__PURE__ */ React.createElement(Settings, { className: "h-4 w-4" }),
    "Settings"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-danger transition-all duration-200 hover:bg-danger/10"
    },
    /* @__PURE__ */ React.createElement(LogOut, { className: "h-4 w-4" }),
    "Logout"
  ), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 rounded-xl bg-primary/5 px-3 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-on-primary" }, "JD"), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "truncate text-sm font-medium text-on-surface" }, "Jane Doe"), /* @__PURE__ */ React.createElement("p", { className: "truncate text-xs text-on-surface-subtle" }, "student@strathmore.edu")))));
}
function StatPill({ value, label, icon: StatIcon }) {
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-1 flex-col items-center rounded-2xl border border-outline-muted/15 bg-surface-muted/40 px-4 py-3.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm" }, StatIcon && /* @__PURE__ */ React.createElement(StatIcon, { className: "mb-1.5 h-4 w-4 text-primary" }), /* @__PURE__ */ React.createElement("p", { className: "font-heading text-xl font-extrabold text-on-surface" }, value), /* @__PURE__ */ React.createElement("p", { className: "mt-0.5 font-heading text-[10px] font-bold uppercase tracking-wider text-on-surface-subtle" }, label));
}
function FocusChip({ area }) {
  const AreaIcon = area.icon;
  return /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-2 rounded-xl border border-primary/15 bg-soft-teal/80 px-3.5 py-2 font-heading text-xs font-semibold text-primary-dark transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-soft-teal" }, /* @__PURE__ */ React.createElement(AreaIcon, { className: "h-3.5 w-3.5 text-primary" }), area.label);
}
function DayAvailabilityCard({ day, selected, onSelect }) {
  const hasSlots = day.slots > 0;
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => hasSlots && onSelect(day.day),
      disabled: !hasSlots,
      className: `group flex flex-1 flex-col items-center rounded-2xl border px-2 py-3 transition-all duration-200 ${selected ? "border-primary bg-primary/10 shadow-sm" : hasSlots ? "border-primary/20 bg-soft-teal/60 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm" : "cursor-not-allowed border-outline-muted/20 bg-surface-muted/30 opacity-60"}`
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-heading text-[10px] font-bold uppercase tracking-wide text-on-surface-subtle" }, day.day),
    /* @__PURE__ */ React.createElement(
      "span",
      {
        className: `my-1 font-heading text-lg font-extrabold ${hasSlots ? "text-primary-dark" : "text-on-surface-subtle"}`
      },
      day.date
    ),
    /* @__PURE__ */ React.createElement("div", { className: "flex h-5 items-end justify-center gap-0.5" }, hasSlots ? Array.from({ length: Math.min(day.slots, 4) }).map((_, i) => /* @__PURE__ */ React.createElement(
      "span",
      {
        key: i,
        className: `w-1.5 rounded-full bg-primary transition-all duration-200 ${selected ? "h-4" : "h-3 group-hover:h-4"}`,
        style: { height: `${8 + i * 3}px` }
      }
    )) : /* @__PURE__ */ React.createElement("span", { className: "font-body text-[10px] text-on-surface-subtle" }, "\u2014"))
  );
}
function ConnectCard({ counsellorName }) {
  return /* @__PURE__ */ React.createElement("div", { className: "overflow-hidden rounded-3xl border border-primary-dark/20 bg-gradient-to-br from-primary-dark via-primary to-primary-light shadow-[0_12px_40px_rgba(0,100,112,0.25)]" }, /* @__PURE__ */ React.createElement("div", { className: "p-6" }, /* @__PURE__ */ React.createElement("h3", { className: "font-heading text-lg font-bold text-on-primary" }, "Ready to connect?"), /* @__PURE__ */ React.createElement("p", { className: "mt-2 font-body text-sm leading-relaxed text-on-primary/85" }, "Book a confidential 30-minute introductory session to see if ", counsellorName, " is the right fit for your needs."), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "mt-5 w-full rounded-xl bg-surface py-3 font-heading text-sm font-bold text-primary-dark shadow-md transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg"
    },
    "Request a Session"
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-2.5 border-t border-on-primary/15 bg-black/10 px-5 py-4" }, /* @__PURE__ */ React.createElement(Lock, { className: "mt-0.5 h-4 w-4 shrink-0 text-on-primary/80" }), /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs leading-relaxed text-on-primary/75" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-on-primary" }, "Privacy note:"), " ", counsellorName, " won't see your name until you confirm a specific time slot.")));
}
function SharedResourcesCard({ resources }) {
  return /* @__PURE__ */ React.createElement("div", { className: "rounded-3xl border border-outline-muted/20 bg-surface p-5 shadow-[0_8px_30px_rgba(17,29,39,0.05)]" }, /* @__PURE__ */ React.createElement("div", { className: "mb-4 flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10" }, /* @__PURE__ */ React.createElement(BookOpen, { className: "h-4 w-4 text-primary" })), /* @__PURE__ */ React.createElement("h3", { className: "font-heading text-sm font-bold text-on-surface" }, "Shared Resources")), /* @__PURE__ */ React.createElement("ul", { className: "space-y-2" }, resources.map((resource) => /* @__PURE__ */ React.createElement("li", { key: resource.title }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "group flex w-full items-center justify-between gap-3 rounded-xl border border-outline-muted/15 bg-surface-muted/30 px-3.5 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-soft-teal/50"
    },
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-heading text-sm font-semibold text-primary-dark group-hover:text-primary" }, resource.title), /* @__PURE__ */ React.createElement("p", { className: "font-body text-[11px] text-on-surface-subtle" }, resource.type)),
    /* @__PURE__ */ React.createElement(ExternalLink, { className: "h-4 w-4 shrink-0 text-on-surface-subtle transition-colors group-hover:text-primary" })
  )))));
}
function CounsellorProfile() {
  const [selectedDay, setSelectedDay] = useState("Tue");
  const c = counsellor;
  const isAvailable = c.status === "available";
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-background p-5" }, /* @__PURE__ */ React.createElement("div", { className: "mx-auto flex max-w-[1320px] gap-6" }, /* @__PURE__ */ React.createElement(Sidebar, null), /* @__PURE__ */ React.createElement("div", { className: "flex min-w-0 flex-1 flex-col gap-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "inline-flex items-center gap-2 rounded-xl px-3 py-2 font-heading text-sm font-semibold text-on-surface-muted transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface hover:text-primary-dark hover:shadow-sm"
    },
    /* @__PURE__ */ React.createElement(ArrowLeft, { className: "h-4 w-4" }),
    "Back to Directory"
  ), /* @__PURE__ */ React.createElement("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-on-primary" }, "JD")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-5 xl:grid-cols-[1fr_300px]" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-5" }, /* @__PURE__ */ React.createElement("section", { className: "overflow-hidden rounded-3xl border border-outline-muted/20 bg-surface shadow-[0_8px_30px_rgba(17,29,39,0.06)]" }, /* @__PURE__ */ React.createElement("div", { className: "h-24 bg-gradient-to-r from-primary/15 via-soft-teal to-primary-accent/20" }), /* @__PURE__ */ React.createElement("div", { className: "relative px-6 pb-6" }, /* @__PURE__ */ React.createElement("div", { className: "-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-end gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement("div", { className: "flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-surface bg-gradient-to-br from-primary/20 to-primary-accent/40 font-heading text-2xl font-bold text-primary-dark shadow-lg" }, c.initials), /* @__PURE__ */ React.createElement(
    "span",
    {
      className: `absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-surface ${isAvailable ? "bg-success" : "bg-warning"}`
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "pb-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement("h1", { className: "font-heading text-2xl font-extrabold text-on-surface" }, c.name), isAvailable && /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 font-heading text-[11px] font-semibold text-success" }, /* @__PURE__ */ React.createElement("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-success" }), "Available Now")), /* @__PURE__ */ React.createElement("p", { className: "mt-1 font-body text-sm text-on-surface-muted" }, c.year, c.year === 1 ? "st" : c.year === 2 ? "nd" : c.year === 3 ? "rd" : "th", " Year \u2014", " ", c.program), /* @__PURE__ */ React.createElement("div", { className: "mt-2.5 flex flex-wrap gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-heading text-[11px] font-semibold text-primary-dark" }, /* @__PURE__ */ React.createElement(Award, { className: "h-3 w-3 text-primary" }), c.role), /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 font-heading text-[11px] font-semibold text-on-surface-muted" }, /* @__PURE__ */ React.createElement(Languages, { className: "h-3 w-3 text-primary" }), c.languages.join(" & ")), /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 rounded-full bg-accent-gold/10 px-2.5 py-1 font-heading text-[11px] font-semibold text-accent-gold" }, /* @__PURE__ */ React.createElement(Star, { className: "h-3 w-3 fill-accent-gold text-accent-gold" }), c.rating))))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 grid grid-cols-3 gap-3" }, /* @__PURE__ */ React.createElement(StatPill, { value: c.sessions, label: "Sessions" }), /* @__PURE__ */ React.createElement(StatPill, { value: c.joined, label: "Joined" }), /* @__PURE__ */ React.createElement(StatPill, { value: c.responseTime, label: "Response", icon: Clock })))), /* @__PURE__ */ React.createElement("section", { className: "rounded-3xl border border-outline-muted/20 bg-surface p-6 shadow-[0_8px_30px_rgba(17,29,39,0.05)]" }, /* @__PURE__ */ React.createElement("h2", { className: "font-heading text-lg font-bold text-on-surface" }, "About ", c.firstName), /* @__PURE__ */ React.createElement("p", { className: "mt-3 font-body text-sm leading-relaxed text-on-surface-muted" }, c.bio), /* @__PURE__ */ React.createElement("blockquote", { className: "relative mt-5 overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-r from-soft-teal/80 to-surface-muted/50 p-5 pl-6" }, /* @__PURE__ */ React.createElement(
    "span",
    {
      className: "absolute left-0 top-0 h-full w-1 bg-primary",
      "aria-hidden": "true"
    }
  ), /* @__PURE__ */ React.createElement("p", { className: "font-body text-sm italic leading-relaxed text-on-surface-muted" }, "\u201C", c.quote, "\u201D"))), /* @__PURE__ */ React.createElement("section", { className: "rounded-3xl border border-outline-muted/20 bg-surface p-6 shadow-[0_8px_30px_rgba(17,29,39,0.05)]" }, /* @__PURE__ */ React.createElement("h2", { className: "font-heading text-lg font-bold text-on-surface" }, "Focus Areas"), /* @__PURE__ */ React.createElement("p", { className: "mt-1 font-body text-sm text-on-surface-subtle" }, "Topics ", c.firstName, " is trained and comfortable supporting."), /* @__PURE__ */ React.createElement("div", { className: "mt-4 flex flex-wrap gap-2.5" }, c.focusAreas.map((area) => /* @__PURE__ */ React.createElement(FocusChip, { key: area.label, area })))), /* @__PURE__ */ React.createElement("section", { className: "rounded-3xl border border-outline-muted/20 bg-surface p-6 shadow-[0_8px_30px_rgba(17,29,39,0.05)]" }, /* @__PURE__ */ React.createElement("div", { className: "mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "font-heading text-lg font-bold text-on-surface" }, "Weekly Availability"), /* @__PURE__ */ React.createElement("p", { className: "mt-0.5 font-body text-sm text-on-surface-subtle" }, "Open slots for peer sessions this week")), selectedDay && /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-heading text-xs font-semibold text-primary" }, /* @__PURE__ */ React.createElement(Calendar, { className: "h-3.5 w-3.5" }), selectedDay, " selected")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, c.weeklyAvailability.map((day) => /* @__PURE__ */ React.createElement(
    DayAvailabilityCard,
    {
      key: day.day,
      day,
      selected: selectedDay === day.day,
      onSelect: setSelectedDay
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "mt-4 flex items-center gap-2 rounded-xl bg-surface-muted/50 px-3 py-2.5" }, /* @__PURE__ */ React.createElement(Info, { className: "h-4 w-4 shrink-0 text-primary" }), /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs text-on-surface-muted" }, "Teal bars represent open slots. Select a day to see available times when booking.")))), /* @__PURE__ */ React.createElement("aside", { className: "flex flex-col gap-5 xl:sticky xl:top-5 xl:self-start" }, /* @__PURE__ */ React.createElement(ConnectCard, { counsellorName: c.firstName }), /* @__PURE__ */ React.createElement(SharedResourcesCard, { resources: c.sharedResources }), /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl border border-outline-muted/15 bg-soft-teal/50 px-4 py-3 text-center" }, /* @__PURE__ */ React.createElement("p", { className: "font-body text-[11px] leading-relaxed text-on-surface-muted" }, "Endorsed by", " ", /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-primary-dark" }, "Strathmore University Mental Health Club"))))), /* @__PURE__ */ React.createElement("footer", { className: "flex flex-col items-center justify-between gap-2 border-t border-outline-muted/15 pt-4 sm:flex-row" }, /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs text-on-surface-subtle" }, "Endorsed by Strathmore University Mental Health Club"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "font-body text-xs text-on-surface-subtle transition-colors hover:text-primary"
    },
    "Privacy Policy"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "font-body text-xs text-on-surface-subtle transition-colors hover:text-primary"
    },
    "Contact"
  ))))));
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(/* @__PURE__ */ React.createElement(CounsellorProfile, null));
