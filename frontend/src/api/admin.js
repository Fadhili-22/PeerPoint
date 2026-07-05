import { apiFetch, getAccessToken } from "./client";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

const REPORT_DOWNLOAD_PATHS = {
  "platform-summary": "/admin/reports/platform-summary",
  "counsellor-performance": "/admin/reports/counsellor-performance",
};

export function deriveInitials(fullName) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelative(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "min" : "mins"} ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? "hr" : "hrs"} ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function mapAdminCounsellor(item) {
  return {
    id: item.id,
    userId: item.user_id,
    name: item.full_name,
    email: item.email,
    phone: item.phone ?? null,
    isActive: item.is_active ?? true,
    initials: deriveInitials(item.full_name),
    year: item.year,
    program: item.program,
    specialties: item.specialties ?? [],
    sessions: item.sessions_count ?? 0,
    status: item.status,
  };
}

export function mapPromotionCandidate(item) {
  return {
    id: item.id,
    userId: item.user_id,
    name: item.name,
    email: item.email,
    initials: deriveInitials(item.name),
    course: item.course,
    year: item.year,
    trainingStatus: item.training_status,
    sessionsAttended: item.sessions_attended ?? 0,
    appliedOn: formatDate(item.applied_on),
  };
}

export async function listAdminCounsellors({ status, search } = {}) {
  const searchParams = new URLSearchParams();
  if (status && status !== "all") searchParams.set("status", status);
  if (search?.trim()) searchParams.set("search", search.trim());
  const query = searchParams.toString();
  const data = await apiFetch(`/admin/counsellors${query ? `?${query}` : ""}`);
  return (data.counsellors ?? []).map(mapAdminCounsellor);
}

export function mapPromotableStudent(item) {
  return {
    userId: item.user_id,
    name: item.full_name,
    email: item.email,
    phone: item.phone ?? null,
    initials: deriveInitials(item.full_name),
  };
}

export async function searchPromotableStudents({ search } = {}) {
  const searchParams = new URLSearchParams();
  if (search?.trim()) searchParams.set("search", search.trim());
  const query = searchParams.toString();
  const data = await apiFetch(
    `/admin/counsellors/promotable-students${query ? `?${query}` : ""}`,
  );
  return (data.students ?? []).map(mapPromotableStudent);
}

export async function listPromotionCandidates() {
  const data = await apiFetch("/admin/counsellors/promotion-candidates");
  return (data.candidates ?? []).map(mapPromotionCandidate);
}

export async function promoteCounsellor(userId) {
  return apiFetch(`/admin/counsellors/promote/${userId}`, { method: "POST" });
}

export async function toggleCounsellorActive(userId) {
  const data = await apiFetch(`/admin/counsellors/${userId}/toggle-active`, {
    method: "POST",
  });
  return {
    userId: data.user_id,
    isActive: data.is_active,
    message: data.message,
  };
}

export async function demoteCounsellor(userId) {
  const data = await apiFetch(`/admin/counsellors/${userId}/demote`, {
    method: "POST",
  });
  return {
    userId: data.user_id,
    roles: data.roles ?? [],
    message: data.message,
  };
}

function formatSessionDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} • ${timePart}`;
}

export function mapAdminSession(item) {
  const studentName = item.student_name ?? "";
  return {
    id: item.id,
    student: studentName,
    studentInitials: deriveInitials(studentName),
    counsellor: item.counsellor_name ?? "",
    date: formatSessionDateTime(item.scheduled_at),
    type: item.topic ?? "",
    status: item.status,
    outcome: item.outcome ?? "Pending",
    format: item.format ?? "",
  };
}

export async function listAdminSessions({ status, search } = {}) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (search?.trim()) params.set("search", search.trim());
  const query = params.toString();
  const data = await apiFetch(`/admin/sessions${query ? `?${query}` : ""}`);
  return (data.sessions ?? []).map(mapAdminSession);
}

export function computeAdminSessionStats(sessions) {
  return {
    total: sessions.length,
    completed: sessions.filter((session) => session.status === "completed").length,
    upcoming: sessions.filter((session) => session.status === "upcoming").length,
    cancelled: sessions.filter((session) => session.status === "cancelled").length,
  };
}

export function mapAdminRating(item) {
  return {
    id: item.id,
    counsellorName: item.counsellor_name,
    sessionTopic: item.session_topic,
    stars: item.stars,
    comment: item.comment,
    createdAt: item.created_at,
  };
}

export async function listAdminRatings({ counsellorId } = {}) {
  const params = new URLSearchParams();
  if (counsellorId) params.set("counsellor_id", counsellorId);
  const query = params.toString();
  const data = await apiFetch(`/admin/ratings${query ? `?${query}` : ""}`);
  return (data.ratings ?? []).map(mapAdminRating);
}

function formatDashboardNumber(value) {
  return Number(value ?? 0).toLocaleString("en-US");
}

export async function getAdminDashboard() {
  return apiFetch("/admin/dashboard");
}

export function mapAdminDashboard(api) {
  const monthlyActiveStudents = Number(api.monthly_active_students ?? 0);
  return {
    headlineStats: [
      {
        id: "students",
        label: "Students",
        value: formatDashboardNumber(api.total_students),
      },
      {
        id: "counsellors",
        label: "Counsellors",
        value: formatDashboardNumber(api.total_counsellors),
      },
      {
        id: "sessions",
        label: "Sessions",
        value: formatDashboardNumber(api.active_sessions),
      },
    ],
    monthlyActiveStudentsKpi: {
      id: "monthly-active-students",
      label: "Monthly Active Students",
      value: formatDashboardNumber(monthlyActiveStudents),
      sublabel: "logged in within 30 days",
      icon: "users",
      iconBg: "bg-soft-teal",
      iconColor: "text-primary",
    },
    directoryPreviews: {
      students: {
        count: formatDashboardNumber(api.total_students),
        description: "Active student accounts on the platform",
      },
      counsellors: {
        count: formatDashboardNumber(api.total_counsellors),
        description: "Counsellors listed in the directory",
      },
    },
    platformKpis: [
      {
        id: "students",
        label: "Total Students",
        value: formatDashboardNumber(api.total_students),
        icon: "users",
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
      },
      {
        id: "sessions",
        label: "Active Sessions",
        value: formatDashboardNumber(api.active_sessions),
        sublabel: "Scheduled ahead",
        icon: "calendar",
        iconBg: "bg-primary-accent/20",
        iconColor: "text-primary-light",
      },
      {
        id: "resources",
        label: "Resources Published",
        value: formatDashboardNumber(api.published_resources),
        sublabel: "Live in hub",
        icon: "book",
        iconBg: "bg-primary-accent/20",
        iconColor: "text-primary-light",
      },
    ],
    raw: api,
  };
}

const ACCOUNT_REQUEST_ROLE_LABELS = {
  signup: "New Student Signup",
  promotion: "Peer Counsellor Promotion",
};

export function mapAccountRequest(item) {
  return {
    id: item.id,
    userId: item.user_id,
    type: item.type,
    name: item.name,
    email: item.email,
    initials: deriveInitials(item.name),
    role: ACCOUNT_REQUEST_ROLE_LABELS[item.type] ?? item.type,
    date: formatDate(item.date),
    status: item.status,
    note: item.note ?? "",
  };
}

export async function listAccountRequests() {
  const data = await apiFetch("/admin/account-requests");
  return (data.requests ?? []).map(mapAccountRequest);
}

export async function approveAccountRequest(id) {
  return apiFetch(`/admin/account-requests/${id}/approve`, { method: "POST" });
}

export async function rejectAccountRequest(id) {
  return apiFetch(`/admin/account-requests/${id}/reject`, { method: "POST" });
}

export function mapAdminStudent(item) {
  return {
    id: item.user_id,
    userId: item.user_id,
    name: item.full_name,
    email: item.email,
    phone: item.phone ?? null,
    isActive: item.is_active ?? true,
    initials: deriveInitials(item.full_name),
    sessions: item.sessions ?? 0,
    lastActive: formatRelative(item.last_active_at),
    lastActiveRaw: item.last_active_at,
    createdAtRaw: item.created_at,
  };
}

export function mapAdminStudentDetail(item) {
  return {
    ...mapAdminStudent(item),
    recentActivity: item.recent_activity ?? [],
  };
}

export async function listAdminStudents({ search } = {}) {
  const params = new URLSearchParams();
  if (search?.trim()) params.set("search", search.trim());
  const query = params.toString();
  const data = await apiFetch(`/admin/students${query ? `?${query}` : ""}`);
  return (data.students ?? []).map(mapAdminStudent);
}

export async function getAdminStudent(userId) {
  const data = await apiFetch(`/admin/students/${userId}`);
  return mapAdminStudentDetail(data);
}

export async function toggleStudentActive(userId) {
  const data = await apiFetch(`/admin/students/${userId}/toggle-active`, {
    method: "POST",
  });
  return {
    userId: data.user_id,
    isActive: data.is_active,
    message: data.message,
  };
}

export function computeAdminStudentStats(students) {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const monthMs = 30 * 24 * 60 * 60 * 1000;

  return {
    total: students.length,
    activeThisWeek: students.filter((student) => {
      if (!student.lastActiveRaw) return false;
      const lastActiveMs = new Date(student.lastActiveRaw).getTime();
      return Number.isFinite(lastActiveMs) && now - lastActiveMs <= weekMs;
    }).length,
    newThisMonth: students.filter((student) => {
      if (!student.createdAtRaw) return false;
      const createdMs = new Date(student.createdAtRaw).getTime();
      return Number.isFinite(createdMs) && now - createdMs <= monthMs;
    }).length,
  };
}

export function mapPlatformActivity(item) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    variant: item.variant,
    time: item.relative_time ?? formatRelative(item.created_at),
  };
}

export async function listAdminNotifications({ limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  const query = params.toString();
  const data = await apiFetch(`/admin/notifications${query ? `?${query}` : ""}`);
  return (data.activities ?? []).map(mapPlatformActivity);
}

export async function getAdminAnalytics() {
  return apiFetch("/admin/analytics");
}

export function mapSessionTrendWeeks(api) {
  return api.session_trend?.weeks ?? [];
}

export function mapStatusDistribution(api) {
  const dist = api.status_distribution ?? { total: 0, segments: [] };
  return {
    total: dist.total ?? 0,
    segments: dist.segments ?? [],
  };
}

export function mapCounsellorPerformance(items) {
  return (items ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    sessionsHandled: item.sessions_handled ?? 0,
    responseRate: item.response_rate ?? 0,
    responseLabel: item.response_label ?? "",
    responseVariant: item.response_variant ?? "warning",
    lastActive: item.last_active ?? "—",
  }));
}

export function mapTopResources(items) {
  return (items ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    views: Number(item.views ?? 0).toLocaleString("en-US"),
    saves: Number(item.saves ?? 0).toLocaleString("en-US"),
  }));
}

export function mapTopCategories(items) {
  return (items ?? []).map((item, index) => ({
    id: `${item.label}-${index}`,
    label: item.label,
    sessions: item.sessions ?? 0,
    percent: item.percent ?? 0,
  }));
}

function formatMetricValue(value) {
  if (value == null || value === "") return "—";
  return typeof value === "number" ? value.toLocaleString("en-US") : String(value);
}

export function mapReportsKpis(api) {
  return [
    {
      id: "engagement",
      label: "Monthly Active Users",
      value: formatMetricValue(api.monthly_active_users),
      sublabel: "logged in this month",
      icon: "users",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      id: "sessions",
      label: "Sessions Completed",
      value: formatMetricValue(api.sessions_completed_this_month),
      sublabel: "this month",
      icon: "calendar",
      iconBg: "bg-soft-teal",
      iconColor: "text-primary",
    },
  ];
}

export function mapGrowthMetrics(items) {
  return (items ?? []).map((item) => ({
    id: item.label.toLowerCase().replace(/\s+/g, "-"),
    label: item.label,
    value: item.value,
    percent: item.percent ?? 0,
    tone: item.tone ?? "primary",
  }));
}

export function mapUsageBreakdown(items) {
  return (items ?? []).map((item) => ({
    id: item.label.toLowerCase().replace(/\s+/g, "-"),
    label: item.label,
    value: item.value,
    percent: item.percent ?? 0,
  }));
}

export async function downloadAdminReport(reportKey, format) {
  const path = REPORT_DOWNLOAD_PATHS[reportKey];
  if (!path) {
    throw new Error("Unknown report type.");
  }

  const token = getAccessToken();
  const response = await fetch(`${API_BASE}${path}?format=${encodeURIComponent(format)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const detail = data?.detail ?? response.statusText;
    throw new Error(typeof detail === "string" ? detail : "Download failed.");
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename=\"?([^\";\n]+)\"?/i);
  const filename = match?.[1] ?? `${reportKey}.${format}`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
