import { Link } from "react-router-dom";
import { Clock, Star } from "lucide-react";

function AvailabilityBadge({ counsellor }) {
  if (counsellor.availabilityStatus === "available") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 font-heading text-[11px] font-semibold text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
        Available Now
      </span>
    );
  }

  if (counsellor.availabilityStatus === "busy") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 font-heading text-[11px] font-semibold text-warning">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden="true" />
        Busy Until {counsellor.busyUntil}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-outline-muted/20 px-2.5 py-1 font-heading text-[11px] font-semibold text-on-surface-subtle">
      <span className="h-1.5 w-1.5 rounded-full bg-outline-muted" aria-hidden="true" />
      Offline
    </span>
  );
}

export default function CounsellorCard({ counsellor }) {
  const isAvailable = counsellor.availabilityStatus === "available";
  const accentClass =
    counsellor.availabilityStatus === "available"
      ? "border-success/15"
      : counsellor.availabilityStatus === "busy"
        ? "border-warning/15"
        : "border-outline-muted/20";

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-3xl border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${accentClass}`}
    >
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {counsellor.photoUrl ? (
                <img
                  src={counsellor.photoUrl}
                  alt={`Portrait of ${counsellor.fullName}`}
                  className="h-16 w-16 rounded-2xl object-cover shadow-inner"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-soft-teal to-surface-muted font-heading text-lg font-bold text-primary-dark shadow-inner">
                  {counsellor.initials}
                </div>
              )}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface ${
                  counsellor.availabilityStatus === "available"
                    ? "bg-success"
                    : counsellor.availabilityStatus === "busy"
                      ? "bg-warning"
                      : "bg-outline-muted"
                }`}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading text-lg font-bold text-on-surface">
                {counsellor.shortName}
                <span className="ml-2 font-body text-sm font-medium text-on-surface-subtle">
                  Year {counsellor.year}
                </span>
              </h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 font-body text-sm text-on-surface-muted">
                  <Star
                    className="h-4 w-4 fill-accent-gold text-accent-gold"
                    aria-hidden="true"
                  />
                  {counsellor.rating}
                </span>
                <span className="text-outline-muted" aria-hidden="true">
                  ·
                </span>
                <span className="font-body text-sm text-on-surface-muted">
                  {counsellor.sessions} sessions
                </span>
              </div>
            </div>
          </div>
          <AvailabilityBadge counsellor={counsellor} />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {counsellor.specialties.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-soft-teal px-3 py-1 font-heading text-[11px] font-semibold uppercase tracking-wide text-primary"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mb-5 flex-1 font-body text-sm leading-relaxed text-on-surface-muted line-clamp-3">
          {counsellor.bio}
        </p>

        <div className="mb-5 flex items-center gap-2 rounded-xl bg-surface-muted/50 px-3.5 py-2.5">
          <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="font-body text-sm text-on-surface-muted">
            {counsellor.responseTime}
          </span>
        </div>

        <div className="flex gap-3">
          <Link
            to={`/student/counsellors/${counsellor.id}`}
            className="flex flex-1 items-center justify-center rounded-xl border border-primary/25 bg-surface px-4 py-3 text-center font-heading text-sm font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            View Profile
          </Link>
          {isAvailable ? (
            <Link
              to={`/student/book/${counsellor.id}`}
              className="flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-3 text-center font-heading text-sm font-semibold text-on-primary shadow-sm transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Request Session
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex flex-1 cursor-not-allowed items-center justify-center rounded-xl bg-outline-muted/30 px-4 py-3 font-heading text-sm font-semibold text-on-surface-subtle"
            >
              Notify Me
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
