import { apiFetch } from "./client";

export async function getFeaturedCounsellors({ status = "available", limit = 12 } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (limit) params.set("limit", String(limit));
  const query = params.toString();
  const data = await apiFetch(`/public/counsellors/featured${query ? `?${query}` : ""}`, {
    auth: false,
  });
  return (data.counsellors ?? []).map(mapCounsellorCard);
}

export function mapCounsellorCard(item) {
  return {
    id: item.id,
    shortName: item.short_name,
    initials: item.initials,
    photoUrl: item.photo_url,
    specialties: item.specialties ?? [],
    bio: item.bio ?? "",
    availabilityNote: item.availability_note ?? "",
  };
}

export async function getPublicStats() {
  return apiFetch("/public/stats", { auth: false });
}

export function mapPublicStats(api) {
  return {
    counsellorCount: api.counsellor_count ?? 0,
    studentsSupported: api.students_supported ?? 0,
    sessionsCompleted: api.sessions_completed ?? 0,
    resourcesPublished: api.resources_published ?? 0,
  };
}

function formatStatCount(value) {
  if (value >= 100) return `${value}+`;
  return String(value);
}

export function formatPublicStatDisplay(stats) {
  return {
    counsellors: formatStatCount(stats.counsellorCount),
    studentsSupported: formatStatCount(stats.studentsSupported),
  };
}
