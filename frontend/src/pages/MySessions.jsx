import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, Star, X } from "lucide-react";
import { ApiError } from "../api/client";
import {
  formatSessionStatus,
  getMySessionDetail,
  getMySessionRequests,
  submitSessionRating,
} from "../api/sessions";

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1" role="group" aria-label="Select a star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="rounded-lg p-1 transition-colors hover:bg-surface-muted"
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          aria-pressed={value === star}
        >
          <Star
            className={`h-7 w-7 ${
              star <= value
                ? "fill-accent-gold text-accent-gold"
                : "text-outline-muted"
            }`}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}

function SessionDetailsModal({
  session,
  detail,
  loading,
  onClose,
  showRatingForm,
  onOpenRatingForm,
  ratingStars,
  onRatingStarsChange,
  ratingComment,
  onRatingCommentChange,
  ratingSubmitting,
  ratingError,
  ratingConfirmation,
  onSubmitRating,
}) {
  if (!session) return null;

  const statusMeta = formatSessionStatus(session.status);
  const isRejected = session.status === "rejected";
  const isCompleted = session.status === "completed";
  const showContactInfo = ["accepted", "completed"].includes(session.status);
  const hasSubmittedRating =
    session.hasRating || ratingConfirmation?.sessionId === session.id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Session with ${session.counsellorName}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-primary/5 bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-muted font-heading text-sm font-bold text-primary">
              {session.initials}
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-on-surface">
                {session.counsellorName}
              </h2>
              <p className="font-body text-sm text-on-surface-muted">
                {session.datetime}
              </p>
            </div>
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

        {isRejected ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-outline-muted/30 bg-surface-muted/50 p-4">
              <p className="font-body text-sm leading-relaxed text-on-surface-muted">
                The counsellor couldn&apos;t meet with you on this day. Would you
                like to book a session with another counsellor?
              </p>
              {session.rejectionReason ? (
                <p className="mt-3 rounded-lg bg-surface px-3 py-2 font-body text-sm italic text-on-surface-muted">
                  &ldquo;{session.rejectionReason}&rdquo;
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/student/directory"
                onClick={onClose}
                className="flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-3 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
              >
                Browse Counsellors
              </Link>
              <Link
                to="/student"
                onClick={onClose}
                className="flex flex-1 items-center justify-center rounded-xl border border-soft-teal bg-surface px-4 py-3 font-heading text-sm font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <>
            <dl className="space-y-3 font-body text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-muted">Topic</dt>
                <dd className="font-medium text-on-surface">{session.topic}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-muted">Format</dt>
                <dd className="font-medium text-on-surface">
                  {detail?.formatLabel ?? session.formatLabel}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-muted">Status</dt>
                <dd>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-body text-xs font-medium ${statusMeta.style}`}
                  >
                    {statusMeta.label}
                  </span>
                </dd>
              </div>
              {showContactInfo && detail?.counsellorEmail ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-on-surface-muted">Email</dt>
                  <dd className="font-medium text-on-surface">
                    {detail.counsellorEmail}
                  </dd>
                </div>
              ) : null}
              {showContactInfo && detail?.counsellorPhone ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-on-surface-muted">Phone</dt>
                  <dd className="font-medium text-on-surface">
                    {detail.counsellorPhone}
                  </dd>
                </div>
              ) : null}
            </dl>
            {loading ? (
              <p className="mt-4 font-body text-sm text-on-surface-muted">
                Loading details...
              </p>
            ) : detail?.notes ? (
              <p className="mt-4 rounded-xl bg-surface-muted/60 p-4 font-body text-sm text-on-surface-muted">
                {detail.notes}
              </p>
            ) : null}

            {isCompleted ? (
              <div className="mt-5 border-t border-outline-muted/20 pt-5">
                {hasSubmittedRating ? (
                  <div className="rounded-xl bg-soft-teal/40 px-4 py-3">
                    <p className="font-body text-sm font-medium text-on-surface">
                      Thanks for your feedback.
                    </p>
                    {ratingConfirmation?.sessionId === session.id ? (
                      <div className="mt-2 flex gap-1" aria-hidden="true">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= ratingConfirmation.stars
                                ? "fill-accent-gold text-accent-gold"
                                : "text-outline-muted"
                            }`}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : showRatingForm ? (
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 font-heading text-sm font-semibold text-on-surface">
                        Rate this session
                      </p>
                      <StarPicker
                        value={ratingStars}
                        onChange={onRatingStarsChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="session-rating-comment"
                        className="font-heading text-sm font-semibold text-on-surface-muted"
                      >
                        Comment (optional)
                      </label>
                      <textarea
                        id="session-rating-comment"
                        value={ratingComment}
                        onChange={(event) =>
                          onRatingCommentChange(event.target.value)
                        }
                        rows={3}
                        placeholder="Share any feedback about your session..."
                        className="w-full rounded-xl border border-outline-muted bg-transparent px-4 py-3 font-body text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    {ratingError ? (
                      <p
                        className="font-body text-sm text-danger"
                        role="alert"
                      >
                        {ratingError}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onClick={onSubmitRating}
                      disabled={ratingSubmitting}
                      className="w-full rounded-xl bg-primary py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {ratingSubmitting ? "Submitting..." : "Submit Rating"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenRatingForm}
                    className="w-full rounded-xl border border-primary/20 bg-soft-teal/40 py-2.5 font-heading text-sm font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
                  >
                    Rate this session
                  </button>
                )}
              </div>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-primary py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function MySessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [ratingConfirmation, setRatingConfirmation] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      setLoading(true);
      setError("");
      try {
        const data = await getMySessionRequests();
        if (!cancelled) {
          setSessions(data);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 403) {
            setError("You are not authorized to view sessions.");
          } else {
            setError(err.message || "Unable to load sessions. Please try again.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSessions();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedSession) {
      setSessionDetail(null);
      return;
    }

    if (!["accepted", "completed"].includes(selectedSession.status)) {
      setSessionDetail(null);
      return;
    }

    let cancelled = false;

    async function loadDetail() {
      setDetailLoading(true);
      try {
        const detail = await getMySessionDetail(selectedSession.id);
        if (!cancelled) {
          setSessionDetail(detail);
        }
      } catch {
        if (!cancelled) {
          setSessionDetail(null);
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
  }, [selectedSession]);

  const handleCloseModal = () => {
    setSelectedSession(null);
    setShowRatingForm(false);
    setRatingStars(0);
    setRatingComment("");
    setRatingError("");
  };

  const handleOpenSession = (session, openRating = false) => {
    setSelectedSession(session);
    setShowRatingForm(openRating);
    setRatingStars(0);
    setRatingComment("");
    setRatingError("");
  };

  const handleSubmitRating = async () => {
    if (!selectedSession) return;

    if (ratingStars < 1 || ratingStars > 5) {
      setRatingError("Please select a star rating between 1 and 5.");
      return;
    }

    setRatingSubmitting(true);
    setRatingError("");
    try {
      await submitSessionRating(selectedSession.id, {
        stars: ratingStars,
        comment: ratingComment,
      });
      setSessions((current) =>
        current.map((session) =>
          session.id === selectedSession.id
            ? { ...session, hasRating: true }
            : session,
        ),
      );
      setSelectedSession((current) =>
        current ? { ...current, hasRating: true } : current,
      );
      setRatingConfirmation({
        sessionId: selectedSession.id,
        stars: ratingStars,
      });
      setShowRatingForm(false);
      setRatingStars(0);
      setRatingComment("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setRatingError("You have already rated this session.");
        setSessions((current) =>
          current.map((session) =>
            session.id === selectedSession.id
              ? { ...session, hasRating: true }
              : session,
          ),
        );
      } else {
        setRatingError(err.message || "Unable to submit rating.");
      }
    } finally {
      setRatingSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col">
      <header className="mb-8">
        <h1 className="mb-2 font-heading text-[28px] font-bold text-on-surface md:text-[36px]">
          My Sessions
        </h1>
        <p className="font-body text-base text-on-surface-muted">
          View and manage your upcoming peer counselling sessions.
        </p>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-3xl border border-soft-teal bg-surface-muted/50"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-danger/20 bg-danger/5 px-6 py-8 text-center">
          <p className="font-body text-sm text-danger">{error}</p>
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session) => {
            const statusMeta = formatSessionStatus(session.status);
            const canRate =
              session.status === "completed" && !session.hasRating;
            return (
              <article
                key={session.id}
                className="flex flex-col gap-4 rounded-3xl border border-soft-teal bg-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-muted font-heading text-sm font-bold text-primary">
                    {session.initials}
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-semibold text-on-surface">
                      {session.counsellorName}
                    </h2>
                    <p className="font-body text-sm text-on-surface-muted">
                      {session.datetime}
                    </p>
                    {session.status === "rejected" ? (
                      <p className="mt-1 font-body text-xs text-on-surface-muted">
                        This counsellor couldn&apos;t meet on this day.
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {session.overdue ? (
                    <span className="rounded-full bg-danger/10 px-3 py-1 font-body text-xs font-medium text-danger">
                      Overdue
                    </span>
                  ) : null}
                  <span
                    className={`rounded-full px-3 py-1 font-body text-xs font-medium ${statusMeta.style}`}
                  >
                    {statusMeta.label}
                  </span>
                  {canRate ? (
                    <button
                      type="button"
                      onClick={() => handleOpenSession(session, true)}
                      className="rounded-full bg-accent-gold/15 px-3 py-1 font-heading text-xs font-semibold text-accent-gold transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
                    >
                      Rate this session
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleOpenSession(session)}
                    className="font-heading text-sm font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:text-primary-dark"
                  >
                    {session.status === "rejected" ? "View Options" : "View Details"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-outline-muted/40 bg-surface px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted">
            <CalendarCheck
              className="h-7 w-7 text-on-surface-subtle"
              aria-hidden="true"
            />
          </div>
          <h2 className="mb-2 font-heading text-xl font-bold text-on-surface">
            No sessions yet
          </h2>
          <p className="mb-6 max-w-md font-body text-sm text-on-surface-muted">
            When you book a session with a peer counsellor, it will appear here.
          </p>
          <Link
            to="/student/directory"
            className="rounded-xl bg-primary px-5 py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Find a Counsellor
          </Link>
        </div>
      )}

      <SessionDetailsModal
        session={selectedSession}
        detail={sessionDetail}
        loading={detailLoading}
        onClose={handleCloseModal}
        showRatingForm={showRatingForm}
        onOpenRatingForm={() => setShowRatingForm(true)}
        ratingStars={ratingStars}
        onRatingStarsChange={setRatingStars}
        ratingComment={ratingComment}
        onRatingCommentChange={setRatingComment}
        ratingSubmitting={ratingSubmitting}
        ratingError={ratingError}
        ratingConfirmation={ratingConfirmation}
        onSubmitRating={handleSubmitRating}
      />
    </div>
  );
}
