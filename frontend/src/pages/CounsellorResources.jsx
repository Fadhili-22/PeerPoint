import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ExternalLink,
  Eye,
  Inbox,
  Pencil,
  Plus,
  Send,
} from "lucide-react";
import { ResourceStatusBadge } from "../components/AdminResourceRowActions";
import { ApiError } from "../api/client";
import {
  listMyResources,
  submitResourceForReview,
} from "../api/resources";
import { formatResourceDisplayDate, isResourceSubmittable } from "../data/mockResources";

const submissionFilters = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "pending_review", label: "Pending Review" },
  { id: "published", label: "Published" },
  { id: "rejected", label: "Rejected" },
];

function SubmissionCard({ resource, onSubmitForReview, submittingId }) {
  const canEdit = resource.status === "draft" || resource.status === "rejected";
  const canSubmit = canEdit && isResourceSubmittable(resource);
  const isPublished = resource.status === "published";
  const isSubmitting = submittingId === resource.id;

  return (
    <article className="rounded-2xl border border-primary/5 bg-surface p-5 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="hidden h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:block">
            <img
              src={resource.image}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-base font-semibold text-on-surface">
                {resource.title}
              </h3>
              <ResourceStatusBadge status={resource.status} />
            </div>
            <p className="mb-2 font-body text-sm text-on-surface-muted line-clamp-2">
              {resource.description}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-xs text-on-surface-muted">
              <span className="rounded-full bg-surface-muted px-2 py-0.5 font-heading text-[10px] font-bold uppercase">
                {resource.category}
              </span>
              {resource.submittedAt ? (
                <span>Submitted {formatResourceDisplayDate(resource.submittedAt)}</span>
              ) : (
                <span>Updated {formatResourceDisplayDate(resource.updatedAt)}</span>
              )}
            </div>
            {resource.status === "rejected" && resource.rejectionReason ? (
              <p className="mt-3 rounded-xl border border-danger/20 bg-danger/5 px-3 py-2 font-body text-xs text-on-surface">
                <span className="font-semibold text-danger">Feedback:</span>{" "}
                {resource.rejectionReason}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          <Link
            to={`/counsellor/resources/${resource.id}/preview`}
            className="inline-flex items-center gap-2 rounded-xl border border-outline-muted/30 px-3 py-2 font-heading text-sm font-semibold text-on-surface-muted transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            Preview
          </Link>

          {canEdit ? (
            <Link
              to={`/counsellor/resources/${resource.id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border border-outline-muted/30 px-3 py-2 font-heading text-sm font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/5"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
          ) : null}

          {canEdit && !canSubmit ? (
            <Link
              to={`/counsellor/resources/${resource.id}/edit`}
              title="Complete all required fields before submitting"
              className="inline-flex items-center gap-2 rounded-xl border border-outline-muted/30 px-3 py-2 font-heading text-sm font-semibold text-on-surface-subtle"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Finish Draft to Submit
            </Link>
          ) : null}

          {canSubmit ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onSubmitForReview(resource.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? "Submitting…" : "Submit for Review"}
            </button>
          ) : null}

          {isPublished ? (
            <Link
              to={`/student/resources/${resource.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 font-heading text-sm font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              View Live
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function CounsellorResources() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [submittingId, setSubmittingId] = useState(null);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listMyResources();
      setSubmissions(data);
    } catch (loadError) {
      setSubmissions([]);
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : "Unable to load your submissions.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const counts = useMemo(() => {
    return submissions.reduce(
      (acc, resource) => {
        acc.all += 1;
        acc[resource.status] = (acc[resource.status] || 0) + 1;
        return acc;
      },
      { all: 0, draft: 0, pending_review: 0, published: 0, rejected: 0 },
    );
  }, [submissions]);

  const visibleSubmissions = useMemo(() => {
    if (activeFilter === "all") return submissions;
    return submissions.filter((resource) => resource.status === activeFilter);
  }, [submissions, activeFilter]);

  const handleSubmitForReview = async (resourceId) => {
    setSubmittingId(resourceId);
    setError("");
    try {
      await submitResourceForReview(resourceId);
      await loadSubmissions();
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : "Unable to submit resource for review.",
      );
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-1 font-heading text-2xl font-semibold text-on-surface md:text-[28px] md:leading-9">
            My Submissions
          </h1>
          <p className="font-body text-base text-on-surface-muted">
            Draft mental health articles and track their review status before they
            go live on the Resource Hub.
          </p>
        </div>
        <Link
          to="/counsellor/resources/new"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-primary px-4 py-2.5 font-heading text-sm font-semibold text-on-primary shadow-sm transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Submit Resource
        </Link>
      </header>

      {error ? (
        <p className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 font-body text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div
        className="mb-6 flex flex-wrap items-center gap-2"
        role="tablist"
        aria-label="Filter submissions by status"
      >
        {submissionFilters.map((filter) => {
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
        <p className="font-body text-sm text-on-surface-muted">Loading submissions…</p>
      ) : visibleSubmissions.length > 0 ? (
        <div className="space-y-4">
          {visibleSubmissions.map((resource) => (
            <SubmissionCard
              key={resource.id}
              resource={resource}
              onSubmitForReview={handleSubmitForReview}
              submittingId={submittingId}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-outline-muted/40 bg-surface px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted">
            <Inbox className="h-7 w-7 text-on-surface-subtle" aria-hidden="true" />
          </div>
          <h2 className="mb-2 font-heading text-xl font-bold text-on-surface">
            No submissions here
          </h2>
          <p className="mb-6 max-w-md font-body text-sm text-on-surface-muted">
            {submissions.length === 0
              ? "You have not submitted any resources yet. Share your knowledge with fellow students by drafting an article."
              : "There are no submissions matching this filter right now."}
          </p>
          {submissions.length === 0 ? (
            <Link
              to="/counsellor/resources/new"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Submit Resource
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
