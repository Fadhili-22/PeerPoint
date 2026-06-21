import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, X } from "lucide-react";
import { upcomingSessions } from "../data/mockStudentDashboard";

const sessionStatusStyles = {
  confirmed: "bg-success/10 text-success",
  pending: "bg-accent-gold/20 text-accent-gold",
};

const sessionStatusLabels = {
  confirmed: "Confirmed",
  pending: "Pending",
};

function SessionDetailsModal({ session, onClose }) {
  if (!session) return null;

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
        <dl className="space-y-3 font-body text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Topic</dt>
            <dd className="font-medium text-on-surface">{session.topic}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Format</dt>
            <dd className="font-medium text-on-surface">{session.format}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Status</dt>
            <dd>
              <span
                className={`rounded-full px-2.5 py-0.5 font-body text-xs font-medium ${sessionStatusStyles[session.status]}`}
              >
                {sessionStatusLabels[session.status]}
              </span>
            </dd>
          </div>
        </dl>
        {session.notes ? (
          <p className="mt-4 rounded-xl bg-surface-muted/60 p-4 font-body text-sm text-on-surface-muted">
            {session.notes}
          </p>
        ) : null}
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

export default function MySessions() {
  const [selectedSession, setSelectedSession] = useState(null);

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

      {upcomingSessions.length > 0 ? (
        <div className="space-y-4">
          {upcomingSessions.map((session) => (
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
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 font-body text-xs font-medium ${
                    sessionStatusStyles[session.status]
                  }`}
                >
                  {sessionStatusLabels[session.status]}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSession(session)}
                  className="font-heading text-sm font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:text-primary-dark"
                >
                  View Details
                </button>
              </div>
            </article>
          ))}
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
        onClose={() => setSelectedSession(null)}
      />
    </div>
  );
}
