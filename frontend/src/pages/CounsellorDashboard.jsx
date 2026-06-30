import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  CalendarCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  CheckCheck,
  ClipboardList,
  Edit3,
  LineChart,
  MapPin,
  Video,
  X,
} from "lucide-react";
import ComingSoonButton from "../components/ComingSoonButton";
import ComingSoonText from "../components/ComingSoonText";
import RejectSessionModal from "../components/RejectSessionModal";
import { ResourceStatusBadge } from "../components/AdminResourceRowActions";
import { ApiError } from "../api/client";
import { listMyResources } from "../api/resources";
import { useAuth } from "../context/AuthContext";
import { useResources } from "../context/ResourcesContext";
import {
  acceptSessionRequest,
  getCounsellorSessionRequests,
  getCounsellorUpcomingSessions,
  rejectSessionRequest,
  updateCounsellorAvailabilityStatus,
} from "../api/sessions";
import {
  attentionAlert,
  availabilitySlots,
  counsellorKpis,
  recentActivity,
} from "../data/mockCounsellorDashboard";

const kpiIcons = {
  pending: ClipboardList,
  calendar: CalendarClock,
  completed: CheckCircle2,
  stats: LineChart,
};

const activityIcons = {
  check: Check,
  done: CheckCheck,
  calendar: CalendarCheck,
};

const activityVariants = {
  success: "bg-success/10 text-success",
  primary: "bg-soft-teal text-primary",
};

function StatCard({ kpi }) {
  const Icon = kpiIcons[kpi.icon];

  return (
    <article className="rounded-2xl border border-primary/5 bg-surface p-5 shadow-md transition-transform duration-300 hover:scale-[1.02] hover:-translate-y-0.5">
      <Icon className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
      <p className="mb-1 font-heading text-[11px] font-bold uppercase tracking-widest text-on-surface-subtle">
        {kpi.label}
      </p>
      <p
        className={`font-heading text-3xl font-bold ${
          kpi.highlight ? "text-primary" : "text-on-surface"
        }`}
      >
        {kpi.value}
      </p>
    </article>
  );
}

export default function CounsellorDashboard() {
  const { user } = useAuth();
  const { counsellorActivity } = useResources();
  const firstName = user.fullName.split(" ")[0];
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);

  const pendingCount = requests.length;

  const loadPendingRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const data = await getCounsellorSessionRequests("pending");
      setRequests(data.slice(0, 5));
    } catch {
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const loadUpcomingSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const data = await getCounsellorUpcomingSessions();
      setUpcomingSessions(data);
    } catch {
      setUpcomingSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const loadSubmissions = useCallback(async () => {
    setSubmissionsLoading(true);
    try {
      const data = await listMyResources();
      setSubmissions(data);
    } catch {
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingRequests();
    loadUpcomingSessions();
    loadSubmissions();
  }, [loadPendingRequests, loadUpcomingSessions, loadSubmissions]);

  const dashboardKpis = useMemo(() => {
    return counsellorKpis.map((kpi) =>
      kpi.id === "pending"
        ? { ...kpi, value: String(pendingCount).padStart(2, "0"), highlight: pendingCount > 0 }
        : kpi,
    );
  }, [pendingCount]);

  const submissionsNeedingAttention = useMemo(
    () =>
      submissions.filter(
        (resource) =>
          resource.status === "pending_review" || resource.status === "rejected",
      ),
    [submissions],
  );

  const mergedRecentActivity = useMemo(
    () => [...counsellorActivity, ...recentActivity].slice(0, 5),
    [counsellorActivity],
  );

  const handleAccept = async (id) => {
    setActionLoading(true);
    setActionError("");
    try {
      await acceptSessionRequest(id);
      await loadPendingRequests();
      await loadUpcomingSessions();
    } catch (error) {
      setActionError(error.message || "Unable to accept request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id, reason) => {
    setActionLoading(true);
    setActionError("");
    try {
      await rejectSessionRequest(id, reason);
      setRejectTarget(null);
      await loadPendingRequests();
    } catch (error) {
      setActionError(error.message || "Unable to reject request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAvailabilityToggle = async () => {
    const nextValue = !isAvailable;
    setAvailabilityLoading(true);
    setActionError("");
    try {
      await updateCounsellorAvailabilityStatus(nextValue);
      setIsAvailable(nextValue);
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setActionError("You are not authorized to update availability.");
      } else {
        setActionError(error.message || "Unable to update availability.");
      }
    } finally {
      setAvailabilityLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col">
      {/* Welcome header + availability toggle + attention callout */}
      <section className="mb-6 flex flex-col items-start gap-4 lg:flex-row">
        <div className="flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-1 font-heading text-2xl font-semibold text-on-surface md:text-[28px] md:leading-9">
                Welcome back, {firstName}
              </h1>
              <p className="font-body text-base text-on-surface-muted">
                You have {pendingCount} new requests waiting for your response.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start rounded-full bg-soft-teal px-4 py-2 sm:self-auto">
              <span
                className={`font-heading text-sm font-semibold ${
                  isAvailable ? "text-primary" : "text-on-surface-subtle"
                }`}
              >
                {isAvailable ? "Available" : "Unavailable"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isAvailable}
                aria-label="Toggle availability"
                disabled={availabilityLoading}
                onClick={handleAvailabilityToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${
                  isAvailable ? "bg-primary" : "bg-outline-muted"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-surface shadow transition-transform duration-200 ${
                    isAvailable ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <aside className="w-full rounded-2xl border border-accent-gold/20 bg-accent-gold/10 p-4 lg:w-80">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-surface p-2 text-accent-gold">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="mb-0.5 font-heading text-sm font-bold text-accent-gold">
                {attentionAlert.title}
              </p>
              <p className="font-body text-sm leading-snug text-on-surface-muted">
                {attentionAlert.description}
              </p>
            </div>
          </div>
        </aside>
      </section>

      {actionError ? (
        <p className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 font-body text-sm text-danger">
          {actionError}
        </p>
      ) : null}

      {/* KPI Row */}
      <section
        aria-label="Counsellor key metrics"
        className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {dashboardKpis.map((kpi) => (
          <StatCard key={kpi.id} kpi={kpi} />
        ))}
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Primary column */}
        <div className="space-y-6 lg:col-span-8">
          {/* New Session Requests */}
          <section className="overflow-hidden rounded-2xl border border-primary/5 bg-surface shadow-md">
            <div className="flex items-center justify-between border-b border-outline-muted/10 p-5">
              <h2 className="font-heading text-lg font-semibold text-on-surface">
                New Session Requests
              </h2>
              <Link
                to="/counsellor/requests"
                className="font-heading text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-muted font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-subtle">
                    <th scope="col" className="px-5 py-3">
                      Student
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Topic
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Preferred Date
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Age
                    </th>
                    <th scope="col" className="px-5 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-muted/10">
                  {requestsLoading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center font-body text-sm text-on-surface-muted">
                        Loading requests...
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center font-body text-sm text-on-surface-muted">
                        No pending requests right now.
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                    <tr
                      key={request.id}
                      className="transition-colors hover:bg-surface-muted/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft-teal font-heading text-xs font-bold text-primary">
                            {request.initials}
                          </div>
                          <span className="font-heading text-sm font-semibold text-on-surface">
                            {request.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-soft-teal px-3 py-1 font-heading text-xs font-bold text-primary">
                          {request.topic}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-body text-sm text-on-surface">
                        {request.preferredDate}
                      </td>
                      <td
                        className={`px-5 py-4 font-body text-sm font-medium ${
                          request.overdue
                            ? "text-danger"
                            : "text-on-surface-subtle"
                        }`}
                      >
                        {request.requested}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleAccept(request.id)}
                            disabled={actionLoading}
                            title={`Accept request from ${request.name}`}
                            aria-label={`Accept request from ${request.name}`}
                            className="rounded-lg p-2 text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/10 disabled:opacity-50"
                          >
                            <Check className="h-5 w-5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectTarget(request)}
                            disabled={actionLoading}
                            title={`Reject request from ${request.name}`}
                            aria-label={`Reject request from ${request.name}`}
                            className="rounded-lg p-2 text-on-surface-subtle transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                          >
                            <X className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Resource Submissions teaser */}
          <section className="overflow-hidden rounded-2xl border border-primary/5 bg-surface shadow-md">
            <div className="flex items-center justify-between border-b border-outline-muted/10 p-5">
              <h2 className="font-heading text-lg font-semibold text-on-surface">
                My Resource Submissions
              </h2>
              <Link
                to="/counsellor/resources"
                className="font-heading text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                View All
              </Link>
            </div>
            {submissionsLoading ? (
              <p className="px-5 py-8 text-center font-body text-sm text-on-surface-muted">
                Loading submissions…
              </p>
            ) : submissionsNeedingAttention.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-muted font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-subtle">
                      <th scope="col" className="px-5 py-3">
                        Resource
                      </th>
                      <th scope="col" className="px-5 py-3">
                        Status
                      </th>
                      <th scope="col" className="px-5 py-3 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-muted/10">
                    {submissionsNeedingAttention.slice(0, 3).map((resource) => (
                      <tr
                        key={resource.id}
                        className="transition-colors hover:bg-surface-muted/40"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <BookOpen
                              className="h-4 w-4 shrink-0 text-primary"
                              aria-hidden="true"
                            />
                            <span className="font-heading text-sm font-semibold text-on-surface">
                              {resource.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <ResourceStatusBadge status={resource.status} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            to={
                              resource.status === "rejected"
                                ? `/counsellor/resources/${resource.id}/edit`
                                : `/counsellor/resources/${resource.id}/preview`
                            }
                            className="font-heading text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
                          >
                            {resource.status === "rejected" ? "Edit" : "Preview"}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-8 text-center">
                <p className="font-body text-sm text-on-surface-muted">
                  {submissions.length === 0
                    ? "Share mental health articles with students — draft your first submission."
                    : "No submissions need your attention right now."}
                </p>
                <Link
                  to={
                    submissions.length === 0
                      ? "/counsellor/resources/new"
                      : "/counsellor/resources"
                  }
                  className="mt-3 inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
                >
                  {submissions.length === 0 ? "Submit Resource" : "View Submissions"}
                </Link>
              </div>
            )}
          </section>

          {/* Upcoming Sessions */}
          <section className="rounded-2xl border border-primary/5 bg-surface p-5 shadow-md">
            <h2 className="mb-4 font-heading text-lg font-semibold text-on-surface">
              Upcoming Sessions
            </h2>
            <div className="space-y-3">
              {sessionsLoading ? (
                <p className="font-body text-sm text-on-surface-muted">
                  Loading upcoming sessions...
                </p>
              ) : upcomingSessions.length === 0 ? (
                <p className="font-body text-sm text-on-surface-muted">
                  No upcoming sessions scheduled.
                </p>
              ) : (
                upcomingSessions.map((session) => {
                  const FormatIcon =
                    session.format === "in-person" ? MapPin : Video;
                  return (
                <article
                  key={session.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-outline-muted/20 p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm md:flex-row md:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-soft-teal text-primary">
                      <span className="font-heading text-sm font-bold">
                        {session.day}
                      </span>
                      <span className="font-heading text-[9px] font-bold uppercase">
                        {session.month}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-semibold text-on-surface">
                        {session.title}
                      </h3>
                      <p className="font-body text-xs text-on-surface-muted">
                        {session.time} • {session.studentId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    <FormatIcon
                      className="h-5 w-5 text-primary/60"
                      aria-hidden="true"
                    />
                    <ComingSoonButton className="rounded-xl bg-primary px-5 py-2 font-heading text-sm font-semibold text-on-primary">
                      View Session
                    </ComingSoonButton>
                  </div>
                </article>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* Sidebar column */}
        <aside className="space-y-6 lg:col-span-4">
          {/* Today's Schedule — mock preview retained */}
          <section className="rounded-2xl border border-primary/5 bg-surface p-5 shadow-md">
            <h2 className="mb-4 font-heading text-base font-semibold text-on-surface">
              Today's Schedule
            </h2>
            {sessionsLoading ? (
              <p className="font-body text-sm text-on-surface-muted">Loading...</p>
            ) : upcomingSessions.length === 0 ? (
              <p className="font-body text-sm text-on-surface-muted">
                Nothing scheduled for today.
              </p>
            ) : (
              <div className="relative space-y-5 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-0.5 before:bg-outline-muted/30">
                {upcomingSessions.slice(0, 3).map((item, index) => (
                  <div key={item.id} className="relative pl-8">
                    <span
                      className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-4 border-surface ring-1 ring-outline-muted/30 ${
                        index === 0 ? "bg-primary" : "bg-outline-muted"
                      }`}
                      aria-hidden="true"
                    />
                    <p
                      className={`font-heading text-[11px] font-bold uppercase ${
                        index === 0 ? "text-primary" : "text-on-surface-subtle"
                      }`}
                    >
                      {item.time}
                    </p>
                    <p
                      className={`font-heading text-sm font-semibold ${
                        index === 0 ? "text-on-surface" : "text-on-surface-muted"
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="font-body text-xs text-on-surface-subtle">
                      {item.studentId}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Availability */}
          <section className="rounded-2xl border border-primary/5 bg-surface p-5 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold text-on-surface">
                Availability
              </h2>
              <Link
                to="/counsellor/availability"
                className="font-heading text-xs font-bold text-primary transition-colors hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Edit
              </Link>
            </div>
            <div className="mb-5 grid grid-cols-2 gap-3">
              {availabilitySlots.map((slot) => (
                <div
                  key={slot.id}
                  className="rounded-xl border border-outline-muted/20 bg-surface-muted/50 p-3 text-center"
                >
                  <p className="font-heading text-[10px] font-bold uppercase text-on-surface-subtle">
                    {slot.day}
                  </p>
                  <p className="font-heading text-sm font-bold text-on-surface">
                    {slot.slots}
                  </p>
                </div>
              ))}
            </div>
            <Link
              to="/counsellor/availability"
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary/20 py-2.5 font-heading text-sm font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-soft-teal focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              Edit Availability
            </Link>
          </section>

          {/* Recent Activity */}
          <section className="rounded-2xl border border-primary/5 bg-surface p-5 shadow-md">
            <h2 className="mb-4 font-heading text-base font-semibold text-on-surface">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {mergedRecentActivity.map((activity) => {
                const Icon = activityIcons[activity.icon];
                return (
                  <div key={activity.id} className="flex gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${activityVariants[activity.variant]}`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-body text-xs font-medium text-on-surface">
                        {activity.text}
                      </p>
                      <p className="font-heading text-[10px] font-bold uppercase text-on-surface-subtle">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>

      {/* Footer */}
      <footer className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-outline-muted/30 py-4 md:flex-row">
        <p className="font-body text-xs font-medium text-on-surface-muted">
          © 2026 PeerPoint. Endorsed by Strathmore University Mental Health Club
        </p>
        <div className="flex gap-4">
          <ComingSoonText className="font-body text-xs font-medium text-on-surface-muted">
            Privacy Policy
          </ComingSoonText>
          <ComingSoonText className="font-body text-xs font-medium text-on-surface-muted">
            Contact Support
          </ComingSoonText>
        </div>
      </footer>

      <RejectSessionModal
        request={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={(reason) => {
          if (rejectTarget) {
            handleReject(rejectTarget.id, reason);
          }
        }}
        submitting={actionLoading}
      />
    </div>
  );
}
