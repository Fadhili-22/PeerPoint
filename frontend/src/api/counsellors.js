import { apiFetch } from "./client";



export function mapCounsellorDirectoryItem(item) {

  return {

    id: item.id,

    fullName: item.full_name,

    shortName: item.short_name,

    initials: item.initials,

    year: item.year,

    role: "Peer Counsellor",

    specialties: item.specialties ?? [],

    bio: item.bio,

    responseTime: item.response_time,

    sessions: item.sessions_count,

    languages: item.languages ?? [],

    photoUrl: item.photo_url,

    program: item.program,

    quote: item.quote,

  };

}



export function mapCounsellorProfileDetail(item) {

  return {

    ...mapCounsellorDirectoryItem(item),

    joinedAt: item.joined_at,

    weeklyAvailabilitySummary: item.weekly_availability_summary ?? {},

  };

}



export async function listCounsellors(params = {}) {

  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);

  if (params.language) searchParams.set("language", params.language);

  if (params.year) searchParams.set("year", String(params.year));

  (params.specialties ?? []).forEach((specialty) => {

    searchParams.append("specialties", specialty);

  });



  const query = searchParams.toString();

  const data = await apiFetch(`/counsellors${query ? `?${query}` : ""}`);

  return (data.counsellors ?? []).map(mapCounsellorDirectoryItem);

}



export async function getCounsellor(counsellorId) {

  const data = await apiFetch(`/counsellors/${counsellorId}`);

  return mapCounsellorProfileDetail(data);

}



export async function getCounsellorAvailability(counsellorId) {

  return apiFetch(`/counsellors/${counsellorId}/availability`);

}



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



const defaultFocusIcon = "brain";



const suggestedResource = {

  id: "getting-started-with-peerpoint",

  title: "Getting Started with PeerPoint",

  type: "Guide",

};



function formatOrdinalYear(year) {

  const suffix =

    year === 1 ? "st" : year === 2 ? "nd" : year === 3 ? "rd" : "th";

  return `${year}${suffix}`;

}



function formatJoinedDate(isoString) {

  if (!isoString) return "—";

  const date = new Date(isoString);

  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });

}



function formatResponseDisplay(responseTime) {

  if (!responseTime) return "—";

  if (responseTime.includes("within")) {

    return responseTime.replace("Usually replies within ", "");

  }

  return responseTime;

}



export function buildProfileWeeklyAvailability(summary = {}) {

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const dayOfWeek = today.getDay();

  const monday = new Date(today);

  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));



  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];



  return weekdayLabels.map((label, index) => {

    const date = new Date(monday);

    date.setDate(monday.getDate() + index);

    const jsDay = date.getDay();

    const slots = Number(summary[String(jsDay)] ?? summary[jsDay] ?? 0);

    return {

      day: label,

      date: date.getDate(),

      slots,

    };

  });

}



export function mapCounsellorProfileForPage(profile) {

  const firstName = profile.shortName || profile.fullName.split(" ")[0];



  return {

    ...profile,

    firstName,

    yearLabel: formatOrdinalYear(profile.year),

    responseDisplay: formatResponseDisplay(profile.responseTime),

    joined: formatJoinedDate(profile.joinedAt),

    focusAreas: (profile.specialties ?? []).map((specialty) => ({

      label: specialty,

      icon: specialtyIconMap[specialty] || defaultFocusIcon,

    })),

    weeklyAvailability: buildProfileWeeklyAvailability(

      profile.weeklyAvailabilitySummary,

    ),

    suggestedResource,

  };

}

