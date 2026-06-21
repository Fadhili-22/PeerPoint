export const attentionAlert = {
  title: "Attention Needed",
  description: "Request from Student ID: AM-12 waiting for 28 hours.",
};

export const counsellorKpis = [
  {
    id: "pending",
    label: "Pending Requests",
    value: "03",
    icon: "pending",
    highlight: true,
  },
  {
    id: "upcoming",
    label: "Upcoming Sessions",
    value: "05",
    icon: "calendar",
  },
  {
    id: "completed",
    label: "Completed Total",
    value: "128",
    icon: "completed",
  },
  {
    id: "response",
    label: "Response Rate",
    value: "94%",
    icon: "stats",
  },
];

export const sessionRequests = [
  {
    id: 1,
    name: "Anonymous M.",
    initials: "AM",
    topic: "Exam Stress",
    preferredDate: "Oct 26, 2:00 PM",
    age: "28h ago",
    overdue: true,
  },
  {
    id: 2,
    name: "Anonymous K.",
    initials: "SK",
    topic: "Social Anxiety",
    preferredDate: "Oct 25, 10:30 AM",
    age: "4h ago",
    overdue: false,
  },
  {
    id: 3,
    name: "Anonymous T.",
    initials: "AT",
    topic: "Time Management",
    preferredDate: "Oct 27, 9:00 AM",
    age: "1h ago",
    overdue: false,
  },
];

export const upcomingSessions = [
  {
    id: 1,
    day: "24",
    month: "Oct",
    title: "Academic Pressure Discussion",
    time: "14:00 - 14:45",
    studentId: "Student ID: SP-442",
  },
  {
    id: 2,
    day: "25",
    month: "Oct",
    title: "Coping with Social Anxiety",
    time: "11:00 - 11:45",
    studentId: "Student ID: SP-318",
  },
];

export const todaySchedule = [
  {
    id: 1,
    time: "2:00 PM",
    title: "Academic Stress",
    detail: "45 min session",
    active: true,
  },
  {
    id: 2,
    time: "4:30 PM",
    title: "Peer Group Support",
    detail: "60 min session",
    active: false,
  },
];

export const availabilitySlots = [
  { id: "mon", day: "Mon", slots: "2 slots" },
  { id: "tue", day: "Tue", slots: "4 slots" },
  { id: "wed", day: "Wed", slots: "3 slots" },
  { id: "thu", day: "Thu", slots: "1 slot" },
];

export const recentActivity = [
  {
    id: 1,
    icon: "check",
    variant: "success",
    text: "Accepted request from Anonymous K.",
    time: "2 hours ago",
  },
  {
    id: 2,
    icon: "done",
    variant: "primary",
    text: "Completed session with Student SP-400",
    time: "Yesterday",
  },
  {
    id: 3,
    icon: "calendar",
    variant: "primary",
    text: "Updated availability for next week",
    time: "2 days ago",
  },
];
