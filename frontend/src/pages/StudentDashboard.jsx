import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ChevronRight,
  UserSearch,
  X,
} from "lucide-react";
import ComingSoonText from "../components/ComingSoonText";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { getRecommendedResources } from "../api/resources";
import { formatSessionStatus, getMySessions } from "../api/sessions";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function QuickActionCard({
  variant,
  icon: Icon,
  title,
  description,
  linkText,
  to,
}) {
  const isPrimary = variant === "primary";

  return (
    <Link
      to={to}
      className={`group block w-full rounded-2xl p-4 text-left shadow-md transition-transform duration-300 hover:scale-[1.02] hover:-translate-y-0.5 ${
        isPrimary
          ? "bg-primary text-on-primary"
          : "border border-soft-teal bg-surface shadow-sm"
      }`}
    >
      <Icon
        className={`mb-2 h-7 w-7 transition-transform duration-300 group-hover:rotate-12 ${
          isPrimary ? "text-on-primary" : "text-primary"
        }`}
        aria-hidden="true"
      />
      <h3
        className={`mb-1 font-heading text-lg font-semibold ${
          isPrimary ? "text-on-primary" : "text-on-surface"
        }`}
      >
        {title}
      </h3>
      <p
        className={`mb-3 font-body text-sm ${
          isPrimary ? "text-on-primary/90" : "text-on-surface-muted"
        }`}
      >
        {description}
      </p>
      <span
        className={`flex items-center gap-2 font-heading text-sm font-semibold ${
          isPrimary ? "text-on-primary" : "text-primary"
        }`}
      >
        {linkText}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </Link>
  );
}

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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted font-heading text-xs font-bold text-primary">
              {session.initials}
            </div>
            <div>
              <h2 className="font-heading text-base font-semibold text-on-surface">
                {session.counsellorName}
              </h2>
              <p className="font-body text-xs text-on-surface-muted">
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
        <dl className="space-y-2 font-body text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Topic</dt>
            <dd className="font-medium text-on-surface">{session.topic}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Format</dt>
            <dd className="font-medium text-on-surface">
              {session.formatLabel ?? session.format}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-primary py-2 font-heading text-xs font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const firstName = user.fullName.split(" ")[0];
  const [selectedSession, setSelectedSession] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState("");
  const [recommendedResources, setRecommendedResources] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      setSessionsLoading(true);
      setSessionsError("");
      try {
        const data = await getMySessions();
        if (!cancelled) {
          setUpcomingSessions(data.slice(0, 3));
        }
      } catch (error) {
        if (!cancelled) {
          if (error instanceof ApiError && error.status === 403) {
            setSessionsError("You are not authorized to view sessions.");
          } else {
            setSessionsError(
              error.message || "Unable to load sessions. Please try again.",
            );
          }
        }
      } finally {
        if (!cancelled) {
          setSessionsLoading(false);
        }
      }
    }

    loadSessions();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRecommended() {
      setRecommendedLoading(true);
      try {
        const data = await getRecommendedResources();
        if (!cancelled) {
          setRecommendedResources(data);
        }
      } catch {
        if (!cancelled) {
          setRecommendedResources([]);
        }
      } finally {
        if (!cancelled) {
          setRecommendedLoading(false);
        }
      }
    }

    loadRecommended();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col">
      <section className="mb-5">
        <h1 className="mb-1 font-heading text-2xl font-semibold text-on-surface md:text-[26px] md:leading-8">
          {getGreeting()}, {firstName}
        </h1>
        <p className="font-body text-base text-on-surface-muted">
          Your space for mindful growth and peer support.
        </p>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <QuickActionCard
          variant="primary"
          icon={UserSearch}
          title="Find a Counsellor"
          description="Connect with a trained peer counsellor today."
          linkText="Explore Directory"
          to="/student/directory"
        />
        <QuickActionCard
          variant="secondary"
          icon={CalendarCheck}
          title="Upcoming Sessions"
          description="View and manage your scheduled peer meetings."
          linkText="View Calendar"
          to="/student/sessions"
        />
        <QuickActionCard
          variant="secondary"
          icon={BookOpen}
          title="Browse Resources"
          description="Articles and tools to support your mental wellbeing."
          linkText="Read More"
          to="/student/resources"
        />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-on-surface">
              My Sessions
            </h2>
            <Link
              to="/student/sessions"
              className="font-heading text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {sessionsLoading ? (
              [1, 2].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl border border-soft-teal bg-surface-muted/40"
                />
              ))
            ) : sessionsError ? (
              <p className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 font-body text-sm text-danger">
                {sessionsError}
              </p>
            ) : upcomingSessions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-outline-muted/30 px-4 py-6 text-center font-body text-sm text-on-surface-muted">
                No upcoming sessions yet.{" "}
                <Link to="/student/directory" className="font-semibold text-primary">
                  Find a counsellor
                </Link>
              </p>
            ) : (
              upcomingSessions.map((session) => {
                const statusMeta = formatSessionStatus(session.status);
                return (
                  <article
                    key={session.id}
                    className="flex items-center justify-between rounded-xl border border-soft-teal bg-surface p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted font-heading text-xs font-bold text-primary">
                        {session.initials}
                      </div>
                      <div>
                        <h4 className="font-heading text-sm font-semibold text-on-surface">
                          {session.counsellorName}
                        </h4>
                        <p className="font-body text-xs font-medium text-on-surface-muted">
                          {session.datetime}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-body text-xs font-medium ${statusMeta.style}`}
                      >
                        {statusMeta.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedSession(session)}
                        className="font-heading text-xs font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:text-primary-dark"
                      >
                        View Details
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-on-surface">
              Recommended for You
            </h2>
            <Link
              to="/student/resources"
              className="font-heading text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Explore All
            </Link>
          </div>
          {recommendedLoading ? (
            <div className="flex snap-x gap-3 overflow-x-auto pb-1">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="min-w-[240px] snap-start overflow-hidden rounded-2xl border border-soft-teal bg-surface-muted/40"
                >
                  <div className="h-28 animate-pulse bg-surface-muted/60" />
                  <div className="space-y-2 p-3">
                    <div className="h-4 w-20 animate-pulse rounded bg-surface-muted/60" />
                    <div className="h-4 w-full animate-pulse rounded bg-surface-muted/60" />
                  </div>
                </div>
              ))}
            </div>
          ) : recommendedResources.length > 0 ? (
            <div className="scrollbar-hide flex snap-x gap-3 overflow-x-auto pb-1">
              {recommendedResources.map((resource) => (
                <article
                  key={resource.id}
                  className="min-w-[240px] snap-start overflow-hidden rounded-2xl border border-soft-teal bg-surface shadow-sm"
                >
                  <img
                    src={resource.image}
                    alt={resource.imageAlt}
                    className="h-28 w-full object-cover"
                  />
                  <div className="p-3">
                    <div className="mb-1.5 flex gap-2">
                      <span className="rounded-full bg-soft-teal px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider text-primary">
                        {resource.category}
                      </span>
                    </div>
                    <h4 className="mb-1.5 font-heading text-sm font-semibold text-on-surface">
                      {resource.title}
                    </h4>
                    <Link
                      to={`/student/resources/${resource.id}`}
                      className="group inline-flex items-center gap-1 font-heading text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      Read More
                      <ChevronRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      <footer className="mt-6 w-full border-t border-outline-muted/30 py-4">
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
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
        </div>
      </footer>

      <SessionDetailsModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </div>
  );
}
