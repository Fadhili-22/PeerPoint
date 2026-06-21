const { useState, useMemo } = React;
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
const Settings = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }), /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "3" })) });
const LogOut = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }), /* @__PURE__ */ React.createElement("polyline", { points: "16 17 21 12 16 7" }), /* @__PURE__ */ React.createElement("line", { x1: "21", x2: "9", y1: "12", y2: "12" })) });
const Search = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "11", cy: "11", r: "8" }), /* @__PURE__ */ React.createElement("path", { d: "m21 21-4.3-4.3" })) });
const Shield = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement("path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }) });
const Clock = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /* @__PURE__ */ React.createElement("polyline", { points: "12 6 12 12 16 14" })) });
const Star = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }) });
const X = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M18 6 6 18" }), /* @__PURE__ */ React.createElement("path", { d: "m6 6 12 12" })) });
const ChevronDown = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement("path", { d: "m6 9 6 6 6-6" }) });
const Sparkles = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" }), /* @__PURE__ */ React.createElement("path", { d: "M5 3v4" }), /* @__PURE__ */ React.createElement("path", { d: "M19 17v4" }), /* @__PURE__ */ React.createElement("path", { d: "M3 5h4" }), /* @__PURE__ */ React.createElement("path", { d: "M17 19h4" })) });
const AlertCircle = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /* @__PURE__ */ React.createElement("line", { x1: "12", x2: "12", y1: "8", y2: "12" }), /* @__PURE__ */ React.createElement("line", { x1: "12", x2: "12.01", y1: "16", y2: "16" })) });
const SlidersHorizontal = (p) => /* @__PURE__ */ React.createElement(Icon, { ...p, paths: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("line", { x1: "21", x2: "14", y1: "4", y2: "4" }), /* @__PURE__ */ React.createElement("line", { x1: "10", x2: "3", y1: "4", y2: "4" }), /* @__PURE__ */ React.createElement("line", { x1: "21", x2: "12", y1: "12", y2: "12" }), /* @__PURE__ */ React.createElement("line", { x1: "8", x2: "3", y1: "12", y2: "12" }), /* @__PURE__ */ React.createElement("line", { x1: "21", x2: "16", y1: "20", y2: "20" }), /* @__PURE__ */ React.createElement("line", { x1: "12", x2: "3", y1: "20", y2: "20" }), /* @__PURE__ */ React.createElement("line", { x1: "14", x2: "14", y1: "2", y2: "6" }), /* @__PURE__ */ React.createElement("line", { x1: "8", x2: "8", y1: "10", y2: "14" }), /* @__PURE__ */ React.createElement("line", { x1: "16", x2: "16", y1: "18", y2: "22" })) });
const focusAreas = [
  "Anxiety",
  "Academic Stress",
  "Relationships",
  "Personal Growth",
  "Time Management",
  "Stress",
  "Grief",
  "Social Anxiety"
];
const counsellors = [
  {
    id: 1,
    name: "Brian M.",
    year: 3,
    initials: "BM",
    specialties: ["Anxiety", "Academic Stress"],
    bio: "I focus on grounding techniques and study-life balance. Sessions feel calm, structured, and judgment-free.",
    status: "available",
    responseTime: "Usually replies within 1h",
    sessions: 48,
    rating: 4.9,
    languages: ["English", "Swahili"],
    avatarTone: "from-primary/20 to-primary-accent/40"
  },
  {
    id: 2,
    name: "Sarah A.",
    year: 4,
    initials: "SA",
    specialties: ["Relationships", "Personal Growth"],
    bio: "I help students navigate friendships, dating, and self-discovery with empathy and practical reflection tools.",
    status: "available",
    responseTime: "Usually replies within 2h",
    sessions: 62,
    rating: 4.8,
    languages: ["English"],
    avatarTone: "from-soft-teal to-surface-muted"
  },
  {
    id: 3,
    name: "Emmanuel K.",
    year: 2,
    initials: "EK",
    specialties: ["Time Management", "Stress"],
    bio: "Former student rep who understands deadline pressure. We build realistic plans that actually stick.",
    status: "busy",
    busyUntil: "4:00 PM",
    responseTime: "Back online at 4 PM",
    sessions: 31,
    rating: 4.7,
    languages: ["English", "French"],
    avatarTone: "from-accent-gold/20 to-warning/10"
  },
  {
    id: 4,
    name: "Lisa W.",
    year: 3,
    initials: "LW",
    specialties: ["Grief", "Social Anxiety"],
    bio: "A gentle space for students processing loss or feeling isolated. We move at your pace \u2014 never rushed.",
    status: "available",
    responseTime: "Usually replies within 3h",
    sessions: 39,
    rating: 5,
    languages: ["English"],
    avatarTone: "from-primary-light/25 to-soft-teal"
  },
  {
    id: 5,
    name: "Grace N.",
    year: 4,
    initials: "GN",
    specialties: ["Anxiety", "Stress"],
    bio: "Mindfulness-based peer support with breathing exercises and weekly check-in frameworks.",
    status: "available",
    responseTime: "Usually replies within 1h",
    sessions: 55,
    rating: 4.9,
    languages: ["English", "Swahili"],
    avatarTone: "from-surface-muted to-primary-accent/30"
  },
  {
    id: 6,
    name: "David O.",
    year: 3,
    initials: "DO",
    specialties: ["Academic Stress", "Time Management"],
    bio: "Engineering student who gets the grind. We break big problems into small, doable steps.",
    status: "busy",
    busyUntil: "6:30 PM",
    responseTime: "Back online at 6:30 PM",
    sessions: 27,
    rating: 4.6,
    languages: ["English"],
    avatarTone: "from-outline-muted/30 to-soft-teal"
  }
];
const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "available", label: "Available first" },
  { value: "rating", label: "Highest rated" },
  { value: "sessions", label: "Most sessions" }
];
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
    { label: "Resources", icon: BookOpen, active: false }
  ];
  return /* @__PURE__ */ React.createElement("aside", { className: "flex w-64 shrink-0 flex-col rounded-3xl border border-outline-muted/20 bg-surface shadow-[0_8px_30px_rgba(17,29,39,0.05)]" }, /* @__PURE__ */ React.createElement("div", { className: "border-b border-outline-muted/15 px-6 py-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 font-heading text-lg font-bold text-primary-dark" }, /* @__PURE__ */ React.createElement(MessageCircle, { className: "h-5 w-5 text-primary" }), "PeerPoint")), /* @__PURE__ */ React.createElement("nav", { className: "flex-1 space-y-1 px-3 py-4" }, navItems.map((item) => {
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
  ), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 rounded-xl bg-primary/5 px-3 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-on-primary" }, "JD"), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "truncate text-sm font-medium text-on-surface" }, "Jane Doe"), /* @__PURE__ */ React.createElement("p", { className: "truncate text-xs text-on-surface-subtle" }, "Student Account")))));
}
function FilterCheckbox({ label, checked, onChange, count }) {
  return /* @__PURE__ */ React.createElement("label", { className: "group flex cursor-pointer items-center justify-between gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-surface-muted/60" }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked,
      onChange,
      className: "h-4 w-4 rounded border-outline-muted text-primary focus:ring-primary"
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "font-body text-sm text-on-surface" }, label)), count != null && /* @__PURE__ */ React.createElement("span", { className: "font-body text-xs text-on-surface-subtle" }, count));
}
function FilterPanel({
  availability,
  setAvailability,
  selectedFocus,
  toggleFocus,
  selectedLanguage,
  setSelectedLanguage,
  onClear,
  activeCount
}) {
  const focusCounts = useMemo(() => {
    const counts = {};
    focusAreas.forEach((area) => {
      counts[area] = counsellors.filter((c) => c.specialties.includes(area)).length;
    });
    return counts;
  }, []);
  return /* @__PURE__ */ React.createElement("aside", { className: "rounded-3xl border border-outline-muted/20 bg-surface p-5 shadow-[0_8px_30px_rgba(17,29,39,0.05)]" }, /* @__PURE__ */ React.createElement("div", { className: "mb-5 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(SlidersHorizontal, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ React.createElement("h2", { className: "font-heading text-sm font-bold text-on-surface" }, "Filters"), activeCount > 0 && /* @__PURE__ */ React.createElement("span", { className: "rounded-full bg-primary/10 px-2 py-0.5 font-heading text-[10px] font-bold text-primary" }, activeCount)), activeCount > 0 && /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: onClear,
      className: "font-heading text-xs font-semibold text-primary transition-colors hover:text-primary-dark"
    },
    "Clear all"
  )), /* @__PURE__ */ React.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React.createElement("p", { className: "mb-2 font-heading text-[11px] font-bold uppercase tracking-wide text-on-surface-subtle" }, "Availability"), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, [
    { value: "all", label: "All counsellors" },
    { value: "now", label: "Available now" },
    { value: "today", label: "Free today" }
  ].map((opt) => /* @__PURE__ */ React.createElement(
    "label",
    {
      key: opt.value,
      className: `flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-surface-muted/60 ${availability === opt.value ? "bg-soft-teal/80" : ""}`
    },
    /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "radio",
        name: "availability",
        checked: availability === opt.value,
        onChange: () => setAvailability(opt.value),
        className: "h-4 w-4 border-outline-muted text-primary focus:ring-primary"
      }
    ),
    /* @__PURE__ */ React.createElement("span", { className: "font-body text-sm text-on-surface" }, opt.label)
  )))), /* @__PURE__ */ React.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React.createElement("p", { className: "mb-2 font-heading text-[11px] font-bold uppercase tracking-wide text-on-surface-subtle" }, "Focus area"), /* @__PURE__ */ React.createElement("div", { className: "max-h-44 space-y-0.5 overflow-y-auto pr-1" }, focusAreas.map((area) => /* @__PURE__ */ React.createElement(
    FilterCheckbox,
    {
      key: area,
      label: area,
      count: focusCounts[area],
      checked: selectedFocus.includes(area),
      onChange: () => toggleFocus(area)
    }
  )))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "mb-2 font-heading text-[11px] font-bold uppercase tracking-wide text-on-surface-subtle" }, "Language"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedLanguage,
      onChange: (e) => setSelectedLanguage(e.target.value),
      className: "w-full rounded-xl border border-outline-muted/30 bg-surface-muted/40 px-3 py-2.5 font-body text-sm text-on-surface outline-none transition-shadow focus:ring-2 focus:ring-primary/30",
      "aria-label": "Filter by language"
    },
    /* @__PURE__ */ React.createElement("option", { value: "all" }, "Any language"),
    /* @__PURE__ */ React.createElement("option", { value: "English" }, "English"),
    /* @__PURE__ */ React.createElement("option", { value: "Swahili" }, "Swahili"),
    /* @__PURE__ */ React.createElement("option", { value: "French" }, "French")
  )));
}
function StatusBadge({ counsellor }) {
  if (counsellor.status === "available") {
    return /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 font-heading text-[11px] font-semibold text-success" }, /* @__PURE__ */ React.createElement("span", { className: "h-1.5 w-1.5 rounded-full bg-success" }), "Available");
  }
  return /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 font-heading text-[11px] font-semibold text-warning" }, /* @__PURE__ */ React.createElement("span", { className: "h-1.5 w-1.5 rounded-full bg-warning" }), "Busy until ", counsellor.busyUntil);
}
function CounsellorCard({ counsellor }) {
  const isAvailable = counsellor.status === "available";
  return /* @__PURE__ */ React.createElement(
    "article",
    {
      className: `group relative flex flex-col overflow-hidden rounded-3xl border bg-surface shadow-[0_8px_30px_rgba(17,29,39,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(17,29,39,0.10)] ${isAvailable ? "border-success/20" : "border-outline-muted/20"}`
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `absolute inset-y-0 left-0 w-1 ${isAvailable ? "bg-success" : "bg-warning/70"}`,
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ React.createElement("div", { className: "flex flex-1 flex-col p-5 pl-6" }, /* @__PURE__ */ React.createElement("div", { className: "mb-4 flex items-start justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${counsellor.avatarTone} font-heading text-base font-bold text-primary-dark shadow-inner`
      },
      counsellor.initials
    ), /* @__PURE__ */ React.createElement(
      "span",
      {
        className: `absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface ${isAvailable ? "bg-success" : "bg-warning"}`,
        "aria-hidden": "true"
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-heading text-base font-bold text-on-surface" }, counsellor.name, /* @__PURE__ */ React.createElement("span", { className: "ml-1.5 font-body text-sm font-medium text-on-surface-subtle" }, "Year ", counsellor.year)), /* @__PURE__ */ React.createElement("div", { className: "mt-1 flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 font-body text-xs text-on-surface-muted" }, /* @__PURE__ */ React.createElement(Star, { className: "h-3.5 w-3.5 fill-accent-gold text-accent-gold" }), counsellor.rating), /* @__PURE__ */ React.createElement("span", { className: "text-outline-muted" }, "\xB7"), /* @__PURE__ */ React.createElement("span", { className: "font-body text-xs text-on-surface-muted" }, counsellor.sessions, " sessions")))), /* @__PURE__ */ React.createElement(StatusBadge, { counsellor })), /* @__PURE__ */ React.createElement("div", { className: "mb-3 flex flex-wrap gap-1.5" }, counsellor.specialties.map((tag) => /* @__PURE__ */ React.createElement(
      "span",
      {
        key: tag,
        className: "rounded-full bg-soft-teal px-2.5 py-1 font-heading text-[10px] font-semibold uppercase tracking-wide text-primary"
      },
      tag
    ))), /* @__PURE__ */ React.createElement("p", { className: "mb-4 flex-1 font-body text-sm leading-relaxed text-on-surface-muted line-clamp-2" }, counsellor.bio), /* @__PURE__ */ React.createElement("div", { className: "mb-4 flex items-center gap-2 rounded-xl bg-surface-muted/50 px-3 py-2" }, /* @__PURE__ */ React.createElement(Clock, { className: "h-3.5 w-3.5 shrink-0 text-primary" }), /* @__PURE__ */ React.createElement("span", { className: "font-body text-xs text-on-surface-muted" }, counsellor.responseTime)), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "flex-1 rounded-xl border border-primary/25 bg-surface px-3 py-2.5 font-heading text-sm font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/5"
      },
      "View Profile"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        disabled: !isAvailable,
        className: `flex-1 rounded-xl px-3 py-2.5 font-heading text-sm font-semibold transition-all duration-200 ${isAvailable ? "bg-primary text-on-primary shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary-dark" : "cursor-not-allowed bg-outline-muted/30 text-on-surface-subtle"}`
      },
      isAvailable ? "Request Session" : "Notify Me"
    )))
  );
}
function ActiveFilterChip({ label, onRemove }) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: onRemove,
      className: "inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 font-heading text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary/10"
    },
    label,
    /* @__PURE__ */ React.createElement(X, { className: "h-3 w-3" })
  );
}
function CounsellorDirectory() {
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("now");
  const [selectedFocus, setSelectedFocus] = useState(["Anxiety"]);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");
  const toggleFocus = (area) => {
    setSelectedFocus(
      (prev) => prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };
  const activeFilterCount = (availability !== "all" ? 1 : 0) + selectedFocus.length + (selectedLanguage !== "all" ? 1 : 0);
  const clearFilters = () => {
    setAvailability("all");
    setSelectedFocus([]);
    setSelectedLanguage("all");
  };
  const filtered = useMemo(() => {
    let list = [...counsellors];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.specialties.some((s) => s.toLowerCase().includes(q)) || c.bio.toLowerCase().includes(q)
      );
    }
    if (availability === "now") {
      list = list.filter((c) => c.status === "available");
    }
    if (selectedFocus.length > 0) {
      list = list.filter(
        (c) => c.specialties.some((s) => selectedFocus.includes(s))
      );
    }
    if (selectedLanguage !== "all") {
      list = list.filter((c) => c.languages.includes(selectedLanguage));
    }
    if (sortBy === "available") {
      list.sort((a, b) => a.status === "available" ? -1 : 1);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "sessions") {
      list.sort((a, b) => b.sessions - a.sessions);
    }
    return list;
  }, [search, availability, selectedFocus, selectedLanguage, sortBy]);
  const availableCount = counsellors.filter((c) => c.status === "available").length;
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-background p-5" }, /* @__PURE__ */ React.createElement("div", { className: "mx-auto flex max-w-[1320px] gap-6" }, /* @__PURE__ */ React.createElement(Sidebar, null), /* @__PURE__ */ React.createElement("div", { className: "flex min-w-0 flex-1 flex-col gap-5" }, /* @__PURE__ */ React.createElement("header", { className: "rounded-3xl border border-outline-muted/20 bg-surface p-6 shadow-[0_8px_30px_rgba(17,29,39,0.05)]" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "mb-1 font-heading text-xs font-bold uppercase tracking-widest text-primary" }, "Peer Support"), /* @__PURE__ */ React.createElement("h1", { className: "font-heading text-[28px] font-extrabold leading-tight text-on-surface md:text-[32px]" }, "Find a Peer Counsellor"), /* @__PURE__ */ React.createElement("p", { className: "mt-2 max-w-xl font-body text-sm text-on-surface-muted" }, "Browse trained student supporters. Every conversation is anonymous, confidential, and free.")), /* @__PURE__ */ React.createElement("div", { className: "flex shrink-0 items-center gap-3 rounded-2xl bg-soft-teal/70 px-4 py-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10" }, /* @__PURE__ */ React.createElement(Shield, { className: "h-5 w-5 text-primary" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-heading text-xs font-bold text-primary-dark" }, "Your privacy is protected"), /* @__PURE__ */ React.createElement("p", { className: "font-body text-[11px] text-on-surface-muted" }, "No session details shared with faculty")))), /* @__PURE__ */ React.createElement("div", { className: "relative mt-5" }, /* @__PURE__ */ React.createElement(Search, { className: "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-subtle" }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "search",
      value: search,
      onChange: (e) => setSearch(e.target.value),
      placeholder: "Search by name, specialty, or topic\u2026",
      className: "w-full rounded-2xl border border-outline-muted/25 bg-background py-3.5 pl-12 pr-4 font-body text-sm text-on-surface outline-none transition-shadow focus:border-primary/30 focus:ring-2 focus:ring-primary/20",
      "aria-label": "Search counsellors"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-3" }, [
    {
      label: "Available now",
      value: availableCount,
      sub: "ready to talk today",
      tone: "text-success",
      bg: "bg-success/8"
    },
    {
      label: "Total counsellors",
      value: counsellors.length,
      sub: "verified peer supporters",
      tone: "text-primary",
      bg: "bg-primary/8"
    },
    {
      label: "Avg. response",
      value: "1.8h",
      sub: "typical first reply",
      tone: "text-accent-gold",
      bg: "bg-accent-gold/10"
    }
  ].map((stat) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: stat.label,
      className: `rounded-2xl border border-outline-muted/15 ${stat.bg} px-4 py-3.5`
    },
    /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs text-on-surface-muted" }, stat.label),
    /* @__PURE__ */ React.createElement("p", { className: `font-heading text-2xl font-extrabold ${stat.tone}` }, stat.value),
    /* @__PURE__ */ React.createElement("p", { className: "font-body text-[11px] text-on-surface-subtle" }, stat.sub)
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr]" }, /* @__PURE__ */ React.createElement(
    FilterPanel,
    {
      availability,
      setAvailability,
      selectedFocus,
      toggleFocus,
      selectedLanguage,
      setSelectedLanguage,
      onClear: clearFilters,
      activeCount: activeFilterCount
    }
  ), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("div", { className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-heading text-sm font-bold text-on-surface" }, filtered.length, " counsellor", filtered.length !== 1 ? "s" : "", " match"), /* @__PURE__ */ React.createElement("p", { className: "font-body text-xs text-on-surface-subtle" }, "Showing results for your current filters")), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
    "select",
    {
      value: sortBy,
      onChange: (e) => setSortBy(e.target.value),
      className: "appearance-none rounded-xl border border-outline-muted/25 bg-surface py-2 pl-3 pr-9 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20",
      "aria-label": "Sort counsellors"
    },
    sortOptions.map((opt) => /* @__PURE__ */ React.createElement("option", { key: opt.value, value: opt.value }, "Sort: ", opt.label))
  ), /* @__PURE__ */ React.createElement(ChevronDown, { className: "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-subtle" }))), activeFilterCount > 0 && /* @__PURE__ */ React.createElement("div", { className: "mb-4 flex flex-wrap items-center gap-2" }, availability !== "all" && /* @__PURE__ */ React.createElement(
    ActiveFilterChip,
    {
      label: availability === "now" ? "Available now" : "Free today",
      onRemove: () => setAvailability("all")
    }
  ), selectedFocus.map((area) => /* @__PURE__ */ React.createElement(
    ActiveFilterChip,
    {
      key: area,
      label: area,
      onRemove: () => toggleFocus(area)
    }
  )), selectedLanguage !== "all" && /* @__PURE__ */ React.createElement(
    ActiveFilterChip,
    {
      label: selectedLanguage,
      onRemove: () => setSelectedLanguage("all")
    }
  )), availability === "all" && selectedFocus.length === 0 && !search && /* @__PURE__ */ React.createElement("div", { className: "mb-5 flex items-center gap-3 rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/5 via-soft-teal/50 to-surface px-4 py-3" }, /* @__PURE__ */ React.createElement(Sparkles, { className: "h-5 w-5 shrink-0 text-primary" }), /* @__PURE__ */ React.createElement("p", { className: "font-body text-sm text-on-surface-muted" }, /* @__PURE__ */ React.createElement("span", { className: "font-heading font-semibold text-primary-dark" }, availableCount, " counsellors"), " ", "are available right now \u2014 no wait needed.")), filtered.length > 0 ? /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 gap-4 xl:grid-cols-2" }, filtered.map((c) => /* @__PURE__ */ React.createElement(CounsellorCard, { key: c.id, counsellor: c }))) : /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center rounded-3xl border border-dashed border-outline-muted/40 bg-surface px-6 py-16 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted" }, /* @__PURE__ */ React.createElement(Search, { className: "h-6 w-6 text-on-surface-subtle" })), /* @__PURE__ */ React.createElement("h3", { className: "mb-1 font-heading text-lg font-bold text-on-surface" }, "No counsellors match"), /* @__PURE__ */ React.createElement("p", { className: "mb-4 max-w-sm font-body text-sm text-on-surface-muted" }, "Try removing a filter or broadening your search. Someone is always here to help."), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: clearFilters,
      className: "rounded-xl bg-primary px-4 py-2 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
    },
    "Clear all filters"
  )))))));
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(/* @__PURE__ */ React.createElement(CounsellorDirectory, null));
