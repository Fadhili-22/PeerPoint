export const reportKpis = [
  {
    id: "engagement",
    label: "Monthly Active Users",
    value: "1,920",
    trend: "+14%",
    sublabel: "vs last month",
    icon: "users",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    id: "sessions",
    label: "Sessions Completed",
    value: "308",
    trend: "+18%",
    sublabel: "this month",
    icon: "calendar",
    iconBg: "bg-soft-teal",
    iconColor: "text-primary",
  },
  {
    id: "satisfaction",
    label: "Avg Satisfaction",
    value: "92%",
    trend: "+3%",
    sublabel: "post-session",
    icon: "smile",
    iconBg: "bg-primary-accent/20",
    iconColor: "text-primary-light",
  },
  {
    id: "response",
    label: "Avg Response Time",
    value: "1.8h",
    trend: "-0.4h",
    sublabel: "faster",
    icon: "clock",
    iconBg: "bg-warning/10",
    iconColor: "text-accent-gold",
  },
];

export const growthMetrics = [
  { id: "students", label: "Student Growth", value: "+184", percent: 78, tone: "primary" },
  { id: "counsellors", label: "Counsellor Growth", value: "+6", percent: 42, tone: "primary" },
  { id: "retention", label: "30-Day Retention", value: "68%", percent: 68, tone: "warning" },
  { id: "resources", label: "Resource Adoption", value: "81%", percent: 81, tone: "muted" },
];

export const sessionTrend = {
  period: "Last 8 Weeks",
  weeks: [
    { label: "Wk 1", value: 42, height: 40 },
    { label: "Wk 2", value: 58, height: 55 },
    { label: "Wk 3", value: 74, height: 70 },
    { label: "Wk 4", value: 90, height: 85 },
    { label: "Wk 5", value: 63, height: 60 },
    { label: "Wk 6", value: 79, height: 75 },
    { label: "Wk 7", value: 53, height: 50 },
    { label: "Wk 8", value: 100, height: 95 },
  ],
};

export const usageBreakdown = [
  { id: "directory", label: "Counsellor Directory", value: "4,120 visits", percent: 86 },
  { id: "resources", label: "Resource Hub", value: "3,540 views", percent: 74 },
  { id: "booking", label: "Session Booking", value: "1,280 bookings", percent: 52 },
  { id: "crisis", label: "Crisis Support", value: "210 taps", percent: 18 },
];

export const topCategories = [
  { id: 1, label: "Academic Stress", sessions: 128, percent: 32 },
  { id: 2, label: "Anxiety", sessions: 96, percent: 24 },
  { id: 3, label: "Relationships", sessions: 64, percent: 16 },
  { id: 4, label: "Self-Esteem", sessions: 48, percent: 12 },
  { id: 5, label: "Wellness", sessions: 40, percent: 10 },
];

export const exportOptions = [
  {
    id: "monthly",
    title: "Monthly Activity Report",
    description: "Sessions, engagement, and growth for the current month.",
    format: "PDF",
  },
  {
    id: "counsellor",
    title: "Counsellor Performance",
    description: "Workload, response times, and satisfaction scores.",
    format: "CSV",
  },
  {
    id: "usage",
    title: "Platform Usage Analytics",
    description: "Feature usage breakdown across all student accounts.",
    format: "XLSX",
  },
];
