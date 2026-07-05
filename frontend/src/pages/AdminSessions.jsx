import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Calendar,
  CalendarClock,
  CheckCircle,
  Eye,
  X,
  XCircle,
} from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminKpiCard from "../components/AdminKpiCard";
import FilterChip from "../components/FilterChip";
import { AdminRatingsPanel } from "./AdminRatings";
import {
  computeAdminSessionStats,
  listAdminSessions,
} from "../api/admin";

const statusFilters = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "upcoming", label: "Upcoming" },
  { id: "cancelled", label: "Cancelled" },
];

const statusStyles = {
  completed: "bg-success/10 text-success",
  upcoming: "bg-accent-gold/10 text-accent-gold",
  cancelled: "bg-danger/10 text-danger",
};

const statusLabels = {
  completed: "Completed",
  upcoming: "Upcoming",
  cancelled: "Cancelled",
};

const outcomeStyles = {
  Resolved: "text-success",
  "Follow-up Booked": "text-primary",
  Rescheduled: "text-accent-gold",
  "No-show": "text-danger",
  Pending: "text-on-surface-muted",
};

function SessionDetailsModal({ session, onClose }) {
  if (!session) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Details for session ${session.id}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-primary/5 bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg font-semibold text-on-surface">
              {session.id}
            </h2>
            <span className="mt-1 inline-block rounded-full bg-surface-muted px-2 py-0.5 font-heading text-[10px] font-bold uppercase text-on-surface-muted">
              {session.type}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close session details"
            className="rounded-lg p-2 text-on-surface-subtle transition-colors hover:bg-surface-muted hover:text-on-surface"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <dl className="space-y-3 font-body text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Student</dt>
            <dd className="font-medium text-on-surface">{session.student}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Counsellor</dt>
            <dd className="font-medium text-on-surface">{session.counsellor}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Date</dt>
            <dd className="font-medium text-on-surface">{session.date}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Status</dt>
            <dd>
              <span
                className={`rounded-full px-2.5 py-1 font-body text-xs font-bold ${statusStyles[session.status]}`}
              >
                {statusLabels[session.status]}
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Outcome</dt>
            <dd
              className={`font-semibold ${outcomeStyles[session.outcome] ?? "text-on-surface"}`}
            >
              {session.outcome ?? "Pending"}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-primary py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
        >
          Close
        </button>
      </div>
    </div>
  );
}

const TABS = [
  { id: "sessions", label: "Sessions" },
  { id: "ratings", label: "Ratings" },
];

function SessionsTabBar({ activeTab, onTabChange }) {
  return (
    <div
      className="flex gap-2 rounded-2xl border border-outline-muted/30 bg-surface p-1.5"
      role="tablist"
      aria-label="Sessions sections"
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 rounded-xl px-4 py-2.5 font-heading text-sm font-semibold transition-colors ${
            activeTab === tab.id
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-muted hover:bg-surface-muted/60"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminSessions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "ratings" ? "ratings" : "sessions";

  const handleTabChange = (tabId) => {
    const next = new URLSearchParams(searchParams);
    if (tabId === "sessions") {
      next.delete("tab");
    } else {
      next.set("tab", tabId);
    }
    setSearchParams(next, { replace: true });
  };

  if (activeTab === "ratings") {
    return (
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
        <SessionsTabBar activeTab={activeTab} onTabChange={handleTabChange} />
        <AdminRatingsPanel />
      </div>
    );
  }

  return <AdminSessionsContent tabBar={<SessionsTabBar activeTab={activeTab} onTabChange={handleTabChange} />} />;
}

function AdminSessionsContent({ tabBar }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listAdminSessions();
      setSessions(rows);
    } catch (err) {
      setSessions([]);
      setError(err.message ?? "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sessions.filter((session) => {
      const matchesStatus =
        statusFilter === "all" || session.status === statusFilter;
      const matchesQuery =
        !query ||
        session.id.toLowerCase().includes(query) ||
        session.student.toLowerCase().includes(query) ||
        session.counsellor.toLowerCase().includes(query) ||
        session.type.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [sessions, search, statusFilter]);

  const sessionStats = useMemo(
    () => computeAdminSessionStats(sessions),
    [sessions],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      {tabBar}
      <AdminPageHeader
        eyebrow="Session management"
        title="Sessions"
        description="Track every counselling session across the platform — students, counsellors, dates, and outcomes."
        searchPlaceholder="Search by session ID, student, counsellor, or topic..."
        searchValue={search}
        onSearchChange={setSearch}
        stats={[
          { label: "Total", value: sessionStats.total, icon: Calendar },
          { label: "Upcoming", value: sessionStats.upcoming, icon: CalendarClock },
          { label: "Completed", value: sessionStats.completed, icon: CheckCircle },
        ]}
      />

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 font-body text-sm text-danger"
        >
          {error}
        </div>
      ) : null}

      <section aria-label="Session key metrics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminKpiCard
            icon={Calendar}
            label="Total Sessions"
            value={loading ? "…" : sessionStats.total}
            sublabel="in log"
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
          <AdminKpiCard
            icon={CheckCircle}
            label="Completed"
            value={loading ? "…" : sessionStats.completed}
            sublabel="Marked complete"
            iconBg="bg-soft-teal"
            iconColor="text-primary"
          />
          <AdminKpiCard
            icon={CalendarClock}
            label="Upcoming"
            value={loading ? "…" : sessionStats.upcoming}
            sublabel="Scheduled ahead"
            iconBg="bg-primary-accent/20"
            iconColor="text-primary-light"
          />
          <AdminKpiCard
            icon={XCircle}
            label="Cancelled"
            value={loading ? "…" : sessionStats.cancelled}
            sublabel="Rejected requests"
            iconBg="bg-danger/10"
            iconColor="text-danger"
          />
        </div>
      </section>

      <section
        aria-label="Session log"
        className="overflow-hidden rounded-[28px] border border-primary/5 bg-surface shadow-md"
      >
        <div className="flex flex-col gap-4 border-b border-outline-muted/10 p-5 md:flex-row md:items-center md:justify-between">
          <h2 className="font-heading text-lg font-semibold text-on-surface">
            Session Log
          </h2>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <FilterChip
                key={filter.id}
                label={filter.label}
                active={statusFilter === filter.id}
                onClick={() => setStatusFilter(filter.id)}
              />
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
              <p className="font-body text-sm text-on-surface-muted">
                Loading sessions…
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-muted font-heading text-sm font-semibold text-on-surface-muted">
                  <th scope="col" className="px-5 py-3.5">
                    Session
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Student
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Counsellor
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Date
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Outcome
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-muted/10">
                {filteredSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="transition-colors hover:bg-surface-muted/40"
                  >
                    <td className="px-5 py-4">
                      <p className="font-heading text-sm font-semibold text-on-surface">
                        {session.id}
                      </p>
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 font-heading text-[10px] font-bold uppercase text-on-surface-muted">
                        {session.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft-teal font-heading text-xs font-bold text-primary">
                          {session.studentInitials}
                        </div>
                        <span className="font-body text-sm text-on-surface">
                          {session.student}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-body text-sm text-on-surface">
                      {session.counsellor}
                    </td>
                    <td className="px-5 py-4 font-body text-xs text-on-surface-muted">
                      {session.date}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 font-body text-xs font-bold ${statusStyles[session.status]}`}
                      >
                        {statusLabels[session.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`font-body text-sm font-semibold ${outcomeStyles[session.outcome] ?? "text-on-surface"}`}
                      >
                        {session.outcome ?? "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSession(session)}
                        title={`View session ${session.id}`}
                        aria-label={`View session ${session.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-heading text-xs font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/5"
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted">
                <Calendar
                  className="h-6 w-6 text-on-surface-subtle"
                  aria-hidden="true"
                />
              </div>
              <p className="font-heading text-base font-semibold text-on-surface">
                No sessions match your filters
              </p>
              <p className="max-w-sm font-body text-sm text-on-surface-muted">
                Try adjusting your search or choosing a different status filter.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <SessionDetailsModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </div>
  );
}
