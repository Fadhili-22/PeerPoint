import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCircle,
  ChevronRight,
  Clock,
  Filter,
  Headset,
  Plus,
  Search,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import ComingSoonButton from "../components/ComingSoonButton";
import ComingSoonText from "../components/ComingSoonText";
import { useAuth } from "../context/AuthContext";
import { useResources } from "../context/ResourcesContext";
import { listPendingReviewResources, reviewResource as reviewResourceApi } from "../api/resources";
import {
  getAdminDashboard,
  mapAdminDashboard,
  listAccountRequests,
  approveAccountRequest,
  rejectAccountRequest,
  listAdminNotifications,
  getAdminAnalytics,
  mapSessionTrendWeeks,
  mapStatusDistribution,
  mapCounsellorPerformance,
  mapTopResources,
} from "../api/admin";
import { formatResourceDisplayDate } from "../data/mockResources";
import {
  attentionItems,
  platformHealth,
} from "../data/mockAdminDashboard";

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

const attentionVariants = {
  danger: "bg-danger/10",
  warning: "bg-accent-gold/10",
  info: "bg-soft-teal",
};

const attentionTitleColors = {
  danger: "text-danger",
  warning: "text-accent-gold",
  info: "text-primary",
};

const activityDotVariants = {
  primary: "bg-primary-light",
  warning: "bg-accent-gold",
  info: "bg-soft-teal",
};

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

function RequestTable({
  requests,
  showResourceTitle = false,
  onApprove,
  onReject,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-surface-muted font-heading text-sm font-semibold text-on-surface-muted">
            <th scope="col" className="px-5 py-3.5">
              Applicant
            </th>
            <th scope="col" className="px-5 py-3.5">
              {showResourceTitle ? "Submission" : "Role"}
            </th>
            <th scope="col" className="px-5 py-3.5">
              Date
            </th>
            <th scope="col" className="px-5 py-3.5">
              Status
            </th>
            <th scope="col" className="px-5 py-3.5 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-muted/10">
          {requests.map((request) => (
            <tr
              key={request.id}
              className="transition-colors hover:bg-surface-muted/40"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft-teal font-heading text-xs font-bold text-primary">
                    {request.initials}
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold text-on-surface">
                      {request.name}
                    </p>
                    <p className="font-body text-xs text-on-surface-muted">
                      {request.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 font-body text-sm text-on-surface">
                {showResourceTitle ? request.resourceTitle : request.role}
              </td>
              <td className="px-5 py-4 font-body text-sm text-on-surface">
                {request.date}
              </td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-accent-gold/10 px-2.5 py-1 font-body text-xs font-bold text-accent-gold">
                  {request.status}
                </span>
              </td>
              <td className="px-5 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onApprove(request.id)}
                    title={`Approve ${request.name}`}
                    aria-label={`Approve ${request.name}`}
                    className="rounded-lg p-2 text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/10"
                  >
                    <CheckCircle className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(request.id)}
                    title={`Reject ${request.name}`}
                    aria-label={`Reject ${request.name}`}
                    className="rounded-lg p-2 text-danger transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-danger/10"
                  >
                    <XCircle className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApprovalQueueCard({ items }) {
  return (
    <section
      aria-label="Approval queue"
      className="rounded-3xl bg-surface-dark p-5 text-white shadow-md"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-heading text-xs font-bold uppercase tracking-widest text-on-dark-accent/80">
            Approval Queue
          </p>
          <h2 className="font-heading text-lg font-semibold text-white">
            {items.length} items waiting
          </h2>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 font-heading text-xs font-bold text-on-dark-accent">
          {items.filter((item) => item.done).length}/{items.length}
        </span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-primary-light transition-all duration-500"
          style={{
            width: `${(items.filter((item) => item.done).length / items.length) * 100}%`,
          }}
        />
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5"
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                item.done
                  ? "bg-success text-white"
                  : "border border-white/20 text-white/40"
              }`}
            >
              {item.done ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-sm font-semibold text-white">
                {item.title}
              </p>
              <p className="truncate font-body text-xs text-white/60">
                {item.subtitle}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SatisfactionRing({ value }) {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="h-16 w-16 -rotate-90"
        aria-hidden="true"
        viewBox="0 0 64 64"
      >
        <circle
          className="text-outline-muted/20"
          cx="32"
          cy="32"
          fill="transparent"
          r="28"
          stroke="currentColor"
          strokeWidth="6"
        />
        <circle
          className="text-primary"
          cx="32"
          cy="32"
          fill="transparent"
          r="28"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeWidth="6"
        />
      </svg>
      <span className="absolute font-body text-xs font-bold text-on-surface">
        {value}%
      </span>
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

function StatusDonutChart({ total, segments }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-44 w-44">
        <svg className="h-full w-full" viewBox="0 0 36 36" aria-hidden="true">
          <path
            className="text-primary"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeDasharray="60, 100"
            strokeWidth="4"
          />
          <path
            className="text-accent-gold"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeDasharray="25, 100"
            strokeDashoffset="-60"
            strokeWidth="4"
          />
          <path
            className="text-danger"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeDasharray="15, 100"
            strokeDashoffset="-85"
            strokeWidth="4"
          />
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
  const { adminResourceActivity, pushAdminResourceActivity } = useResources();
  const firstName = user.fullName.split(" ")[0];
  const [activeTab, setActiveTab] = useState("accounts");
  const [search, setSearch] = useState("");
  const [accountRequests, setAccountRequests] = useState([]);
  const [accountRequestsLoading, setAccountRequestsLoading] = useState(true);
  const [accountRequestsError, setAccountRequestsError] = useState(null);
  const [accountActionLoading, setAccountActionLoading] = useState(false);
  const [platformNotifications, setPlatformNotifications] = useState([]);
  const [completedQueueIds, setCompletedQueueIds] = useState([]);
  const [pendingResourceSubmissions, setPendingResourceSubmissions] = useState([]);
  const [resourcesQueueLoading, setResourcesQueueLoading] = useState(true);
  const [reviewActionLoading, setReviewActionLoading] = useState(false);
  const [headlineStats, setHeadlineStats] = useState(defaultHeadlineStats);
  const [platformKpis, setPlatformKpis] = useState([]);
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [counsellorAvailabilityFilter, setCounsellorAvailabilityFilter] =
    useState("all");
  const [analyticsPeriod, setAnalyticsPeriod] = useState("8weeks");
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(() =>
    formatDateTime(new Date()),
  );
  const notificationsRef = useRef(null);

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
    let cancelled = false;

    async function loadAccountRequests() {
      setAccountRequestsLoading(true);
      setAccountRequestsError(null);
      try {
        const requests = await listAccountRequests();
        if (!cancelled) setAccountRequests(requests);
      } catch (err) {
        if (!cancelled) {
          setAccountRequestsError(err.message ?? "Failed to load account requests.");
          setAccountRequests([]);
        }
      } finally {
        if (!cancelled) setAccountRequestsLoading(false);
      }
    }

    loadAccountRequests();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      try {
        const items = await listAdminNotifications({ limit: 20 });
        if (!cancelled) setPlatformNotifications(items);
      } catch {
        if (!cancelled) setPlatformNotifications([]);
      }
    }

    loadNotifications();
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

  useEffect(() => {
    if (!notificationsOpen) return undefined;

    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadPendingResources() {
      setResourcesQueueLoading(true);
      try {
        const pending = await listPendingReviewResources();
        if (cancelled) return;
        setPendingResourceSubmissions(
          pending.map((resource) => {
            const submitterName = resource.submittedBy?.fullName || resource.author;
            return {
              id: resource.id,
              name: submitterName,
              email: resource.submittedBy?.email || "",
              initials: submitterName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
              resourceTitle: resource.title,
              role: "Resource Submission",
              date:
                formatResourceDisplayDate(resource.submittedAt) ||
                formatResourceDisplayDate(resource.updatedAt),
              status: "Pending Review",
            };
          }),
        );
      } catch {
        if (!cancelled) {
          setPendingResourceSubmissions([]);
        }
      } finally {
        if (!cancelled) {
          setResourcesQueueLoading(false);
        }
      }
    }

    loadPendingResources();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeRequests =
    activeTab === "accounts" ? accountRequests : pendingResourceSubmissions;

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return activeRequests;
    return activeRequests.filter(
      (request) =>
        request.name.toLowerCase().includes(query) ||
        request.email.toLowerCase().includes(query) ||
        (request.resourceTitle &&
          request.resourceTitle.toLowerCase().includes(query)) ||
        request.role.toLowerCase().includes(query),
    );
  }, [activeRequests, search]);

  const filteredCounsellorPerformance = useMemo(() => {
    const query = search.trim().toLowerCase();
    return counsellorPerformance.filter((counsellor) => {
      const matchesSearch =
        !query || counsellor.name.toLowerCase().includes(query);
      const matchesAvailability =
        counsellorAvailabilityFilter === "all" ||
        (counsellorAvailabilityFilter === "online" &&
          counsellor.availabilityVariant === "online") ||
        (counsellorAvailabilityFilter === "away" &&
          counsellor.availabilityVariant === "away");
      return matchesSearch && matchesAvailability;
    });
  }, [search, counsellorAvailabilityFilter]);

  const filteredTopResources = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return topResources;
    return topResources.filter(
      (resource) =>
        resource.title.toLowerCase().includes(query) ||
        resource.category.toLowerCase().includes(query),
    );
  }, [search]);

  const analyticsWeeks = useMemo(() => {
    if (analyticsPeriod === "8weeks") return sessionTrendWeeks;
    return sessionTrendWeeks.map((week) => ({
      ...week,
      value: Math.round(week.value * 1.35),
      height: Math.min(100, Math.round(week.height * 1.15)),
    }));
  }, [analyticsPeriod, sessionTrendWeeks]);

  const activityItems = showAllActivity
    ? [...adminResourceActivity, ...platformNotifications]
    : [...adminResourceActivity, ...platformNotifications].slice(0, 4);

  const notificationItems = [...adminResourceActivity, ...platformNotifications].slice(
    0,
    3,
  );

  const refetchAccountRequests = async () => {
    const requests = await listAccountRequests();
    setAccountRequests(requests);
  };

  const refetchNotifications = async () => {
    const items = await listAdminNotifications({ limit: 20 });
    setPlatformNotifications(items);
  };

  const handleApprove = async (id) => {
    if (activeTab === "accounts") {
      setAccountActionLoading(true);
      try {
        await approveAccountRequest(id);
        setCompletedQueueIds((prev) => [...prev, `${activeTab}-${id}`]);
        await Promise.all([refetchAccountRequests(), refetchNotifications()]);
      } catch (err) {
        setAccountRequestsError(err.message ?? "Failed to approve request.");
      } finally {
        setAccountActionLoading(false);
      }
      return;
    }

    setReviewActionLoading(true);
    try {
      await reviewResourceApi(id, { decision: "approve_publish" });
      pushAdminResourceActivity(
        "Resource Approved",
        "Submission published to Resource Hub",
        "primary",
      );
      setPendingResourceSubmissions((prev) =>
        prev.filter((request) => request.id !== id),
      );
      setCompletedQueueIds((prev) => [...prev, `${activeTab}-${id}`]);
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (activeTab === "accounts") {
      setAccountActionLoading(true);
      try {
        await rejectAccountRequest(id);
        await refetchAccountRequests();
      } catch (err) {
        setAccountRequestsError(err.message ?? "Failed to reject request.");
      } finally {
        setAccountActionLoading(false);
      }
      return;
    }

    setReviewActionLoading(true);
    try {
      await reviewResourceApi(id, { decision: "reject" });
      pushAdminResourceActivity(
        "Resource Returned",
        "Submission sent back to counsellor",
        "warning",
      );
      setPendingResourceSubmissions((prev) =>
        prev.filter((request) => request.id !== id),
      );
    } finally {
      setReviewActionLoading(false);
    }
  };

  const coveragePercent = Math.round(
    (platformHealth.activeCounsellors / platformHealth.totalCounsellors) * 100,
  );
  const completionPercent = statusDistribution.segments.find(
    (segment) => segment.label === "Completed",
  )?.percent ?? 60;
  const totalPendingApprovals = Number(
    platformKpis.find((kpi) => kpi.id === "pending")?.value?.replace(/,/g, "") ?? 0,
  );
  const openApprovals = accountRequests.length + pendingResourceSubmissions.length;
  const queueClearedPercent = Math.round(
    ((totalPendingApprovals - openApprovals) / totalPendingApprovals) * 100,
  );

  const approvalQueueItems = [
    ...accountRequests.slice(0, 3).map((request) => ({
      id: `account-${request.id}`,
      title: request.name,
      subtitle: request.role,
      done: completedQueueIds.includes(`accounts-${request.id}`),
    })),
    ...pendingResourceSubmissions.slice(0, 2).map((request) => ({
      id: `resource-${request.id}`,
      title: request.resourceTitle,
      subtitle: `By ${request.name}`,
      done: completedQueueIds.includes(`resources-${request.id}`),
    })),
  ];

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
        aria-label="Admin search and notifications"
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
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="hidden items-center gap-2 rounded-2xl border border-primary/5 bg-surface px-4 py-2 shadow-sm sm:flex">
            <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
            <time
              dateTime={new Date().toISOString()}
              className="font-heading text-sm font-semibold text-on-surface"
            >
              {currentDateTime}
            </time>
          </div>
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen((value) => !value)}
              aria-label="View notifications"
              aria-expanded={notificationsOpen}
              className="rounded-full border border-primary/5 bg-surface p-2.5 text-on-surface-muted shadow-sm transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
            </button>
            {notificationsOpen ? (
              <div
                role="menu"
                aria-label="Notifications"
                className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-primary/10 bg-surface shadow-xl"
              >
                <div className="border-b border-outline-muted/10 px-4 py-3">
                  <p className="font-heading text-sm font-semibold text-on-surface">
                    Notifications
                  </p>
                </div>
                <ul className="max-h-72 divide-y divide-outline-muted/10 overflow-y-auto">
                  {notificationItems.map((item) => (
                    <li key={item.id} className="px-4 py-3">
                      <p className="font-heading text-sm font-semibold text-on-surface">
                        {item.title}
                      </p>
                      <p className="mt-0.5 font-body text-xs text-on-surface-muted">
                        {item.description}
                      </p>
                      <span className="mt-1 block font-heading text-[10px] font-bold uppercase text-outline">
                        {item.time}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
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
              Monitor platform health, counsellor activity, and student
              engagement at a glance.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <PulseBar
                label="Queue cleared"
                value={Math.max(0, Math.min(100, queueClearedPercent))}
              />
              <PulseBar
                label="Response SLA"
                value={platformHealth.responseProgress}
              />
              <PulseBar
                label="Counsellor coverage"
                value={coveragePercent}
                tone="muted"
              />
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardLoading ? (
            <p className="col-span-full font-body text-sm text-on-surface-muted">
              Loading platform metrics…
            </p>
          ) : (
            primaryKpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section
          aria-label="Pending approval requests"
          className="overflow-hidden rounded-[28px] border border-primary/5 bg-surface shadow-md lg:col-span-7"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-outline-muted/10 p-5 md:flex-row md:items-center">
            <div
              role="tablist"
              aria-label="Request categories"
              className="flex gap-4"
            >
              <button
                type="button"
                role="tab"
                id="tab-accounts"
                aria-selected={activeTab === "accounts"}
                aria-controls="panel-requests"
                onClick={() => setActiveTab("accounts")}
                className={`px-1 pb-2 font-heading text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:pb-0 ${
                  activeTab === "accounts"
                    ? "border-b-2 border-primary font-bold text-primary"
                    : "text-on-surface-muted hover:text-primary"
                }`}
              >
                New Accounts ({accountRequests.length})
              </button>
              <button
                type="button"
                role="tab"
                id="tab-resources"
                aria-selected={activeTab === "resources"}
                aria-controls="panel-requests"
                onClick={() => setActiveTab("resources")}
                className={`px-1 pb-2 font-heading text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:pb-0 ${
                  activeTab === "resources"
                    ? "border-b-2 border-primary font-bold text-primary"
                    : "text-on-surface-muted hover:text-primary"
                }`}
              >
                New Resources ({pendingResourceSubmissions.length})
              </button>
            </div>
            <Link
              to="/admin/resources?filter=pending_review"
              className="flex items-center gap-1 self-start font-heading text-sm font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:underline md:self-auto"
            >
              View All
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div
            role="tabpanel"
            id="panel-requests"
            aria-labelledby={
              activeTab === "accounts" ? "tab-accounts" : "tab-resources"
            }
          >
            {activeTab === "accounts" && accountRequestsLoading ? (
              <p className="px-5 py-8 font-body text-sm text-on-surface-muted">
                Loading account requests…
              </p>
            ) : null}
            {activeTab === "accounts" && accountRequestsError ? (
              <div
                role="alert"
                className="mx-5 my-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 font-body text-sm text-danger"
              >
                {accountRequestsError}
              </div>
            ) : null}
            {!accountRequestsLoading || activeTab !== "accounts" ? (
              <RequestTable
                requests={filteredRequests}
                showResourceTitle={activeTab === "resources"}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ) : null}
          </div>
        </section>

        <aside className="space-y-4 lg:col-span-5">
          <section
            aria-label="Attention needed"
            className="rounded-[28px] border-l-4 border-danger bg-surface p-5 shadow-md"
          >
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle
                className="h-5 w-5 text-danger"
                aria-hidden="true"
              />
              <h2 className="font-heading text-lg font-semibold text-on-surface">
                Attention Needed
              </h2>
            </div>
            <div className="space-y-3">
              {attentionItems.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl p-3 ${attentionVariants[item.variant]}`}
                >
                  <p
                    className={`font-heading text-sm font-semibold ${attentionTitleColors[item.variant]}`}
                  >
                    {item.title}
                  </p>
                  <p className="font-body text-xs text-on-surface-muted">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <ApprovalQueueCard items={approvalQueueItems} />
        </aside>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-5 lg:col-span-12">
          <article className="rounded-[28px] border border-primary/5 bg-surface p-5 shadow-md md:col-span-3">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-on-surface">
                Session Analytics
              </h2>
              <label className="sr-only" htmlFor="analytics-period">
                Analytics period
              </label>
              <select
                id="analytics-period"
                value={analyticsPeriod}
                onChange={(event) => setAnalyticsPeriod(event.target.value)}
                className="rounded-xl bg-surface-muted px-2.5 py-1.5 font-body text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary-light"
              >
                <option value="8weeks">Last 8 Weeks</option>
                <option value="6months">Last 6 Months</option>
              </select>
            </div>
            <SessionBarChart weeks={analyticsWeeks} />
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
          aria-label="Platform health"
          className="rounded-[28px] border border-primary/5 bg-surface p-5 shadow-md lg:col-span-4"
        >
          <h2 className="mb-4 font-heading text-lg font-semibold text-on-surface">
            Platform Health
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-surface-muted p-3 text-center">
              <p className="mb-1 font-body text-xs text-on-surface-muted">
                Satisfaction
              </p>
              <SatisfactionRing value={platformHealth.satisfaction} />
            </div>
            <div className="rounded-2xl bg-surface-muted p-3 text-center">
              <p className="mb-1 font-body text-xs text-on-surface-muted">
                Coverage
              </p>
              <p className="font-heading text-2xl font-semibold text-primary">
                {platformHealth.activeCounsellors}
                <span className="font-body text-base text-on-surface-muted">
                  /{platformHealth.totalCounsellors}
                </span>
              </p>
              <p className="font-heading text-[10px] font-bold uppercase text-on-surface-muted">
                Active
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-3 border-t border-outline-muted/10 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-body text-xs text-on-surface">
                Avg Response Time
              </span>
              <span className="font-body text-xs font-bold text-primary">
                {platformHealth.avgResponseTime}
              </span>
            </div>
            <PulseBar
              label="Response performance"
              value={platformHealth.responseProgress}
            />
          </div>
          <div className="mt-4 rounded-2xl bg-soft-teal/60 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="font-heading text-sm font-semibold text-on-surface">
                  Resources Published
                </span>
              </div>
              <span className="font-heading text-lg font-bold text-primary">
                {platformKpis.find((kpi) => kpi.id === "resources")?.value}
              </span>
            </div>
            <p className="mt-1 font-body text-xs text-on-surface-muted">
              Updated in the last 7 days
            </p>
          </div>
        </section>

        <section
          aria-label="Counsellor workload and performance"
          className="overflow-hidden rounded-[28px] border border-primary/5 bg-surface shadow-md lg:col-span-8"
        >
          <div className="flex items-center justify-between border-b border-outline-muted/10 p-5">
            <h2 className="font-heading text-lg font-semibold text-on-surface">
              Counsellor Workload &amp; Performance
            </h2>
            <button
              type="button"
              onClick={() =>
                setCounsellorAvailabilityFilter((current) =>
                  current === "all"
                    ? "online"
                    : current === "online"
                      ? "away"
                      : "all",
                )
              }
              title={`Filter: ${
                counsellorAvailabilityFilter === "all"
                  ? "All counsellors"
                  : counsellorAvailabilityFilter === "online"
                    ? "Online only"
                    : "Away only"
              }`}
              aria-label="Filter counsellor list"
              className="rounded-full p-2 text-on-surface-muted transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary"
            >
              <Filter className="h-5 w-5" aria-hidden="true" />
            </button>
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
                  <th scope="col" className="px-5 py-3.5">
                    Availability
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-muted/10">
                {analyticsLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center font-body text-sm text-on-surface-muted"
                    >
                      Loading counsellor performance…
                    </td>
                  </tr>
                ) : (
                  filteredCounsellorPerformance.map((counsellor) => (
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
                    <td className="px-5 py-4">
                      <div
                        className={`flex items-center gap-1.5 ${
                          counsellor.availabilityVariant === "away"
                            ? "text-on-surface-muted"
                            : ""
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            counsellor.availabilityVariant === "online"
                              ? "bg-success"
                              : "bg-outline-muted"
                          }`}
                          aria-hidden="true"
                        />
                        <span className="font-body text-xs">
                          {counsellor.availability}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-body text-xs text-on-surface-muted">
                      {counsellor.lastActive}
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-5 lg:col-span-12">
          <article
            aria-label="Top performing resources"
            className="overflow-hidden rounded-[28px] border border-primary/5 bg-surface shadow-md md:col-span-3"
          >
            <div className="flex flex-col items-start justify-between gap-4 border-b border-outline-muted/10 p-5 sm:flex-row sm:items-center">
              <h2 className="font-heading text-lg font-semibold text-on-surface">
                Top Performing Resources
              </h2>
              <ComingSoonButton className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-heading text-sm font-semibold text-on-primary shadow-sm">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Publish New
              </ComingSoonButton>
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
                  {filteredTopResources.map((resource) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article
            aria-label="Platform activity"
            className="rounded-[28px] border border-primary/5 bg-surface p-5 shadow-md md:col-span-2"
          >
            <h2 className="mb-5 font-heading text-lg font-semibold text-on-surface">
              Platform Activity
            </h2>
            <div className="relative space-y-5 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-0.5 before:bg-outline-muted/20">
              {activityItems.map((activity) => (
                <div key={activity.id} className="relative flex gap-4">
                  <div
                    className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-4 border-surface ${activityDotVariants[activity.variant]}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        activity.variant === "info"
                          ? "bg-primary"
                          : "bg-on-primary"
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold leading-tight text-on-surface">
                      {activity.title}
                    </p>
                    <p className="font-body text-xs text-on-surface-muted">
                      {activity.description}
                    </p>
                    <span className="font-heading text-[10px] font-bold uppercase text-outline">
                      {activity.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowAllActivity((value) => !value)}
              className="mt-5 w-full rounded-xl py-2 font-heading text-sm font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/5"
            >
              {showAllActivity ? "Show Less Activity" : "View All Activity"}
            </button>
          </article>
        </section>
      </div>

      <footer className="mt-2 flex flex-col items-center justify-between gap-4 border-t border-outline-muted/30 py-6 md:flex-row">
        <p className="font-body text-xs text-on-surface-muted">
          Endorsed by Strathmore University Mental Health Club
        </p>
        <div className="flex gap-6">
          <ComingSoonText className="font-body text-xs text-on-surface-muted">
            Privacy Policy
          </ComingSoonText>
          <ComingSoonText className="font-body text-xs text-on-surface-muted">
            Contact Support
          </ComingSoonText>
          <ComingSoonText className="font-body text-xs text-on-surface-muted">
            Terms of Service
          </ComingSoonText>
        </div>
      </footer>
    </div>
  );
}
