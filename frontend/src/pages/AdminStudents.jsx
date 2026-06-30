import { useEffect, useMemo, useState } from "react";
import {
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
import {
  computeAdminStudentStats,
  getAdminStudent,
  listAdminStudents,
} from "../api/admin";

function formatNumber(value) {
  return value.toLocaleString("en-US");
}

function StudentActivityModal({ student, detailLoading, onClose }) {
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
        {detailLoading ? (
          <p className="font-body text-sm text-on-surface-muted">Loading details…</p>
        ) : (
          <>
            <dl className="space-y-3 font-body text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-muted">Sessions</dt>
                <dd className="font-medium text-on-surface">{student.sessions}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-muted">Last active</dt>
                <dd className="font-medium text-on-surface">{student.lastActive}</dd>
              </div>
            </dl>
            {student.recentActivity?.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 font-heading text-sm font-semibold text-on-surface">
                  Recent activity
                </p>
                <ul className="space-y-2 font-body text-xs text-on-surface-muted">
                  {student.recentActivity.map((line) => (
                    <li key={line} className="rounded-lg bg-surface-muted/40 px-3 py-2">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
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
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadStudents() {
      setLoading(true);
      setError(null);
      try {
        const rows = await listAdminStudents();
        if (!cancelled) setStudents(rows);
      } catch (err) {
        if (!cancelled) {
          setError(err.message ?? "Failed to load students.");
          setStudents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStudents();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query),
    );
  }, [students, search]);

  const studentStats = useMemo(
    () => computeAdminStudentStats(students),
    [students],
  );

  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    setDetailLoading(true);
    try {
      const detail = await getAdminStudent(student.userId);
      setSelectedStudent(detail);
    } catch {
      setSelectedStudent(student);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <AdminPageHeader
        eyebrow="Student management"
        title="Manage Students"
        description="Review student accounts and session activity across the platform."
        searchPlaceholder="Search students by name or email..."
        searchValue={search}
        onSearchChange={setSearch}
        stats={[
          { label: "Students", value: formatNumber(studentStats.total), icon: Users },
          {
            label: "Active 7d",
            value: formatNumber(studentStats.activeThisWeek),
            icon: TrendingUp,
          },
          { label: "New 30d", value: studentStats.newThisMonth, icon: UserPlus },
        ]}
      />

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 font-body text-sm text-danger"
        >
          {error}
        </div>
      ) : null}

      <section aria-label="Student key metrics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AdminKpiCard
            icon={Users}
            label="Total Students"
            value={formatNumber(studentStats.total)}
            sublabel="Active student role"
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
            sublabel="New signups"
            iconBg="bg-primary-accent/20"
            iconColor="text-primary-light"
          />
        </div>
      </section>

      <section
        aria-label="Student directory"
        className="overflow-hidden rounded-[28px] border border-primary/5 bg-surface shadow-md"
      >
        <div className="border-b border-outline-muted/10 p-5">
          <h2 className="font-heading text-lg font-semibold text-on-surface">
            All Students
          </h2>
        </div>
        {loading ? (
          <p className="px-5 py-12 text-center font-body text-sm text-on-surface-muted">
            Loading students…
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-muted font-heading text-sm font-semibold text-on-surface-muted">
                  <th scope="col" className="px-5 py-3.5">
                    Student
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Sessions
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Last Active
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
                      {student.sessions}
                    </td>
                    <td className="px-5 py-4 font-body text-xs text-on-surface-muted">
                      {student.lastActive}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewStudent(student)}
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
                  No students match your search
                </p>
                <p className="max-w-sm font-body text-sm text-on-surface-muted">
                  Try adjusting your search terms.
                </p>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <StudentActivityModal
        student={selectedStudent}
        detailLoading={detailLoading}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}
