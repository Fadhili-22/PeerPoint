import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

export default function CounsellorCard({ counsellor }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-outline-muted/20 bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
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
            </div>
            <div className="min-w-0">
              <h3 className="font-heading text-lg font-bold text-on-surface">
                {counsellor.shortName}
                <span className="ml-2 font-body text-sm font-medium text-on-surface-subtle">
                  Year {counsellor.year}
                </span>
              </h3>
              <p className="mt-1.5 font-body text-sm text-on-surface-muted">
                {counsellor.sessions} sessions
              </p>
            </div>
          </div>
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
          <Link
            to={`/student/book/${counsellor.id}`}
            className="flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-3 text-center font-heading text-sm font-semibold text-on-primary shadow-sm transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Request Session
          </Link>
        </div>
      </div>
    </article>
  );
}
