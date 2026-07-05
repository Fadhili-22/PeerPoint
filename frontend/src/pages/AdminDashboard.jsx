import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Clock,
  Headset,
  Plus,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import ComingSoonButton from "../components/ComingSoonButton";
import { useAuth } from "../context/AuthContext";
import {
  getAdminDashboard,
  mapAdminDashboard,
  getAdminAnalytics,
  mapSessionTrendWeeks,
  mapStatusDistribution,
  mapCounsellorPerformance,
  mapTopResources,
} from "../api/admin";
import { AdminReportsSection } from "./AdminReports";

const kpiIcons = {
  users: Users,
  headset: Headset,
  calendar: Calendar,
  clock: Clock,
  book: BookOpen,
};

const defaultHeadlineStats = [
  { id: "students", label: "Students", value: "…", icon: Users },
  { id: "counsellors", label: "Counsellors", value: "…", icon: Headset },
  { id: "sessions", label: "Sessions", value: "…", icon: Calendar },
];

function formatDateTime(date) {
  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", " •");
}

function PulseBar({ label, value, tone = "primary" }) {
  const fillClass =
    tone === "warning"
      ? "bg-accent-gold"
      : tone === "muted"
        ? "bg-outline-muted/50"
        : "bg-primary";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="font-heading text-xs font-semibold text-on-surface-muted">
          {label}
        </span>
        <span className="font-heading text-xs font-bold text-on-surface">
          {value}%
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${fillClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

const PREVIEW_ROW_LIMIT = 5;

function HeadlineStat({ stat }) {
  const Icon = stat.icon ?? Users;

  return (
    <article className="flex min-w-[108px] flex-col items-center rounded-2xl border border-primary/5 bg-surface-muted/60 px-4 py-3 text-center shadow-sm transition-transform duration-300 hover:scale-[1.02] hover:-translate-y-0.5">
      <Icon className="mb-1 h-4 w-4 text-primary" aria-hidden="true" />
      <p className="font-heading text-2xl font-bold leading-none text-on-surface md:text-[28px]">
        {stat.value}
      </p>
      <p className="mt-1 font-body text-[11px] font-medium uppercase tracking-wide text-on-surface-muted">
        {stat.label}
      </p>
    </article>
  );
}

function ViewAllLink({ to, label }) {
  return (
    <Link
      to={to}
      className="font-heading text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      {label}
    </Link>
  );
}

function DirectoryPreviewCard({ title, count, description, icon: Icon, to }) {
  return (
    <article className="rounded-[28px] border border-primary/5 bg-surface p-5 shadow-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-lg font-semibold text-on-surface">{title}</h2>
        </div>
        <ViewAllLink to={to} label="View all" />
      </div>
      <p className="font-heading text-3xl font-semibold text-on-surface">{count}</p>
      <p className="mt-1 font-body text-sm text-on-surface-muted">{description}</p>
    </article>
  );
}

function KpiCard({ kpi }) {
  const Icon = kpiIcons[kpi.icon];

  return (
    <article
      className={`rounded-3xl bg-surface p-5 shadow-md transition-transform duration-300 hover:scale-[1.02] hover:-translate-y-0.5 ${
        kpi.urgent ? "border-2 border-accent-gold/25" : "border border-primary/5"
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className={`rounded-xl p-2.5 ${kpi.iconBg} ${kpi.iconColor}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        {kpi.urgent ? (
          <span className="rounded-full bg-accent-gold px-2 py-0.5 font-heading text-[10px] font-bold text-on-primary">
            URGENT
          </span>
        ) : kpi.trend ? (
          <span className="flex items-center font-body text-xs font-bold text-success">
            {kpi.trend}
            <TrendingUp className="ml-0.5 h-3.5 w-3.5" aria-hidden="true" />
          </span>
        ) : (
          <span className="font-body text-xs font-medium text-on-surface-muted">
            {kpi.sublabel}
          </span>
        )}
      </div>
      <p className="font-body text-xs font-medium text-on-surface-muted">
        {kpi.label}
      </p>
      <h3 className="font-heading text-2xl font-semibold text-on-surface md:text-[30px] md:leading-9">
        {kpi.value}
      </h3>
    </article>
  );
}

function SessionBarChart({ weeks }) {
  const [hoveredWeek, setHoveredWeek] = useState(null);

  return (
    <div>
      <div
        className="flex h-52 items-end justify-between gap-2"
        role="img"
        aria-label="Session analytics bar chart for the last 8 weeks"
      >
        {weeks.map((week, index) => {
          const isPrimary = week.height >= 85;
          const opacity =
            week.height >= 75
              ? isPrimary
                ? ""
                : "bg-primary-light/60"
              : week.height >= 55
                ? "bg-primary-light/40"
                : week.height >= 40
                  ? "bg-primary-light/30"
                  : "bg-primary-light/20";

          return (
            <div
              key={week.label}
              className="group relative flex-1"
              onMouseEnter={() => setHoveredWeek(index)}
              onMouseLeave={() => setHoveredWeek(null)}
              onFocus={() => setHoveredWeek(index)}
              onBlur={() => setHoveredWeek(null)}
            >
              {hoveredWeek === index && (
                <div className="absolute -top-6 left-1/2 z-10 -translate-x-1/2 rounded bg-on-surface px-1.5 py-0.5 font-body text-[10px] text-on-primary">
                  {week.value}
                </div>
              )}
              <div
                className={`rounded-t-md transition-all duration-300 ${
                  isPrimary ? "bg-primary" : opacity
                }`}
                style={{ height: `${week.height}%` }}
                tabIndex={0}
                role="presentation"
                aria-label={`${week.label}: ${week.value} sessions`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between font-heading text-[10px] font-bold uppercase text-on-surface-muted">
        {weeks.map((week) => (
          <span key={week.label}>{week.label}</span>
        ))}
      </div>
    </div>
  );
}

const DONUT_PATH =
  "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831";

function StatusDonutChart({ total, segments }) {
  let cumulativeOffset = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-44 w-44">
        <svg className="h-full w-full" viewBox="0 0 36 36" aria-hidden="true">
          {total === 0 ? (
            <path
              className="text-outline-muted/30"
              d={DONUT_PATH}
              fill="none"
              stroke="currentColor"
              strokeDasharray="100, 100"
              strokeWidth="4"
            />
          ) : (
            segments.map((segment) => {
              const dashOffset = -cumulativeOffset;
              cumulativeOffset += segment.percent;
              return (
                <path
                  key={segment.label}
                  className={segment.color}
                  d={DONUT_PATH}
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${segment.percent}, 100`}
                  strokeDashoffset={dashOffset}
                  strokeWidth="4"
                />
              );
            })
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-2xl font-bold text-on-surface">
            {total}
          </span>
          <span className="font-body text-[10px] uppercase text-on-surface-muted">
            Sessions
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${segment.color.replace("text-", "bg-")}`}
              aria-hidden="true"
            />
            <span className="font-body text-xs text-on-surface">
              {segment.label} ({segment.percent}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const firstName = user.fullName.split(" ")[0];
  const [search, setSearch] = useState("");
  const [headlineStats, setHeadlineStats] = useState(defaultHeadlineStats);
  const [platformKpis, setPlatformKpis] = useState([]);
  const [monthlyActiveStudentsKpi, setMonthlyActiveStudentsKpi] = useState(null);
  const [directoryPreviews, setDirectoryPreviews] = useState({
    students: { count: "…", description: "Active student accounts on the platform" },
    counsellors: { count: "…", description: "Counsellors listed in the directory" },
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [sessionTrendWeeks, setSessionTrendWeeks] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState({
    total: 0,
    segments: [],
  });
  const [counsellorPerformance, setCounsellorPerformance] = useState([]);
  const [topResources, setTopResources] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(() =>
    formatDateTime(new Date()),
  );

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setDashboardLoading(true);
      setDashboardError(null);
      try {
        const api = await getAdminDashboard();
        if (cancelled) return;
        const mapped = mapAdminDashboard(api);
        setHeadlineStats(
          mapped.headlineStats.map((stat) => ({
            ...stat,
            icon:
              stat.id === "students"
                ? Users
                : stat.id === "counsellors"
                  ? Headset
                  : Calendar,
          })),
        );
        setPlatformKpis(mapped.platformKpis);
        setMonthlyActiveStudentsKpi(mapped.monthlyActiveStudentsKpi);
        setDirectoryPreviews(mapped.directoryPreviews);
      } catch (err) {
        if (!cancelled) {
          setDashboardError(err.message ?? "Failed to load dashboard metrics.");
          setPlatformKpis([]);
        }
      } finally {
        if (!cancelled) {
          setDashboardLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      try {
        const api = await getAdminAnalytics();
        if (cancelled) return;
        setSessionTrendWeeks(mapSessionTrendWeeks(api));
        setStatusDistribution(mapStatusDistribution(api));
        setCounsellorPerformance(mapCounsellorPerformance(api.counsellor_performance));
        setTopResources(mapTopResources(api.top_resources));
      } catch (err) {
        if (!cancelled) {
          setAnalyticsError(err.message ?? "Failed to load analytics.");
          setSessionTrendWeeks([]);
          setStatusDistribution({ total: 0, segments: [] });
          setCounsellorPerformance([]);
          setTopResources([]);
        }
      } finally {
        if (!cancelled) {
          setAnalyticsLoading(false);
        }
      }
    }

    loadAnalytics();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(formatDateTime(new Date()));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredCounsellorPerformance = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return counsellorPerformance;
    return counsellorPerformance.filter((counsellor) =>
      counsellor.name.toLowerCase().includes(query),
    );
  }, [search, counsellorPerformance]);

  const filteredTopResources = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return topResources;
    return topResources.filter(
      (resource) =>
        resource.title.toLowerCase().includes(query) ||
        resource.category.toLowerCase().includes(query),
    );
  }, [search, topResources]);

  const counsellorPerformancePreview = useMemo(
    () => filteredCounsellorPerformance.slice(0, PREVIEW_ROW_LIMIT),
    [filteredCounsellorPerformance],
  );

  const topResourcesPreview = useMemo(
    () => filteredTopResources.slice(0, PREVIEW_ROW_LIMIT),
    [filteredTopResources],
  );

  const completionPercent =
    statusDistribution.segments.find(
      (segment) => segment.label === "Completed",
    )?.percent ?? 0;

  const primaryKpis = platformKpis.filter((kpi) => kpi.id !== "resources");

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      {dashboardError || analyticsError ? (
        <div
          role="alert"
          className="rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 font-body text-sm text-danger"
        >
          {dashboardError ?? analyticsError}
        </div>
      ) : null}
      <section
        aria-label="Admin search"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="relative flex-1 sm:max-w-md">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search platform analytics..."
            className="w-full rounded-2xl border border-primary/5 bg-surface py-2.5 pl-10 pr-4 font-body text-base text-on-surface shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-light"
            aria-label="Search platform analytics"
          />
        </div>
        <div className="hidden items-center gap-2 self-end rounded-2xl border border-primary/5 bg-surface px-4 py-2 shadow-sm sm:flex sm:self-auto">
          <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
          <time
            dateTime={new Date().toISOString()}
            className="font-heading text-sm font-semibold text-on-surface"
          >
            {currentDateTime}
          </time>
        </div>
      </section>

      <section className="rounded-[28px] border border-primary/5 bg-surface p-6 shadow-md md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex-1">
            <p className="mb-1 font-body text-sm font-medium text-on-surface-muted">
              Platform overview
            </p>
            <h1 className="font-heading text-2xl font-semibold text-on-surface md:text-[32px] md:leading-10">
              Welcome back, {firstName}
            </h1>
            <p className="mt-1 max-w-xl font-body text-base text-on-surface-muted">
              Monitor sessions, counsellor workload, and student engagement at a
              glance.
            </p>
            <div className="mt-6 max-w-sm">
              <PulseBar
                label="Session completion"
                value={completionPercent}
                tone="warning"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 xl:justify-end">
            {headlineStats.map((stat) => (
              <HeadlineStat key={stat.id} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Platform key metrics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dashboardLoading ? (
            <p className="col-span-full font-body text-sm text-on-surface-muted">
              Loading platform metrics…
            </p>
          ) : (
            <>
              {primaryKpis.map((kpi) => (
                <KpiCard key={kpi.id} kpi={kpi} />
              ))}
              {monthlyActiveStudentsKpi ? (
                <KpiCard key={monthlyActiveStudentsKpi.id} kpi={monthlyActiveStudentsKpi} />
              ) : null}
            </>
          )}
        </div>
      </section>

      <section
        aria-label="Directory previews"
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <DirectoryPreviewCard
          title="Students"
          count={directoryPreviews.students.count}
          description={directoryPreviews.students.description}
          icon={Users}
          to="/admin/students"
        />
        <DirectoryPreviewCard
          title="Counsellors"
          count={directoryPreviews.counsellors.count}
          description={directoryPreviews.counsellors.description}
          icon={Headset}
          to="/admin/counsellors"
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-5 lg:col-span-12">
          <article className="rounded-[28px] border border-primary/5 bg-surface p-5 shadow-md md:col-span-3">
            <h2 className="mb-5 font-heading text-lg font-semibold text-on-surface">
              Session Analytics
            </h2>
            <SessionBarChart weeks={sessionTrendWeeks} />
          </article>

          <article className="flex flex-col items-center rounded-[28px] border border-primary/5 bg-surface p-5 shadow-md md:col-span-2">
            <h2 className="mb-4 self-start font-heading text-lg font-semibold text-on-surface">
              Status Distribution
            </h2>
            {analyticsLoading ? (
              <p className="font-body text-sm text-on-surface-muted">Loading…</p>
            ) : (
              <StatusDonutChart
                total={statusDistribution.total}
                segments={statusDistribution.segments}
              />
            )}
          </article>
        </section>

        <section
          aria-label="Counsellor workload and performance"
          className="overflow-hidden rounded-[28px] border border-primary/5 bg-surface shadow-md lg:col-span-12"
        >
          <div className="flex items-center justify-between border-b border-outline-muted/10 p-5">
            <h2 className="font-heading text-lg font-semibold text-on-surface">
              Counsellor Workload &amp; Performance
            </h2>
            <ViewAllLink to="/admin/counsellors" label="View all" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-muted font-heading text-sm font-semibold text-on-surface-muted">
                  <th scope="col" className="px-5 py-3.5">
                    Counsellor
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Total Handled
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Response Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-muted/10">
                {analyticsLoading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-8 text-center font-body text-sm text-on-surface-muted"
                    >
                      Loading counsellor performance…
                    </td>
                  </tr>
                ) : counsellorPerformancePreview.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-8 text-center font-body text-sm text-on-surface-muted"
                    >
                      No counsellor performance data to preview.
                    </td>
                  </tr>
                ) : (
                  counsellorPerformancePreview.map((counsellor) => (
                    <tr
                      key={counsellor.id}
                      className="transition-colors hover:bg-surface-muted/40"
                    >
                      <td className="px-5 py-4 font-heading text-sm font-semibold text-on-surface">
                        {counsellor.name}
                      </td>
                      <td className="px-5 py-4 font-body text-sm text-on-surface">
                        {counsellor.sessionsHandled} Sessions
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 font-body text-xs font-bold ${
                              counsellor.responseVariant === "success"
                                ? "bg-success/10 text-success"
                                : counsellor.responseVariant === "danger"
                                  ? "bg-danger/10 text-danger"
                                  : "bg-accent-gold/10 text-accent-gold"
                            }`}
                          >
                            {counsellor.responseRate}%
                          </span>
                          <span className="font-body text-[10px] text-on-surface-muted">
                            {counsellor.responseLabel}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="lg:col-span-12">
          <article
            aria-label="Top performing resources"
            className="overflow-hidden rounded-[28px] border border-primary/5 bg-surface shadow-md"
          >
            <div className="flex flex-col items-start justify-between gap-4 border-b border-outline-muted/10 p-5 sm:flex-row sm:items-center">
              <h2 className="font-heading text-lg font-semibold text-on-surface">
                Top Performing Resources
              </h2>
              <div className="flex items-center gap-4">
                <ViewAllLink to="/admin/resources" label="View all" />
                <ComingSoonButton className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-heading text-sm font-semibold text-on-primary shadow-sm">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Publish New
                </ComingSoonButton>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-muted font-heading text-sm font-semibold text-on-surface-muted">
                    <th scope="col" className="px-5 py-3">
                      Resource Title
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Category
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Views
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Saves
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-muted/10">
                  {analyticsLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center font-body text-sm text-on-surface-muted"
                      >
                        Loading top resources…
                      </td>
                    </tr>
                  ) : topResourcesPreview.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center font-body text-sm text-on-surface-muted"
                      >
                        No published resources to preview.
                      </td>
                    </tr>
                  ) : (
                    topResourcesPreview.map((resource) => (
                      <tr
                        key={resource.id}
                        className="transition-colors hover:bg-soft-teal/30"
                      >
                        <td className="px-5 py-4 font-body font-medium text-primary">
                          {resource.title}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-surface-muted px-2 py-1 font-heading text-[10px] font-bold uppercase text-on-surface-muted">
                            {resource.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-body text-sm text-on-surface">
                          {resource.views}
                        </td>
                        <td className="px-5 py-4 font-body text-sm text-on-surface">
                          {resource.saves}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>

      <AdminReportsSection />

      <footer className="mt-2 flex flex-col items-center justify-between gap-4 border-t border-outline-muted/30 py-6 md:flex-row">
        <p className="font-body text-xs text-on-surface-muted">
          Endorsed by Strathmore University Mental Health Club
        </p>
        <div className="flex gap-6">
          <Link
            to="/privacy-policy"
            className="font-body text-xs text-on-surface-muted transition-colors hover:text-primary"
          >
            Privacy Policy
          </Link>
          <Link
            to="/contact-support"
            className="font-body text-xs text-on-surface-muted transition-colors hover:text-primary"
          >
            Contact Support
          </Link>
          <Link
            to="/terms-of-service"
            className="font-body text-xs text-on-surface-muted transition-colors hover:text-primary"
          >
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
