import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  UserSearch,
  X,
} from "lucide-react";
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

function DashboardPanel({ title, actionLabel, actionTo, children }) {
  return (
    <section className="flex h-full flex-col rounded-[28px] border border-primary/5 bg-surface p-5 shadow-md">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-outline-muted/10 pb-4">
        <h2 className="font-heading text-lg font-semibold text-on-surface">
          {title}
        </h2>
        {actionTo ? (
          <Link
            to={actionTo}
            className="shrink-0 font-heading text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
}

function RecommendedCarousel({ resources, loading }) {
  const trackRef = useRef(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = () => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    setCanScrollPrev(scrollLeft > 4);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const track = trackRef.current;
    if (!track) return undefined;

    track.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [resources, loading]);

  const scrollByCard = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * 260, behavior: "smooth" });
  };

  if (loading) {
    return (
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
    );
  }

  if (resources.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-outline-muted/30 px-4 py-6 text-center font-body text-sm text-on-surface-muted">
        No resources yet.{" "}
        <Link to="/student/resources" className="font-semibold text-primary">
          Browse the Resource Hub
        </Link>
      </p>
    );
  }

  const showControls = resources.length > 1;

  return (
    <div className="relative">
      {showControls ? (
        <>
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollPrev}
            aria-label="Previous recommended resource"
            className="absolute -left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-primary/10 bg-surface text-primary shadow-sm transition-all hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canScrollNext}
            aria-label="Next recommended resource"
            className="absolute -right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-primary/10 bg-surface text-primary shadow-sm transition-all hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </>
      ) : null}
      <div
        ref={trackRef}
        className={`scrollbar-hide flex snap-x gap-3 overflow-x-auto pb-1 ${
          showControls ? "px-1" : ""
        }`}
      >
        {resources.map((resource) => (
          <article
            key={resource.id}
            className="min-w-[240px] max-w-[240px] snap-start overflow-hidden rounded-2xl border border-soft-teal bg-surface shadow-sm"
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
              <h4 className="mb-1.5 line-clamp-2 font-heading text-sm font-semibold text-on-surface">
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
      {showControls ? (
        <p className="mt-2 text-center font-body text-xs text-on-surface-muted">
          Swipe or use arrows to see more recommendations
        </p>
      ) : null}
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

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <DashboardPanel title="My Sessions" actionLabel="View All" actionTo="/student/sessions">
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
                    className="flex items-center justify-between rounded-xl border border-soft-teal bg-surface-muted/30 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-soft-teal font-heading text-xs font-bold text-primary">
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
        </DashboardPanel>

        <DashboardPanel
          title="Recommended for You"
          actionLabel="Explore All"
          actionTo="/student/resources"
        >
          <RecommendedCarousel
            resources={recommendedResources}
            loading={recommendedLoading}
          />
        </DashboardPanel>
      </div>

      <footer className="mt-6 w-full border-t border-outline-muted/30 py-4">
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
          <p className="font-body text-xs font-medium text-on-surface-muted">
            © 2026 PeerPoint. Endorsed by Strathmore University Mental Health Club
          </p>
          <div className="flex gap-4">
            <Link
              to="/privacy-policy"
              className="font-body text-xs font-medium text-on-surface-muted transition-colors hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              to="/contact-support"
              className="font-body text-xs font-medium text-on-surface-muted transition-colors hover:text-primary"
            >
              Contact Support
            </Link>
            <Link
              to="/terms-of-service"
              className="font-body text-xs font-medium text-on-surface-muted transition-colors hover:text-primary"
            >
              Terms of Service
            </Link>
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
