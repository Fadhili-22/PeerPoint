import { getCounsellorById } from "./mockCounsellors";

const profileExtensions = {
  "1": {
    program: "Business Science (Finance)",
    joined: "Jan 2026",
    quote:
      "I became a peer counsellor because I realized that often, the biggest barrier to success at Strathmore isn't the coursework — it's the feeling of going through it alone. I want to be that supportive bridge for others.",
    focusAreas: [
      { label: "Exam Anxiety", icon: "graduation-cap" },
      { label: "Grief & Loss", icon: "frown" },
      { label: "Career Pressure", icon: "briefcase" },
      { label: "Social Isolation", icon: "user-x" },
      { label: "Work-Life Balance", icon: "scale" },
    ],
    sharedResources: [
      { title: "Navigating Exam Stress", type: "Guide" },
      { title: "Healthy Routine Guide", type: "Worksheet" },
    ],
  },
  "2": {
    program: "Communication Studies",
    joined: "Sep 2025",
    quote:
      "Every student deserves a space where they feel heard. Peer support changed my university experience, and I want to offer that same warmth to others.",
    focusAreas: [
      { label: "Relationships", icon: "heart" },
      { label: "Personal Growth", icon: "sparkles" },
      { label: "Anxiety", icon: "brain" },
    ],
    sharedResources: [
      { title: "Building Healthy Friendships", type: "Guide" },
      { title: "Self-Reflection Journal", type: "Worksheet" },
    ],
  },
};

const defaultFocusIcon = "brain";

const specialtyIconMap = {
  "Academic Stress": "graduation-cap",
  Anxiety: "brain",
  Relationships: "heart",
  "Personal Growth": "sparkles",
  "Time Management": "clock",
  Stress: "brain",
  Grief: "frown",
  "Social Anxiety": "user-x",
  "Career Guidance": "briefcase",
  Other: "message-circle",
};

function buildDefaultExtension(counsellor) {
  return {
    program: "Strathmore University",
    joined: "Jan 2026",
    quote: counsellor.bio,
    focusAreas: counsellor.specialties.map((specialty) => ({
      label: specialty,
      icon: specialtyIconMap[specialty] || defaultFocusIcon,
    })),
    sharedResources: [
      { title: "Getting Started with Peer Support", type: "Guide" },
    ],
  };
}

function formatOrdinalYear(year) {
  const suffix =
    year === 1 ? "st" : year === 2 ? "nd" : year === 3 ? "rd" : "th";
  return `${year}${suffix}`;
}

function buildWeeklyAvailability(counsellor) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  return labels.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const slots = counsellor.weeklySlots[date.getDay()] || [];

    return {
      day: label,
      date: date.getDate(),
      slots: slots.length,
    };
  });
}

export function getCounsellorProfile(id) {
  const counsellor = getCounsellorById(id);
  if (!counsellor) return null;

  const extension =
    profileExtensions[String(id)] || buildDefaultExtension(counsellor);
  const firstName = counsellor.fullName.split(" ")[0];
  const responseDisplay = counsellor.responseTime.includes("within")
    ? counsellor.responseTime.replace("Usually replies within ", "")
    : counsellor.responseTime;

  return {
    ...counsellor,
    ...extension,
    firstName,
    yearLabel: formatOrdinalYear(counsellor.year),
    responseDisplay,
    weeklyAvailability: buildWeeklyAvailability(counsellor),
    isAvailable: counsellor.availabilityStatus === "available",
  };
}
