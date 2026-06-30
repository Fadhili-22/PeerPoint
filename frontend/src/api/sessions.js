import { apiFetch } from "./client";

const SESSION_STATUS_LABELS = {
  pending: { label: "Pending", style: "bg-accent-gold/20 text-accent-gold" },
  accepted: { label: "Confirmed", style: "bg-success/10 text-success" },
  rejected: { label: "Rejected", style: "bg-danger/10 text-danger" },
  completed: { label: "Completed", style: "bg-soft-teal text-primary" },
};

const COUNSELLOR_STATUS_LABELS = {
  pending: { label: "Pending", style: "bg-accent-gold/15 text-accent-gold" },
  accepted: { label: "Accepted", style: "bg-success/10 text-success" },
  rejected: { label: "Rejected", style: "bg-danger/10 text-danger" },
  completed: { label: "Completed", style: "bg-soft-teal text-primary" },
};

export function formatSessionFormat(format) {
  const map = {
    "in-person": "In Person",
    video: "Video Call",
    phone: "Phone Call",
  };
  return map[format] ?? format;
}

export function formatSessionStatus(status, variant = "student") {
  const labels = variant === "counsellor" ? COUNSELLOR_STATUS_LABELS : SESSION_STATUS_LABELS;
  return labels[status] ?? { label: status, style: "bg-outline-muted/20 text-on-surface-subtle" };
}

export function formatDisplayMode(format) {
  if (format === "in-person") {
    return { mode: "in-person", label: "In-person session" };
  }
  return { mode: "online", label: "Online session" };
}

export function deriveInitials(displayName) {
  const cleaned = displayName.replace(/^Anonymous\s+/i, "").replace(/\.$/, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  return "?";
}

export function formatPreferredDateTime(preferredDate, preferredTime) {
  const date = new Date(`${preferredDate}T12:00:00`);
  const datePart = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${datePart}, ${preferredTime}`;
}

export function formatScheduledAt(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRelativeTime(isoString) {
  const then = new Date(isoString).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - then);
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  return `${Math.floor(diffDays / 7)} weeks ago`;
}

export function formatUpcomingSessionDate(isoString) {
  const date = new Date(isoString);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

function mapStudentRequest(item) {
  const initials = deriveInitials(item.counsellor_name);
  return {
    id: item.id,
    counsellorId: item.counsellor_id,
    counsellorName: item.counsellor_name,
    initials,
    topic: item.topic,
    preferredDate: item.preferred_date,
    preferredTime: item.preferred_time,
    datetime: formatPreferredDateTime(item.preferred_date, item.preferred_time),
    format: item.format,
    formatLabel: formatSessionFormat(item.format),
    status: item.status,
    requestedAt: item.requested_at,
    overdue: item.overdue,
    rejectionReason: item.rejection_reason ?? null,
  };
}

function mapCounsellorRequest(item) {
  const { mode, label } = formatDisplayMode(item.format);
  return {
    id: item.id,
    name: item.student_display_name,
    initials: deriveInitials(item.student_display_name),
    topic: item.topic,
    otherTopic: item.other_topic,
    preferredDate: formatPreferredDateTime(item.preferred_date, item.preferred_time),
    preferredDateRaw: item.preferred_date,
    preferredTimeRaw: item.preferred_time,
    requested: formatRelativeTime(item.requested_at),
    requestedAt: item.requested_at,
    overdue: item.overdue,
    status: item.status,
    mode,
    modeLabel: label,
    format: item.format,
    duration: "45 min",
    message: item.notes ?? "No message provided.",
    anonymousUntilAccepted: item.anonymous_until_accepted,
  };
}

function mapStudentSession(item) {
  const initials = deriveInitials(item.counsellor_name);
  return {
    id: item.id,
    counsellorId: item.counsellor_id,
    counsellorName: item.counsellor_name,
    initials,
    topic: item.topic,
    datetime: formatScheduledAt(item.scheduled_at),
    scheduledAt: item.scheduled_at,
    format: item.format,
    formatLabel: formatSessionFormat(item.format),
    durationMinutes: item.duration_minutes,
    status: item.status,
  };
}

function mapCounsellorUpcomingSession(item) {
  const { day, month, time } = formatUpcomingSessionDate(item.scheduled_at);
  return {
    id: item.id,
    day,
    month,
    time,
    title: item.topic,
    studentId: item.student_display_id,
    format: item.format,
    durationMinutes: item.duration_minutes,
    status: item.status,
    scheduledAt: item.scheduled_at,
  };
}

export async function createSessionRequest(payload) {
  return apiFetch("/session-requests", {
    method: "POST",
    body: {
      counsellor_id: payload.counsellorId,
      topic: payload.topic,
      other_topic: payload.otherTopic ?? null,
      preferred_date: payload.preferredDate,
      preferred_time: payload.preferredTime,
      format: payload.format,
      notes: payload.notes ?? null,
      anonymous_until_accepted: payload.anonymousUntilAccepted ?? false,
    },
  });
}

export async function getMySessionRequests() {
  const data = await apiFetch("/session-requests/mine");
  return (data.requests ?? []).map(mapStudentRequest);
}

export async function getMySessions() {
  const data = await apiFetch("/students/me/sessions");
  return (data.sessions ?? []).map(mapStudentSession);
}

export async function getMySessionDetail(id) {
  const data = await apiFetch(`/students/me/sessions/${id}`);
  return {
    ...mapStudentSession(data),
    notes: data.notes,
  };
}

export async function getCounsellorSessionRequests(status) {
  const query = status && status !== "all" ? `?status=${status}` : "";
  const data = await apiFetch(`/counsellor/session-requests${query}`);
  return (data.requests ?? []).map(mapCounsellorRequest);
}

export async function getCounsellorSessionRequestDetail(id) {
  const data = await apiFetch(`/counsellor/session-requests/${id}`);
  return {
    ...mapCounsellorRequest(data),
    duration: data.duration_minutes ? `${data.duration_minutes} min` : "45 min",
    studentEmail: data.student_email,
  };
}

export async function acceptSessionRequest(id) {
  return apiFetch(`/counsellor/session-requests/${id}/accept`, { method: "POST" });
}

export async function rejectSessionRequest(id, reason) {
  return apiFetch(`/counsellor/session-requests/${id}/reject`, {
    method: "POST",
    body: reason ? { reason } : {},
  });
}

export async function completeSessionRequest(id) {
  return apiFetch(`/counsellor/session-requests/${id}/complete`, { method: "POST" });
}

export async function getCounsellorUpcomingSessions() {
  const data = await apiFetch("/counsellor/me/sessions/upcoming");
  return (data.sessions ?? []).map(mapCounsellorUpcomingSession);
}

export async function getCounsellorSlots(counsellorId, date) {
  const data = await apiFetch(`/counsellors/${counsellorId}/slots?date=${date}`);
  return data.slots ?? [];
}

export async function updateCounsellorAvailabilityStatus(isAvailable) {
  return apiFetch("/counsellor/me/availability-status", {
    method: "PATCH",
    body: { is_available: isAvailable },
  });
}
