export const counsellorRequests = [
  {
    id: 1,
    name: "Anonymous M.",
    initials: "AM",
    topic: "Exam Stress",
    preferredDate: "Oct 26, 2:00 PM",
    requested: "28h ago",
    overdue: true,
    status: "pending",
    mode: "online",
    duration: "45 min",
    message:
      "I've been struggling to keep up with revision and the pressure is really getting to me. Would appreciate someone to talk through study strategies with.",
  },
  {
    id: 2,
    name: "Anonymous K.",
    initials: "SK",
    topic: "Social Anxiety",
    preferredDate: "Oct 25, 10:30 AM",
    requested: "4h ago",
    overdue: false,
    status: "pending",
    mode: "in-person",
    duration: "60 min",
    message:
      "Group projects and presentations make me extremely anxious. I'd like to find ways to cope before our next big assignment.",
  },
  {
    id: 3,
    name: "Anonymous T.",
    initials: "AT",
    topic: "Time Management",
    preferredDate: "Oct 27, 9:00 AM",
    requested: "1h ago",
    overdue: false,
    status: "pending",
    mode: "online",
    duration: "45 min",
    message:
      "Balancing coursework, a part-time job and personal life feels impossible right now. Hoping to build a more realistic routine.",
  },
  {
    id: 4,
    name: "Anonymous R.",
    initials: "AR",
    topic: "Homesickness",
    preferredDate: "Oct 24, 3:30 PM",
    requested: "Yesterday",
    overdue: false,
    status: "accepted",
    mode: "online",
    duration: "45 min",
    message:
      "First year away from home and I'm finding it harder than expected to settle in and make friends.",
  },
  {
    id: 5,
    name: "Anonymous L.",
    initials: "BL",
    topic: "Academic Pressure",
    preferredDate: "Oct 23, 1:00 PM",
    requested: "2 days ago",
    overdue: false,
    status: "accepted",
    mode: "in-person",
    duration: "60 min",
    message:
      "Worried about maintaining my GPA for a scholarship. Would like to talk about managing the pressure.",
  },
  {
    id: 6,
    name: "Anonymous D.",
    initials: "JD",
    topic: "Relationship Issues",
    preferredDate: "Oct 20, 11:00 AM",
    requested: "5 days ago",
    overdue: false,
    status: "rejected",
    mode: "online",
    duration: "45 min",
    message:
      "Going through a tough breakup and it's affecting my focus in class.",
  },
  {
    id: 7,
    name: "Anonymous P.",
    initials: "NP",
    topic: "Sleep & Burnout",
    preferredDate: "Oct 18, 4:00 PM",
    requested: "1 week ago",
    overdue: false,
    status: "completed",
    mode: "online",
    duration: "45 min",
    message:
      "Pulling too many late nights and feeling completely drained. Looking for healthier habits.",
  },
  {
    id: 8,
    name: "Anonymous F.",
    initials: "CF",
    topic: "Career Uncertainty",
    preferredDate: "Oct 15, 10:00 AM",
    requested: "2 weeks ago",
    overdue: false,
    status: "completed",
    mode: "in-person",
    duration: "60 min",
    message:
      "Unsure about my chosen major and what comes after graduation. Wanted a space to think it through.",
  },
];

export const requestFilters = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Rejected" },
];

export const statusStyles = {
  pending: "bg-accent-gold/15 text-accent-gold",
  accepted: "bg-success/10 text-success",
  rejected: "bg-danger/10 text-danger",
  completed: "bg-soft-teal text-primary",
};

export const statusLabels = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  completed: "Completed",
};
