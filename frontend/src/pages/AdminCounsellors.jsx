import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Eye,
  Headset,
  Star,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminKpiCard from "../components/AdminKpiCard";
import FilterChip from "../components/FilterChip";
import {
  counsellorStats,
  counsellors,
  promotionCandidates,
} from "../data/mockAdminCounsellors";

const statusFilters = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];

function StatusBadge({ status }) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-xs font-bold ${
        isActive ? "bg-success/10 text-success" : "bg-surface-muted text-on-surface-muted"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-success" : "bg-outline-muted"}`}
        aria-hidden="true"
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function CounsellorProfileModal({ counsellor, onClose }) {
  if (!counsellor) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Profile for ${counsellor.name}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-primary/5 bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-soft-teal font-heading text-base font-bold text-primary">
              {counsellor.initials}
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-on-surface">
                {counsellor.name}
              </h2>
              <p className="font-body text-sm text-on-surface-muted">
                {counsellor.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className="rounded-lg p-2 text-on-surface-subtle transition-colors hover:bg-surface-muted hover:text-on-surface"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <dl className="space-y-3 font-body text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Specialties</dt>
            <dd className="text-right font-medium text-on-surface">
              {counsellor.specialties.join(", ")}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Sessions</dt>
            <dd className="font-medium text-on-surface">{counsellor.sessions}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Rating</dt>
            <dd className="font-medium text-on-surface">{counsellor.rating}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Status</dt>
            <dd>
              <StatusBadge status={counsellor.status} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Joined</dt>
            <dd className="font-medium text-on-surface">{counsellor.joined}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Last active</dt>
            <dd className="font-medium text-on-surface">{counsellor.lastActive}</dd>
          </div>
        </dl>
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

export default function AdminCounsellors() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [candidates, setCandidates] = useState(promotionCandidates);
  const [counsellorList, setCounsellorList] = useState(counsellors);
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);

  const handlePromote = (candidate) => {
    setCandidates((prev) => prev.filter((item) => item.id !== candidate.id));
    setCounsellorList((prev) => [
      ...prev,
      {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        initials: candidate.initials,
        specialties: ["Peer Support"],
        sessions: 0,
        rating: "—",
        status: "active",
        availability: "Online Now",
        joined: "Just promoted",
        lastActive: "Just now",
      },
    ]);
  };

  const filteredCounsellors = useMemo(() => {
    const query = search.trim().toLowerCase();
    return counsellorList.filter((counsellor) => {
      const matchesStatus =
        statusFilter === "all" || counsellor.status === statusFilter;
      const matchesQuery =
        !query ||
        counsellor.name.toLowerCase().includes(query) ||
        counsellor.email.toLowerCase().includes(query) ||
        counsellor.specialties.some((specialty) =>
          specialty.toLowerCase().includes(query),
        );
      return matchesStatus && matchesQuery;
    });
  }, [search, statusFilter, counsellorList]);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <AdminPageHeader
        eyebrow="Counsellor management"
        title="Manage Counsellors"
        description="Promote trained students into peer counsellors and oversee the active counselling team."
        searchPlaceholder="Search counsellors by name, email, or specialty..."
        searchValue={search}
        onSearchChange={setSearch}
        stats={[
          { label: "Counsellors", value: counsellorStats.total, icon: Headset },
          { label: "Active", value: counsellorStats.active, icon: UserCheck },
          { label: "Avg Rating", value: counsellorStats.avgRating, icon: Star },
        ]}
      />

      <section aria-label="Counsellor key metrics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminKpiCard
            icon={Headset}
            label="Total Counsellors"
            value={counsellorStats.total}
            trend="+4%"
            sublabel="vs last month"
            iconBg="bg-soft-teal"
            iconColor="text-primary"
          />
          <AdminKpiCard
            icon={UserCheck}
            label="Active Counsellors"
            value={counsellorStats.active}
            sublabel="Online recently"
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
          <AdminKpiCard
            icon={UserPlus}
            label="Pending Promotions"
            value={counsellorStats.pendingPromotions}
            urgent
            iconBg="bg-warning/10"
            iconColor="text-accent-gold"
          />
          <AdminKpiCard
            icon={Star}
            label="Average Rating"
            value={counsellorStats.avgRating}
            sublabel="Across all sessions"
            iconBg="bg-primary-accent/20"
            iconColor="text-primary-light"
          />
        </div>
      </section>

      <section
        aria-label="Promote students to counsellors"
        className="overflow-hidden rounded-[28px] border border-primary/5 bg-surface shadow-md"
      >
        <div className="flex flex-col gap-1 border-b border-outline-muted/10 p-5">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="font-heading text-lg font-semibold text-on-surface">
              Promotion Candidates
            </h2>
          </div>
          <p className="font-body text-sm text-on-surface-muted">
            Students who have completed peer counselling training and are
            awaiting promotion.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-muted font-heading text-sm font-semibold text-on-surface-muted">
                <th scope="col" className="px-5 py-3.5">
                  Student
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Programme
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Training
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Sessions Attended
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-muted/10">
              {candidates.map((candidate) => {
                const trainingComplete =
                  candidate.trainingStatus === "Training Complete";
                return (
                  <tr
                    key={candidate.id}
                    className="transition-colors hover:bg-surface-muted/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft-teal font-heading text-xs font-bold text-primary">
                          {candidate.initials}
                        </div>
                        <div>
                          <p className="font-heading text-sm font-semibold text-on-surface">
                            {candidate.name}
                          </p>
                          <p className="font-body text-xs text-on-surface-muted">
                            {candidate.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-body text-sm text-on-surface">
                      <p>{candidate.course}</p>
                      <p className="font-body text-xs text-on-surface-muted">
                        {candidate.year}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 font-body text-xs font-bold ${
                          trainingComplete
                            ? "bg-success/10 text-success"
                            : "bg-accent-gold/10 text-accent-gold"
                        }`}
                      >
                        {candidate.trainingStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-body text-sm text-on-surface">
                      {candidate.sessionsAttended} sessions
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handlePromote(candidate)}
                        disabled={candidate.trainingStatus !== "Training Complete"}
                        title={
                          candidate.trainingStatus !== "Training Complete"
                            ? "Coming soon"
                            : `Promote ${candidate.name} to counsellor`
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 font-heading text-xs font-semibold text-on-primary shadow-sm transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
                      >
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        Promote
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section
        aria-label="Counsellor directory"
        className="overflow-hidden rounded-[28px] border border-primary/5 bg-surface shadow-md"
      >
        <div className="flex flex-col gap-4 border-b border-outline-muted/10 p-5 md:flex-row md:items-center md:justify-between">
          <h2 className="font-heading text-lg font-semibold text-on-surface">
            All Counsellors
          </h2>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <FilterChip
                key={filter.id}
                label={filter.label}
                active={statusFilter === filter.id}
                onClick={() => setStatusFilter(filter.id)}
              />
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-muted font-heading text-sm font-semibold text-on-surface-muted">
                <th scope="col" className="px-5 py-3.5">
                  Counsellor
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Specialties
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Sessions
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Rating
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
              {filteredCounsellors.map((counsellor) => (
                <tr
                  key={counsellor.id}
                  className="transition-colors hover:bg-surface-muted/40"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft-teal font-heading text-xs font-bold text-primary">
                        {counsellor.initials}
                      </div>
                      <div>
                        <p className="font-heading text-sm font-semibold text-on-surface">
                          {counsellor.name}
                        </p>
                        <p className="font-body text-xs text-on-surface-muted">
                          {counsellor.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {counsellor.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="rounded-full bg-surface-muted px-2 py-1 font-heading text-[10px] font-bold uppercase text-on-surface-muted"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-body text-sm text-on-surface">
                    {counsellor.sessions}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 font-body text-sm font-semibold text-on-surface">
                      <Star
                        className="h-3.5 w-3.5 fill-accent-gold text-accent-gold"
                        aria-hidden="true"
                      />
                      {counsellor.rating}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={counsellor.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedCounsellor(counsellor)}
                      title={`View ${counsellor.name}'s profile`}
                      aria-label={`View ${counsellor.name}'s profile`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-heading text-xs font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/5"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCounsellors.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted">
                <Users className="h-6 w-6 text-on-surface-subtle" aria-hidden="true" />
              </div>
              <p className="font-heading text-base font-semibold text-on-surface">
                No counsellors match your filters
              </p>
              <p className="max-w-sm font-body text-sm text-on-surface-muted">
                Try adjusting your search or choosing a different status filter.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <CounsellorProfileModal
        counsellor={selectedCounsellor}
        onClose={() => setSelectedCounsellor(null)}
      />
    </div>
  );
}
