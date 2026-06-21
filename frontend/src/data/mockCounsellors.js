export const sessionTopics = [
  "Academic Stress",
  "Anxiety",
  "Relationships",
  "Career Guidance",
  "Time Management",
  "Other",
];

export const directoryFilterChips = [
  { id: "available-now", label: "Available Now", type: "availability" },
  { id: "Anxiety", label: "Anxiety", type: "specialty" },
  { id: "Academic Stress", label: "Academic Stress", type: "specialty" },
  { id: "Relationships", label: "Relationships", type: "specialty" },
  { id: "Time Management", label: "Time Management", type: "specialty" },
  { id: "Personal Growth", label: "Personal Growth", type: "specialty" },
];

export const studyYears = [2, 3, 4];

export const counsellorLanguages = ["English", "Swahili", "French"];

const brianPhotoUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ5jDPPQ2R-MvPpkIlL0UpAGewZaqAStD9Zvml9u-blmFmLgOYPvETrdoNLND3as_A0vbztBldMB8ZVTHW_zMQoOy3O4SEZrj7-cSbARHd6Udta8GVLduWb6He11yE993DYHJF7XAooEoSePYnghHpFwXdXuz12zfXasU4NEkIfsOLKn5V2cNaXriDbYy-FbICFbrFj79jZQDItwzk7F-7HXWe1fCATowbMveFoutYu-LTFA3TM5RFSL_sXXc_lAwv7F8Ip-cPD0A";

export const counsellors = [
  {
    id: "1",
    fullName: "Brian Kamau",
    shortName: "Brian M.",
    initials: "BK",
    year: 3,
    role: "Peer Counsellor",
    specialties: ["Academic Stress", "Anxiety", "Time Management"],
    bio: "I'm a third-year finance student who understands the pressure of balancing academics, internships, and personal life at Strathmore. I believe in creating a calm, judgment-free space where you can unpack what's on your mind.",
    availabilityStatus: "available",
    busyUntil: null,
    isOnline: true,
    availabilityNote: "Available now",
    responseTime: "Usually replies within 1h",
    sessions: 48,
    rating: 4.9,
    languages: ["English", "Swahili"],
    photoUrl: brianPhotoUrl,
    weeklySlots: {
      0: [],
      1: ["9:00 AM", "11:00 AM", "2:00 PM"],
      2: ["9:00 AM", "2:00 PM", "4:30 PM"],
      3: [],
      4: ["11:00 AM", "2:00 PM", "4:30 PM"],
      5: ["9:00 AM", "11:00 AM"],
      6: [],
    },
    unavailableDates: [],
  },
  {
    id: "2",
    fullName: "Sarah Akinyi",
    shortName: "Sarah A.",
    initials: "SA",
    year: 4,
    role: "Peer Counsellor",
    specialties: ["Relationships", "Anxiety", "Personal Growth"],
    bio: "I help students navigate friendships, dating, and self-discovery with empathy and practical reflection tools.",
    availabilityStatus: "available",
    busyUntil: null,
    isOnline: true,
    availabilityNote: "Available now",
    responseTime: "Usually replies within 2h",
    sessions: 62,
    rating: 4.8,
    languages: ["English"],
    photoUrl: null,
    weeklySlots: {
      0: [],
      1: ["10:00 AM", "1:00 PM", "3:30 PM"],
      2: ["9:30 AM", "11:00 AM", "4:00 PM"],
      3: ["2:00 PM", "4:30 PM"],
      4: ["9:00 AM", "12:00 PM"],
      5: [],
      6: [],
    },
    unavailableDates: [],
  },
  {
    id: "3",
    fullName: "Samuel Mutua",
    shortName: "Samuel M.",
    initials: "SM",
    year: 2,
    role: "Peer Counsellor",
    specialties: ["Time Management", "Academic Stress", "Career Guidance"],
    bio: "Sessions with me are structured and practical — we focus on actionable steps for study habits, deadlines, and reducing overwhelm.",
    availabilityStatus: "busy",
    busyUntil: "4:00 PM",
    isOnline: false,
    availabilityNote: "Busy until 4:00 PM",
    responseTime: "Back online at 4:00 PM",
    sessions: 31,
    rating: 4.7,
    languages: ["English", "French"],
    photoUrl: null,
    weeklySlots: {
      0: [],
      1: ["9:00 AM", "4:30 PM"],
      2: [],
      3: ["11:00 AM", "2:00 PM"],
      4: [],
      5: ["9:00 AM", "11:00 AM", "2:00 PM"],
      6: [],
    },
    unavailableDates: [],
  },
  {
    id: "4",
    fullName: "Lisa Wanjiru",
    shortName: "Lisa W.",
    initials: "LW",
    year: 3,
    role: "Peer Counsellor",
    specialties: ["Anxiety", "Personal Growth", "Relationships"],
    bio: "A gentle space for students processing change or feeling isolated. We move at your pace — never rushed.",
    availabilityStatus: "available",
    busyUntil: null,
    isOnline: true,
    availabilityNote: "Available now",
    responseTime: "Usually replies within 3h",
    sessions: 39,
    rating: 5.0,
    languages: ["English"],
    photoUrl: null,
    weeklySlots: {
      0: [],
      1: ["10:00 AM", "3:00 PM"],
      2: ["11:00 AM", "2:00 PM"],
      3: ["9:00 AM", "1:00 PM"],
      4: ["10:00 AM", "4:00 PM"],
      5: [],
      6: [],
    },
    unavailableDates: [],
  },
  {
    id: "5",
    fullName: "Grace Njeri",
    shortName: "Grace N.",
    initials: "GN",
    year: 4,
    role: "Peer Counsellor",
    specialties: ["Anxiety", "Academic Stress", "Stress"],
    bio: "Mindfulness-based peer support with breathing exercises and weekly check-in frameworks.",
    availabilityStatus: "available",
    busyUntil: null,
    isOnline: true,
    availabilityNote: "Available now",
    responseTime: "Usually replies within 1h",
    sessions: 55,
    rating: 4.9,
    languages: ["English", "Swahili"],
    photoUrl: null,
    weeklySlots: {
      0: [],
      1: ["9:00 AM", "12:00 PM", "3:00 PM"],
      2: ["10:00 AM", "2:00 PM"],
      3: [],
      4: ["9:30 AM", "11:30 AM", "4:00 PM"],
      5: ["10:00 AM"],
      6: [],
    },
    unavailableDates: [],
  },
  {
    id: "6",
    fullName: "David Ochieng",
    shortName: "David O.",
    initials: "DO",
    year: 3,
    role: "Peer Counsellor",
    specialties: ["Time Management", "Academic Stress"],
    bio: "Engineering student who gets the grind. We break big problems into small, doable steps.",
    availabilityStatus: "busy",
    busyUntil: "6:30 PM",
    isOnline: false,
    availabilityNote: "Busy until 6:30 PM",
    responseTime: "Back online at 6:30 PM",
    sessions: 27,
    rating: 4.6,
    languages: ["English"],
    photoUrl: null,
    weeklySlots: {
      0: [],
      1: ["2:00 PM", "4:30 PM"],
      2: ["9:00 AM", "11:00 AM"],
      3: [],
      4: ["1:00 PM", "3:30 PM"],
      5: ["9:00 AM"],
      6: [],
    },
    unavailableDates: [],
  },
  {
    id: "7",
    fullName: "Emmanuel Kariuki",
    shortName: "Emmanuel K.",
    initials: "EK",
    year: 2,
    role: "Peer Counsellor",
    specialties: ["Time Management", "Stress", "Academic Stress"],
    bio: "Former student rep who understands deadline pressure. We build realistic plans that actually stick.",
    availabilityStatus: "offline",
    busyUntil: null,
    isOnline: false,
    availabilityNote: "Offline",
    responseTime: "Typically replies next day",
    sessions: 22,
    rating: 4.5,
    languages: ["English", "Swahili"],
    photoUrl: null,
    weeklySlots: {
      0: [],
      1: ["11:00 AM"],
      2: ["2:00 PM"],
      3: ["10:00 AM"],
      4: [],
      5: ["9:00 AM", "11:00 AM"],
      6: [],
    },
    unavailableDates: [],
  },
  {
    id: "8",
    fullName: "Amina Hassan",
    shortName: "Amina H.",
    initials: "AH",
    year: 4,
    role: "Peer Counsellor",
    specialties: ["Relationships", "Personal Growth", "Anxiety"],
    bio: "I create warm, reflective sessions for students exploring identity, belonging, and healthy boundaries.",
    availabilityStatus: "available",
    busyUntil: null,
    isOnline: true,
    availabilityNote: "Available now",
    responseTime: "Usually replies within 2h",
    sessions: 44,
    rating: 4.8,
    languages: ["English", "Swahili", "French"],
    photoUrl: null,
    weeklySlots: {
      0: [],
      1: ["10:00 AM", "1:00 PM"],
      2: ["3:00 PM", "5:00 PM"],
      3: ["11:00 AM"],
      4: ["9:00 AM", "2:00 PM"],
      5: [],
      6: [],
    },
    unavailableDates: [],
  },
  {
    id: "9",
    fullName: "James Mwangi",
    shortName: "James M.",
    initials: "JM",
    year: 3,
    role: "Peer Counsellor",
    specialties: ["Career Guidance", "Personal Growth", "Time Management"],
    bio: "I support students weighing internship choices, career paths, and the anxiety that comes with big decisions.",
    availabilityStatus: "available",
    busyUntil: null,
    isOnline: true,
    availabilityNote: "Available now",
    responseTime: "Usually replies within 2h",
    sessions: 36,
    rating: 4.7,
    languages: ["English"],
    photoUrl: null,
    weeklySlots: {
      0: [],
      1: ["9:00 AM", "4:00 PM"],
      2: [],
      3: ["10:00 AM", "2:00 PM", "4:00 PM"],
      4: ["11:00 AM"],
      5: ["10:00 AM", "12:00 PM"],
      6: [],
    },
    unavailableDates: [],
  },
  {
    id: "10",
    fullName: "Faith Wambui",
    shortName: "Faith W.",
    initials: "FW",
    year: 2,
    role: "Peer Counsellor",
    specialties: ["Anxiety", "Relationships", "Academic Stress"],
    bio: "First-gen university student who knows what it's like to feel out of place. You belong here — let's talk.",
    availabilityStatus: "offline",
    busyUntil: null,
    isOnline: false,
    availabilityNote: "Offline",
    responseTime: "Typically replies within 6h",
    sessions: 18,
    rating: 4.9,
    languages: ["English", "Swahili"],
    photoUrl: null,
    weeklySlots: {
      0: [],
      1: ["2:00 PM"],
      2: ["10:00 AM", "3:00 PM"],
      3: [],
      4: ["1:00 PM", "4:00 PM"],
      5: [],
      6: [],
    },
    unavailableDates: [],
  },
  {
    id: "11",
    fullName: "Peter Odhiambo",
    shortName: "Peter O.",
    initials: "PO",
    year: 4,
    role: "Peer Counsellor",
    specialties: ["Academic Stress", "Time Management", "Career Guidance"],
    bio: "Law student with a knack for breaking down overwhelming workloads into calm, achievable weekly plans.",
    availabilityStatus: "busy",
    busyUntil: "3:00 PM",
    isOnline: false,
    availabilityNote: "Busy until 3:00 PM",
    responseTime: "Back online at 3:00 PM",
    sessions: 51,
    rating: 4.8,
    languages: ["English"],
    photoUrl: null,
    weeklySlots: {
      0: [],
      1: ["9:00 AM", "11:00 AM", "3:00 PM"],
      2: ["10:00 AM", "2:00 PM"],
      3: ["9:30 AM"],
      4: ["12:00 PM", "4:30 PM"],
      5: [],
      6: [],
    },
    unavailableDates: [],
  },
  {
    id: "12",
    fullName: "Cynthia Achieng",
    shortName: "Cynthia A.",
    initials: "CA",
    year: 3,
    role: "Peer Counsellor",
    specialties: ["Personal Growth", "Relationships", "Anxiety"],
    bio: "I blend journaling prompts and open conversation to help you understand patterns and build self-compassion.",
    availabilityStatus: "available",
    busyUntil: null,
    isOnline: true,
    availabilityNote: "Available now",
    responseTime: "Usually replies within 1h",
    sessions: 41,
    rating: 4.9,
    languages: ["English", "French"],
    photoUrl: null,
    weeklySlots: {
      0: [],
      1: ["11:00 AM", "2:00 PM", "5:00 PM"],
      2: ["9:00 AM", "1:00 PM"],
      3: ["10:00 AM", "3:30 PM"],
      4: [],
      5: ["9:00 AM", "11:00 AM"],
      6: [],
    },
    unavailableDates: [],
  },
];

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function seedUnavailableDates(counsellor) {
  const blocked = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < 21; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const key = toDateKey(date);
    const daySlots = counsellor.weeklySlots[date.getDay()] || [];

    if (daySlots.length === 0) {
      blocked.push(key);
    }
  }

  if (counsellor.id === "1") {
    const extraBlock = new Date(today);
    extraBlock.setDate(today.getDate() + 5);
    blocked.push(toDateKey(extraBlock));
  }

  return [...new Set([...counsellor.unavailableDates, ...blocked])];
}

export function getCounsellorById(id) {
  const counsellor = counsellors.find((entry) => String(entry.id) === String(id));
  if (!counsellor) return null;

  return {
    ...counsellor,
    unavailableDates: seedUnavailableDates(counsellor),
  };
}

export function getAvailableCounsellorCount(list = counsellors) {
  return list.filter((c) => c.availabilityStatus === "available").length;
}

export function getTodayKey() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return toDateKey(today);
}

function isPastDate(dateKey) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(`${dateKey}T12:00:00`);
  return selected < today;
}

export function isDateUnavailable(counsellor, dateKey) {
  if (!dateKey || isPastDate(dateKey)) return true;
  if (counsellor.unavailableDates.includes(dateKey)) return true;

  const date = new Date(`${dateKey}T12:00:00`);
  const daySlots = counsellor.weeklySlots[date.getDay()] || [];
  return daySlots.length === 0;
}

export function getSlotsForDate(counsellor, dateKey) {
  if (!dateKey || isDateUnavailable(counsellor, dateKey)) return [];

  const date = new Date(`${dateKey}T12:00:00`);
  return counsellor.weeklySlots[date.getDay()] || [];
}
