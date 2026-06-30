import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Inbox,
  MapPin,
  Video,
  X,
} from "lucide-react";
import { ApiError } from "../api/client";
import RejectSessionModal from "../components/RejectSessionModal";
import {
  acceptSessionRequest,
  completeSessionRequest,
  formatSessionStatus,
  getCounsellorSessionRequestDetail,
  getCounsellorSessionRequests,
  rejectSessionRequest,
} from "../api/sessions";

const requestFilters = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Rejected" },
  { id: "completed", label: "Completed" },
];

const modeIcons = {
  online: Video,
  "in-person": MapPin,
};

function StatusBadge({ status }) {
  const meta = formatSessionStatus(status, "counsellor");
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 font-heading text-xs font-bold ${meta.style}`}
    >
      {meta.label}
    </span>
  );
}

function RequestCard({
  request,
  onAccept,
  onReject,
  onComplete,
  onViewDetails,
  actionLoading,
}) {
  const ModeIcon = modeIcons[request.mode];

  return (
    <article className="rounded-2xl border border-primary/5 bg-surface p-5 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-soft-teal font-heading text-sm font-bold text-primary">
            {request.initials}
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-base font-semibold text-on-surface">
                {request.name}
              </h3>
              <StatusBadge status={request.status} />
              {request.overdue ? (
                <span className="rounded-full bg-danger/10 px-2 py-0.5 font-body text-xs font-medium text-danger">
                  Overdue
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm text-on-surface-muted">
              <span className="rounded-full bg-soft-teal px-3 py-0.5 font-heading text-xs font-bold text-primary">
                {request.topic}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-on-surface-subtle" aria-hidden="true" />
                {request.preferredDate}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ModeIcon className="h-4 w-4 text-on-surface-subtle" aria-hidden="true" />
                {request.modeLabel}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 ${
                  request.overdue ? "font-medium text-danger" : ""
                }`}
              >
                <Clock className="h-4 w-4 text-on-surface-subtle" aria-hidden="true" />
                {request.requested}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          <button
            type="button"
            onClick={() => onViewDetails(request)}
            className="inline-flex items-center gap-2 rounded-xl border border-outline-muted/30 px-3 py-2 font-heading text-sm font-semibold text-on-surface-muted transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            View Details
          </button>

          {request.status === "pending" && (
            <>
              <button
                type="button"
                onClick={() => onReject(request)}
                disabled={actionLoading}
                title={`Reject request from ${request.name}`}
                aria-label={`Reject request from ${request.name}`}
                className="rounded-xl border border-outline-muted/30 p-2 text-on-surface-subtle transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:border-danger/30 hover:bg-danger/10 hover:text-danger focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2 disabled:opacity-50"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onAccept(request.id)}
                disabled={actionLoading}
                title={`Accept request from ${request.name}`}
                aria-label={`Accept request from ${request.name}`}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                Accept
              </button>
            </>
          )}

          {request.status === "accepted" && (
            <button
              type="button"
              onClick={() => onComplete(request.id)}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-2 font-heading text-sm font-semibold text-success transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Mark Complete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function RequestDetailsModal({
  request,
  detail,
  loading,
  onClose,
  onAccept,
  onReject,
  onComplete,
  actionLoading,
}) {
  if (!request) return null;
  const ModeIcon = modeIcons[request.mode];
  const display = detail ?? request;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Request details for ${request.name}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-primary/5 bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-soft-teal font-heading text-base font-bold text-primary">
              {display.initials}
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-on-surface">
                {display.name}
              </h2>
              <StatusBadge status={display.status} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="rounded-lg p-2 text-on-surface-subtle transition-colors hover:bg-surface-muted hover:text-on-surface"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {loading ? (
          <p className="mb-4 font-body text-sm text-on-surface-muted">
            Loading details...
          </p>
        ) : null}

        {display.studentEmail ? (
          <p className="mb-4 rounded-xl bg-soft-teal/50 px-4 py-3 font-body text-sm text-on-surface">
            Student email:{" "}
            <span className="font-semibold">{display.studentEmail}</span>
          </p>
        ) : null}

        <dl className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="mb-1 font-heading text-[11px] font-bold uppercase tracking-widest text-on-surface-subtle">
              Topic
            </dt>
            <dd className="font-body text-sm text-on-surface">{display.topic}</dd>
          </div>
          <div>
            <dt className="mb-1 font-heading text-[11px] font-bold uppercase tracking-widest text-on-surface-subtle">
              Preferred Date
            </dt>
            <dd className="inline-flex items-center gap-1.5 font-body text-sm text-on-surface">
              <Calendar className="h-4 w-4 text-on-surface-subtle" aria-hidden="true" />
              {display.preferredDate}
            </dd>
          </div>
          <div>
            <dt className="mb-1 font-heading text-[11px] font-bold uppercase tracking-widest text-on-surface-subtle">
              Format
            </dt>
            <dd className="inline-flex items-center gap-1.5 font-body text-sm text-on-surface">
              <ModeIcon className="h-4 w-4 text-on-surface-subtle" aria-hidden="true" />
              {display.modeLabel}
            </dd>
          </div>
          <div>
            <dt className="mb-1 font-heading text-[11px] font-bold uppercase tracking-widest text-on-surface-subtle">
              Duration
            </dt>
            <dd className="inline-flex items-center gap-1.5 font-body text-sm text-on-surface">
              <Clock className="h-4 w-4 text-on-surface-subtle" aria-hidden="true" />
              {display.duration}
            </dd>
          </div>
        </dl>

        <div className="mb-6">
          <dt className="mb-1 font-heading text-[11px] font-bold uppercase tracking-widest text-on-surface-subtle">
            Message
          </dt>
          <p className="rounded-xl bg-surface-muted/60 p-4 font-body text-sm leading-relaxed text-on-surface-muted">
            {display.message}
          </p>
        </div>

        {request.status === "pending" ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onReject(request)}
              disabled={actionLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-muted/30 px-4 py-2.5 font-heading text-sm font-semibold text-on-surface-muted transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:border-danger/30 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Reject
            </button>
            <button
              type="button"
              onClick={() => onAccept(request.id)}
              disabled={actionLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Accept Request
            </button>
          </div>
        ) : request.status === "accepted" ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-outline-muted/30 px-4 py-2.5 font-heading text-sm font-semibold text-on-surface-muted"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onComplete(request.id)}
              disabled={actionLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-success px-5 py-2.5 font-heading text-sm font-semibold text-on-primary disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Mark Complete
            </button>
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-primary px-5 py-2.5 font-heading text-sm font-semibold text-on-primary"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CounsellorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestDetail, setRequestDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCounsellorSessionRequests();
      setRequests(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("You are not authorized to view session requests.");
      } else {
        setError(err.message || "Unable to load requests. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    if (!selectedRequest) {
      setRequestDetail(null);
      return;
    }

    let cancelled = false;

    async function loadDetail() {
      setDetailLoading(true);
      try {
        const detail = await getCounsellorSessionRequestDetail(selectedRequest.id);
        if (!cancelled) {
          setRequestDetail(detail);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 404) {
            setError("Request not found.");
            setSelectedRequest(null);
          }
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false);
        }
      }
    }

    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedRequest]);

  const counts = useMemo(() => {
    return requests.reduce(
      (acc, request) => {
        acc.all += 1;
        acc[request.status] = (acc[request.status] || 0) + 1;
        return acc;
      },
      { all: 0, pending: 0, accepted: 0, rejected: 0, completed: 0 },
    );
  }, [requests]);

  const visibleRequests = useMemo(() => {
    if (activeFilter === "all") return requests;
    return requests.filter((request) => request.status === activeFilter);
  }, [requests, activeFilter]);

  const handleAccept = async (id) => {
    setActionLoading(true);
    try {
      await acceptSessionRequest(id);
      await loadRequests();
      if (selectedRequest?.id === id) {
        const detail = await getCounsellorSessionRequestDetail(id);
        setRequestDetail(detail);
      }
    } catch (err) {
      setError(err.message || "Unable to accept request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id, reason) => {
    setActionLoading(true);
    try {
      await rejectSessionRequest(id, reason);
      setRejectTarget(null);
      setSelectedRequest(null);
      await loadRequests();
    } catch (err) {
      setError(err.message || "Unable to reject request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (id) => {
    setActionLoading(true);
    try {
      await completeSessionRequest(id);
      await loadRequests();
      if (selectedRequest?.id === id) {
        const detail = await getCounsellorSessionRequestDetail(id);
        setRequestDetail(detail);
      }
    } catch (err) {
      setError(err.message || "Unable to mark request complete.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col">
      <header className="mb-6">
        <h1 className="mb-1 font-heading text-2xl font-semibold text-on-surface md:text-[28px] md:leading-9">
          Session Requests
        </h1>
        <p className="font-body text-base text-on-surface-muted">
          Review, accept, and manage incoming peer counselling requests.
        </p>
      </header>

      {error ? (
        <p className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 font-body text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div
        className="mb-6 flex flex-wrap items-center gap-2"
        role="tablist"
        aria-label="Filter requests by status"
      >
        {requestFilters.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveFilter(filter.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-heading text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                isActive
                  ? "bg-primary text-on-primary"
                  : "bg-surface text-on-surface-muted shadow-sm hover:text-primary"
              }`}
            >
              {filter.label}
              <span
                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                  isActive
                    ? "bg-on-primary/20 text-on-primary"
                    : "bg-surface-muted text-on-surface-subtle"
                }`}
              >
                {counts[filter.id] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl border border-primary/5 bg-surface-muted/40"
            />
          ))}
        </div>
      ) : visibleRequests.length > 0 ? (
        <div className="space-y-4">
          {visibleRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onAccept={handleAccept}
              onReject={setRejectTarget}
              onComplete={handleComplete}
              onViewDetails={setSelectedRequest}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-outline-muted/40 bg-surface px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted">
            <Inbox className="h-7 w-7 text-on-surface-subtle" aria-hidden="true" />
          </div>
          <h2 className="mb-2 font-heading text-xl font-bold text-on-surface">
            No requests here
          </h2>
          <p className="max-w-md font-body text-sm text-on-surface-muted">
            There are no requests matching this filter right now. New requests
            will appear here as students reach out.
          </p>
        </div>
      )}

      <RequestDetailsModal
        request={selectedRequest}
        detail={requestDetail}
        loading={detailLoading}
        onClose={() => setSelectedRequest(null)}
        onAccept={handleAccept}
        onReject={setRejectTarget}
        onComplete={handleComplete}
        actionLoading={actionLoading}
      />

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
