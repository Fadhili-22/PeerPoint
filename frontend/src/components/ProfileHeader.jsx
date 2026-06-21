import { Award, Clock, Languages, Star } from "lucide-react";

function StatPill({ value, label, icon: StatIcon }) {
  return (
    <div className="flex flex-1 flex-col items-center rounded-2xl border border-outline-muted/15 bg-surface-muted/40 px-4 py-3.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      {StatIcon && <StatIcon className="mb-1.5 h-4 w-4 text-primary" aria-hidden="true" />}
      <p className="font-heading text-xl font-extrabold text-on-surface">{value}</p>
      <p className="mt-0.5 font-heading text-[10px] font-bold uppercase tracking-wider text-on-surface-subtle">
        {label}
      </p>
    </div>
  );
}

export default function ProfileHeader({ counsellor }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-outline-muted/20 bg-surface shadow-[0_8px_30px_rgba(17,29,39,0.06)]">
      <div className="h-24 bg-gradient-to-r from-primary/15 via-soft-teal to-primary-accent/20" />
      <div className="relative px-6 pb-6">
        <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="relative">
              {counsellor.photoUrl ? (
                <img
                  src={counsellor.photoUrl}
                  alt={`Portrait of ${counsellor.fullName}`}
                  className="h-24 w-24 rounded-2xl border-4 border-surface object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-surface bg-gradient-to-br from-primary/20 to-primary-accent/40 font-heading text-2xl font-bold text-primary-dark shadow-lg">
                  {counsellor.initials}
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-surface ${
                  counsellor.isAvailable ? "bg-success" : "bg-warning"
                }`}
                aria-hidden="true"
              />
            </div>
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl font-extrabold text-on-surface">
                  {counsellor.shortName}
                </h1>
                {counsellor.isAvailable && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 font-heading text-[11px] font-semibold text-success">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                    Available Now
                  </span>
                )}
              </div>
              <p className="mt-1 font-body text-sm text-on-surface-muted">
                {counsellor.yearLabel} Year — {counsellor.program}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-heading text-[11px] font-semibold text-primary-dark">
                  <Award className="h-3 w-3 text-primary" aria-hidden="true" />
                  {counsellor.role}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 font-heading text-[11px] font-semibold text-on-surface-muted">
                  <Languages className="h-3 w-3 text-primary" aria-hidden="true" />
                  {counsellor.languages.join(" & ")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-gold/10 px-2.5 py-1 font-heading text-[11px] font-semibold text-accent-gold">
                  <Star
                    className="h-3 w-3 fill-accent-gold text-accent-gold"
                    aria-hidden="true"
                  />
                  {counsellor.rating}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatPill value={counsellor.sessions} label="Sessions" />
          <StatPill value={counsellor.joined} label="Joined" />
          <StatPill
            value={counsellor.responseDisplay}
            label="Response"
            icon={Clock}
          />
        </div>
      </div>
    </section>
  );
}
