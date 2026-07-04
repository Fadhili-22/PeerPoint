import { apiFetch } from "./client";



export function mapOwnCounsellorProfile(data) {

  return {

    id: data.id,

    userId: data.user_id,

    fullName: data.full_name,

    shortName: data.short_name ?? "",

    initials: data.initials,

    year: data.year,

    program: data.program ?? "",

    bio: data.bio ?? "",

    quote: data.quote ?? "",

    specialties: data.specialties ?? [],

    languages: data.languages ?? [],

    photoUrl: data.photo_url ?? "",

    sessionsCount: data.sessions_count,

    joinedAt: data.joined_at,

    responseTime: data.response_time ?? "",

    status: data.status,

    lastActiveAt: data.last_active_at,

  };

}



export function toOwnProfilePayload(form) {

  return {

    short_name: form.shortName.trim() || null,

    bio: form.bio.trim() || null,

    quote: form.quote.trim() || null,

    specialties: form.specialties,

    languages: form.languages,

    photo_url: form.photoUrl.trim() || null,

    program: form.program.trim() || null,

  };

}



export async function getMyCounsellorProfile() {

  const data = await apiFetch("/counsellor/me/profile");

  return mapOwnCounsellorProfile(data);

}



export async function updateMyCounsellorProfile(payload) {

  const data = await apiFetch("/counsellor/me/profile", {

    method: "PUT",

    body: payload,

  });

  return mapOwnCounsellorProfile(data);

}

