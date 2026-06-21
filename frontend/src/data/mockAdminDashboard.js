export const platformKpis = [
  {
    id: "students",
    label: "Total Students",
    value: "2,840",
    trend: "+12%",
    trendUp: true,
    icon: "users",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    id: "counsellors",
    label: "Active Counsellors",
    value: "48",
    trend: "+4%",
    trendUp: true,
    icon: "headset",
    iconBg: "bg-soft-teal",
    iconColor: "text-primary",
  },
  {
    id: "sessions",
    label: "Sessions This Month",
    value: "512",
    trend: "+18%",
    trendUp: true,
    icon: "calendar",
    iconBg: "bg-primary-accent/20",
    iconColor: "text-primary-light",
  },
  {
    id: "pending",
    label: "Pending Approvals",
    value: "11",
    urgent: true,
    icon: "clock",
    iconBg: "bg-warning/10",
    iconColor: "text-accent-gold",
  },
  {
    id: "resources",
    label: "Resources Published",
    value: "156",
    sublabel: "Last 7d",
    icon: "book",
    iconBg: "bg-primary-accent/20",
    iconColor: "text-primary-light",
  },
];

export const newAccountRequests = [
  {
    id: 1,
    name: "Eric Mutua",
    email: "emutua@strathmore.edu",
    initials: "EM",
    role: "Peer Counsellor Promotion",
    date: "Oct 22, 2023",
    status: "Pending Review",
    type: "promotion",
    note: "Student account requesting promotion to Peer Counsellor",
  },
  {
    id: 2,
    name: "Alice Lemayian",
    email: "alemayian@strathmore.edu",
    initials: "AL",
    role: "New Student Signup",
    date: "Oct 23, 2023",
    status: "Verifying ID",
    type: "signup",
    note: "Registered via public signup — awaiting Strathmore email verification",
  },
  {
    id: 3,
    name: "Brian Ochieng",
    email: "bochieng@strathmore.edu",
    initials: "BO",
    role: "Peer Counsellor Promotion",
    date: "Oct 24, 2023",
    status: "Pending Review",
    type: "promotion",
    note: "Completed peer counselling training — admin approval required",
  },
  {
    id: 4,
    name: "Faith Wanjiku",
    email: "fwanjiku@strathmore.edu",
    initials: "FW",
    role: "New Student Signup",
    date: "Oct 24, 2023",
    status: "Verifying ID",
    type: "signup",
    note: "New student registration pending verification",
  },
];

export const newResourceRequests = [
  {
    id: 1,
    name: "Dr. Anne Kiama",
    email: "akiama@strathmore.edu",
    initials: "AK",
    role: "Resource Submission",
    date: "Oct 25, 2023",
    status: "Pending Review",
    resourceTitle: "Managing Social Anxiety on Campus",
  },
  {
    id: 2,
    name: "Samuel Mutua",
    email: "smutua@strathmore.edu",
    initials: "SM",
    role: "Resource Submission",
    date: "Oct 25, 2023",
    status: "Pending Review",
    resourceTitle: "Sleep Hygiene for Students",
  },
  {
    id: 3,
    name: "Grace Mwangi",
    email: "gmwangi@strathmore.edu",
    initials: "GM",
    role: "Resource Submission",
    date: "Oct 26, 2023",
    status: "Awaiting Edit",
    resourceTitle: "Building Resilience During Exams",
  },
];

export const attentionItems = [
  {
    id: 1,
    title: "Delayed Responses",
    description:
      "3 sessions have been waiting for counsellor response for >24h.",
    variant: "danger",
  },
  {
    id: 2,
    title: "Counsellor Availability",
    description:
      'High demand for "Stress Management" (95% cap reached).',
    variant: "warning",
  },
  {
    id: 3,
    title: "System Update",
    description: "Monthly report data ready for export.",
    variant: "info",
  },
];

export const platformHealth = {
  satisfaction: 92,
  activeCounsellors: 38,
  totalCounsellors: 48,
  avgResponseTime: "1.8h",
  responseProgress: 80,
};

export const sessionAnalytics = {
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

export const statusDistribution = {
  total: 512,
  segments: [
    { label: "Completed", percent: 60, color: "text-primary" },
    { label: "Upcoming", percent: 25, color: "text-accent-gold" },
    { label: "Cancelled", percent: 15, color: "text-danger" },
  ],
};

export const counsellorPerformance = [
  {
    id: 1,
    name: "Dr. Jane Foster",
    sessionsHandled: 142,
    responseRate: 98,
    responseLabel: "Excellent",
    responseVariant: "success",
    availability: "Online Now",
    availabilityVariant: "online",
    lastActive: "Active 5m ago",
  },
  {
    id: 2,
    name: "Prof. Mark Otieno",
    sessionsHandled: 98,
    responseRate: 82,
    responseLabel: "Average",
    responseVariant: "warning",
    availability: "Away",
    availabilityVariant: "away",
    lastActive: "Yesterday, 16:40",
  },
  {
    id: 3,
    name: "Anne Kiama",
    sessionsHandled: 115,
    responseRate: 94,
    responseLabel: "Excellent",
    responseVariant: "success",
    availability: "Online Now",
    availabilityVariant: "online",
    lastActive: "Active 12m ago",
  },
];

export const topResources = [
  {
    id: 1,
    title: "Coping with Finals Stress",
    category: "Academic",
    views: "1,240",
    saves: "452",
  },
  {
    id: 2,
    title: "Deep Breathing Techniques",
    category: "Anxiety",
    views: "980",
    saves: "312",
  },
  {
    id: 3,
    title: "Mindfulness 101",
    category: "Wellness",
    views: "856",
    saves: "289",
  },
];

export const platformActivity = [
  {
    id: 1,
    title: "Counsellor Promotion Approved",
    description: "Eric Mutua promoted from Student to Peer Counsellor",
    time: "12 mins ago",
    variant: "primary",
  },
  {
    id: 2,
    title: "Critical Alert: Delay",
    description: "3 sessions flagged for response lag",
    time: "1 hr ago",
    variant: "warning",
  },
  {
    id: 3,
    title: "New Student Verified",
    description: "Alice Lemayian completed Strathmore email verification",
    time: "3 hrs ago",
    variant: "info",
  },
  {
    id: 4,
    title: "Resource Approved",
    description: '"Mindfulness 101" published to Resource Hub',
    time: "5 hrs ago",
    variant: "primary",
  },
];
