import { useMemo, useState } from "react";
import {
  BarChart3,
  Calendar,
  Clock,
  Download,
  FileText,
  Smile,
  Users,
} from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminKpiCard from "../components/AdminKpiCard";
import ComingSoonButton from "../components/ComingSoonButton";
import {
  exportOptions,
  growthMetrics,
  reportKpis,
  sessionTrend,
  topCategories,
  usageBreakdown,
} from "../data/mockAdminReports";

const kpiIcons = {
  users: Users,
  calendar: Calendar,
  smile: Smile,
  clock: Clock,
};

function PulseBar({ label, value, valueLabel, tone = "primary" }) {
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
          {valueLabel ?? `${value}%`}
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

function SessionBarChart({ weeks }) {
  const [hoveredWeek, setHoveredWeek] = useState(null);

  return (
    <div>
      <div
        className="flex h-52 items-end justify-between gap-2"
        role="img"
        aria-label="Session trend bar chart for the last 8 weeks"
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

export default function AdminReports() {
  const [search, setSearch] = useState("");
  const [trendPeriod, setTrendPeriod] = useState("8weeks");

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return topCategories;
    return topCategories.filter((category) =>
      category.label.toLowerCase().includes(query),
    );
  }, [search]);

  const trendWeeks = useMemo(() => {
    if (trendPeriod === "8weeks") return sessionTrend.weeks;
    return sessionTrend.weeks.map((week) => ({
      ...week,
      value: Math.round(week.value * 1.35),
      height: Math.min(100, Math.round(week.height * 1.15)),
    }));
  }, [trendPeriod]);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <AdminPageHeader
        eyebrow="Insights & analytics"
        title="Reports"
        description="Usage analytics, growth metrics, and session trends across PeerPoint."
        searchPlaceholder="Search reports and metrics..."
        searchValue={search}
        onSearchChange={setSearch}
        actions={
          <ComingSoonButton className="hidden items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 font-heading text-sm font-semibold text-on-primary shadow-sm sm:flex">
            <Download className="h-4 w-4" aria-hidden="true" />
            Export All
          </ComingSoonButton>
        }
      />

      <section aria-label="Report key metrics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {reportKpis.map((kpi) => (
            <AdminKpiCard
              key={kpi.id}
              icon={kpiIcons[kpi.icon]}
              label={kpi.label}
              value={kpi.value}
              trend={kpi.trend}
              trendDown={kpi.id === "response"}
              sublabel={kpi.sublabel}
              iconBg={kpi.iconBg}
              iconColor={kpi.iconColor}
            />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section
          aria-label="Session trends"
          className="rounded-[28px] border border-primary/5 bg-surface p-5 shadow-md lg:col-span-7"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="font-heading text-lg font-semibold text-on-surface">
                Session Trends
              </h2>
            </div>
            <label className="sr-only" htmlFor="trend-period">
              Trend period
            </label>
            <select
              id="trend-period"
              value={trendPeriod}
              onChange={(event) => setTrendPeriod(event.target.value)}
              className="rounded-xl bg-surface-muted px-2.5 py-1.5 font-body text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary-light"
            >
              <option value="8weeks">Last 8 Weeks</option>
              <option value="6months">Last 6 Months</option>
            </select>
          </div>
          <SessionBarChart weeks={trendWeeks} />
        </section>

        <section
          aria-label="Growth metrics"
          className="rounded-[28px] border border-primary/5 bg-surface p-5 shadow-md lg:col-span-5"
        >
          <h2 className="mb-5 font-heading text-lg font-semibold text-on-surface">
            Growth Metrics
          </h2>
          <div className="space-y-4">
            {growthMetrics.map((metric) => (
              <PulseBar
                key={metric.id}
                label={metric.label}
                value={metric.percent}
                valueLabel={metric.value}
                tone={metric.tone}
              />
            ))}
          </div>
        </section>

        <section
          aria-label="Usage analytics"
          className="rounded-[28px] border border-primary/5 bg-surface p-5 shadow-md lg:col-span-7"
        >
          <h2 className="mb-5 font-heading text-lg font-semibold text-on-surface">
            Usage Analytics
          </h2>
          <div className="space-y-4">
            {usageBreakdown.map((item) => (
              <PulseBar
                key={item.id}
                label={item.label}
                value={item.percent}
                valueLabel={item.value}
              />
            ))}
          </div>
        </section>

        <section
          aria-label="Top session categories"
          className="overflow-hidden rounded-[28px] border border-primary/5 bg-surface shadow-md lg:col-span-5"
        >
          <div className="border-b border-outline-muted/10 p-5">
            <h2 className="font-heading text-lg font-semibold text-on-surface">
              Top Session Categories
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-muted font-heading text-sm font-semibold text-on-surface-muted">
                  <th scope="col" className="px-5 py-3">
                    Category
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Sessions
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-muted/10">
                {filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition-colors hover:bg-surface-muted/40"
                  >
                    <td className="px-5 py-4 font-body font-medium text-on-surface">
                      {category.label}
                    </td>
                    <td className="px-5 py-4 font-body text-sm text-on-surface">
                      {category.sessions}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-soft-teal px-2.5 py-1 font-heading text-xs font-bold text-primary">
                        {category.percent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          aria-label="Export reports"
          className="lg:col-span-12"
        >
          <div className="mb-4 flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="font-heading text-lg font-semibold text-on-surface">
              Export Reports
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {exportOptions.map((option) => (
              <article
                key={option.id}
                className="flex flex-col rounded-3xl border border-primary/5 bg-surface p-5 shadow-md transition-transform duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="rounded-full bg-surface-muted px-2.5 py-1 font-heading text-[10px] font-bold uppercase text-on-surface-muted">
                    {option.format}
                  </span>
                </div>
                <h3 className="font-heading text-base font-semibold text-on-surface">
                  {option.title}
                </h3>
                <p className="mt-1 flex-1 font-body text-sm text-on-surface-muted">
                  {option.description}
                </p>
                <ComingSoonButton className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-heading text-sm font-semibold text-on-primary shadow-sm">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Export {option.format}
                </ComingSoonButton>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
