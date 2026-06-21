import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarPlus,
  Eye,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminKpiCard from "../components/AdminKpiCard";
import ComingSoonButton from "../components/ComingSoonButton";
import FilterChip from "../components/FilterChip";
import { students, studentStats } from "../data/mockAdminStudents";

const statusFilters = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "at-risk", label: "At Risk" },
];

const statusStyles = {
  active: "bg-success/10 text-success",
  inactive: "bg-surface-muted text-on-surface-muted",
  "at-risk": "bg-danger/10 text-danger",
};

const statusDot = {
  active: "bg-success",
  inactive: "bg-outline-muted",
  "at-risk": "bg-danger",
};

const statusLabels = {
  active: "Active",
  inactive: "Inactive",
  "at-risk": "At Risk",
};

const engagementStyles = {
  High: "bg-success/10 text-success",
  Medium: "bg-accent-gold/10 text-accent-gold",
  Low: "bg-surface-muted text-on-surface-muted",
};

function formatNumber(value) {
  return value.toLocaleString("en-US");
}

function StudentActivityModal({ student, onClose }) {
  if (!student) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Activity for ${student.name}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-primary/5 bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-soft-teal font-heading text-base font-bold text-primary">
              {student.initials}
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-on-surface">
                {student.name}
              </h2>
              <p className="font-body text-sm text-on-surface-muted">
                {student.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close activity details"
            className="rounded-lg p-2 text-on-surface-subtle transition-colors hover:bg-surface-muted hover:text-on-surface"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <dl className="space-y-3 font-body text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Programme</dt>
            <dd className="text-right font-medium text-on-surface">
              {student.course} · {student.year}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Sessions</dt>
            <dd className="font-medium text-on-surface">{student.sessions}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Engagement</dt>
            <dd className="font-medium text-on-surface">{student.engagement}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Last active</dt>
            <dd className="font-medium text-on-surface">{student.lastActive}</dd>
          </div>
        </dl>
        <p className="mt-4 rounded-xl bg-surface-muted/60 p-4 font-body text-sm text-on-surface-muted">
          {student.summary}
        </p>
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

export default function AdminStudents() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => {
      const matchesStatus =
        statusFilter === "all" || student.status === statusFilter;
      const matchesQuery =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.course.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [search, statusFilter]);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <AdminPageHeader
        eyebrow="Student management"
        title="Manage Students"
        description="Review student accounts, engagement levels, and session activity across the platform."
        searchPlaceholder="Search students by name, email, or programme..."
        searchValue={search}
        onSearchChange={setSearch}
        stats={[
          { label: "Students", value: formatNumber(studentStats.total), icon: Users },
          { label: "Active 7d", value: formatNumber(studentStats.activeThisWeek), icon: TrendingUp },
          { label: "New 30d", value: studentStats.newThisMonth, icon: UserPlus },
        ]}
      />

      <section aria-label="Student key metrics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminKpiCard
            icon={Users}
            label="Total Students"
            value={formatNumber(studentStats.total)}
            trend="+12%"
            sublabel="vs last month"
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
          <AdminKpiCard
            icon={TrendingUp}
            label="Active This Week"
            value={formatNumber(studentStats.activeThisWeek)}
            sublabel="Logged in within 7 days"
            iconBg="bg-soft-teal"
            iconColor="text-primary"
          />
          <AdminKpiCard
            icon={UserPlus}
            label="New This Month"
            value={studentStats.newThisMonth}
            trend="+8%"
            sublabel="New signups"
            iconBg="bg-primary-accent/20"
            iconColor="text-primary-light"
          />
          <AdminKpiCard
            icon={AlertTriangle}
            label="Flagged for Follow-up"
            value={studentStats.flagged}
            urgent
            iconBg="bg-warning/10"
            iconColor="text-accent-gold"
          />
        </div>
      </section>

      <section
        aria-label="Student directory"
        className="overflow-hidden rounded-[28px] border border-primary/5 bg-surface shadow-md"
      >
        <div className="flex flex-col gap-4 border-b border-outline-muted/10 p-5 md:flex-row md:items-center md:justify-between">
          <h2 className="font-heading text-lg font-semibold text-on-surface">
            All Students
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
                  Student
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Programme
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Sessions
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Engagement
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Last Active
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
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="transition-colors hover:bg-surface-muted/40"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft-teal font-heading text-xs font-bold text-primary">
                        {student.initials}
                      </div>
                      <div>
                        <p className="font-heading text-sm font-semibold text-on-surface">
                          {student.name}
                        </p>
                        <p className="font-body text-xs text-on-surface-muted">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-body text-sm text-on-surface">
                    <p>{student.course}</p>
                    <p className="font-body text-xs text-on-surface-muted">
                      {student.year}
                    </p>
                  </td>
                  <td className="px-5 py-4 font-body text-sm text-on-surface">
                    {student.sessions}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 font-body text-xs font-bold ${engagementStyles[student.engagement]}`}
                    >
                      {student.engagement}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-body text-xs text-on-surface-muted">
                    {student.lastActive}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-xs font-bold ${statusStyles[student.status]}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusDot[student.status]}`}
                        aria-hidden="true"
                      />
                      {statusLabels[student.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(student)}
                        title={`View ${student.name}'s activity`}
                        aria-label={`View ${student.name}'s activity`}
                        className="rounded-lg p-2 text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/5"
                      >
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <ComingSoonButton
                        title={`Book a session for ${student.name}`}
                        aria-label={`Book a session for ${student.name}`}
                        className="rounded-lg p-2 text-on-surface-muted"
                      >
                        <CalendarPlus className="h-5 w-5" aria-hidden="true" />
                      </ComingSoonButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted">
                <Users className="h-6 w-6 text-on-surface-subtle" aria-hidden="true" />
              </div>
              <p className="font-heading text-base font-semibold text-on-surface">
                No students match your filters
              </p>
              <p className="max-w-sm font-body text-sm text-on-surface-muted">
                Try adjusting your search or choosing a different status filter.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section
        aria-label="Activity summary"
        className="rounded-[28px] border border-primary/5 bg-surface p-5 shadow-md"
      >
        <h2 className="mb-4 font-heading text-lg font-semibold text-on-surface">
          Activity Summary
        </h2>
        <div className="space-y-3">
          {filteredStudents.slice(0, 4).map((student) => (
            <div
              key={student.id}
              className="flex items-start gap-3 rounded-2xl bg-surface-muted/60 p-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft-teal font-heading text-xs font-bold text-primary">
                {student.initials}
              </div>
              <div className="min-w-0">
                <p className="font-heading text-sm font-semibold text-on-surface">
                  {student.name}
                </p>
                <p className="font-body text-xs text-on-surface-muted">
                  {student.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <StudentActivityModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}
