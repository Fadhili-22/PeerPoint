import { useCallback, useEffect, useState } from "react";
import { Loader2, Search, Users, X } from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import { ApiError } from "../api/client";
import {
  getAdminStudent,
  listAdminStudents,
  toggleStudentActive,
} from "../api/admin";

function AccountStatusBadge({ isActive }) {
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

function StudentDetailModal({
  student,
  loading,
  error,
  toggling,
  onClose,
  onToggle,
}) {
  if (!student && !loading) return null;

  const isActive = student?.isActive ?? true;
  const toggleLabel = isActive ? "Deactivate" : "Reactivate";
  const confirmMessage = isActive
    ? "Are you sure you want to deactivate this account?"
    : "Are you sure you want to reactivate this account?";

  const handleToggle = () => {
    if (window.confirm(confirmMessage)) {
      onToggle();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={student ? `Student profile for ${student.name}` : "Student profile"}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-primary/5 bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {loading ? (
          <p className="font-body text-sm text-on-surface-muted">Loading student…</p>
        ) : student ? (
          <>
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
                aria-label="Close profile"
                className="rounded-lg p-2 text-on-surface-subtle transition-colors hover:bg-surface-muted hover:text-on-surface"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <dl className="space-y-3 font-body text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-muted">Phone</dt>
                <dd className="text-right font-medium text-on-surface">
                  {student.phone || "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-muted">Sessions completed</dt>
                <dd className="text-right font-medium text-on-surface">
                  {student.sessions}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-muted">Last active</dt>
                <dd className="text-right font-medium text-on-surface">
                  {student.lastActive}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-muted">Status</dt>
                <dd>
                  <AccountStatusBadge isActive={isActive} />
                </dd>
              </div>
            </dl>

            {student.recentActivity?.length > 0 ? (
              <div className="mt-5 rounded-xl bg-surface-muted/60 p-4">
                <p className="mb-2 font-heading text-xs font-bold uppercase tracking-widest text-on-surface-subtle">
                  Recent activity
                </p>
                <ul className="space-y-2 font-body text-sm text-on-surface-muted">
                  {student.recentActivity.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {error ? (
              <p className="mt-4 font-body text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleToggle}
                disabled={toggling}
                className={`flex-1 rounded-xl px-4 py-2.5 font-heading text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isActive
                    ? "border border-danger/30 bg-danger/10 text-danger"
                    : "bg-primary text-on-primary"
                }`}
              >
                {toggling ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Updating…
                  </span>
                ) : (
                  toggleLabel
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-outline-muted/30 px-4 py-2.5 font-heading text-sm font-semibold text-on-surface-muted"
              >
                Close
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function AdminStudents() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!debouncedSearch) {
      setResults([]);
      setSearchError("");
      setSearching(false);
      return;
    }

    let cancelled = false;

    async function runSearch() {
      setSearching(true);
      setSearchError("");
      try {
        const rows = await listAdminStudents({ search: debouncedSearch });
        if (!cancelled) {
          setResults(rows);
        }
      } catch (err) {
        if (!cancelled) {
          setResults([]);
          if (err instanceof ApiError && err.status === 403) {
            setSearchError("You are not authorized to manage students.");
          } else {
            setSearchError(err.message || "Unable to search students.");
          }
        }
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    }

    runSearch();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (!selectedStudentId) {
      setSelectedStudent(null);
      return;
    }

    let cancelled = false;

    async function loadDetail() {
      setDetailLoading(true);
      setDetailError("");
      try {
        const detail = await getAdminStudent(selectedStudentId);
        if (!cancelled) {
          setSelectedStudent(detail);
        }
      } catch (err) {
        if (!cancelled) {
          setSelectedStudent(null);
          setDetailError(err.message || "Unable to load student details.");
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false);
        }
      }
    }

    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedStudentId]);

  const handleSelectStudent = (student) => {
    setSelectedStudentId(student.userId);
    setDetailError("");
  };

  const handleCloseModal = () => {
    setSelectedStudentId(null);
    setSelectedStudent(null);
    setDetailError("");
  };

  const handleToggleActive = useCallback(async () => {
    if (!selectedStudent) return;

    setToggling(true);
    setDetailError("");
    try {
      const result = await toggleStudentActive(selectedStudent.userId);
      const updatedStudent = {
        ...selectedStudent,
        isActive: result.isActive,
      };
      setSelectedStudent(updatedStudent);
      setResults((current) =>
        current.map((student) =>
          student.userId === updatedStudent.userId
            ? { ...student, isActive: result.isActive }
            : student,
        ),
      );
    } catch (err) {
      setDetailError(err.message || "Unable to update account status.");
    } finally {
      setToggling(false);
    }
  }, [selectedStudent]);

  const showDropdown = debouncedSearch.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <AdminPageHeader
        eyebrow="Student management"
        title="Manage Students"
        description="Search for a student to view their profile and manage account access."
        stats={[{ label: "Search", value: "—", icon: Users }]}
      />

      <section className="relative">
        <label htmlFor="admin-student-search" className="sr-only">
          Search students
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-subtle"
            aria-hidden="true"
          />
          <input
            id="admin-student-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search students by name or email..."
            className="w-full rounded-2xl border border-outline-muted/40 bg-surface py-3.5 pl-12 pr-4 font-body text-base text-on-surface shadow-sm transition-all duration-200 placeholder:text-on-surface-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-accent/40"
            autoComplete="off"
          />
        </div>

        {showDropdown ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-primary/10 bg-surface shadow-xl">
            {searching ? (
              <p className="px-4 py-6 text-center font-body text-sm text-on-surface-muted">
                Searching…
              </p>
            ) : searchError ? (
              <p className="px-4 py-6 text-center font-body text-sm text-danger" role="alert">
                {searchError}
              </p>
            ) : results.length === 0 ? (
              <p className="px-4 py-6 text-center font-body text-sm text-on-surface-muted">
                No students match your search.
              </p>
            ) : (
              <ul className="max-h-80 overflow-y-auto divide-y divide-outline-muted/10">
                {results.map((student) => (
                  <li key={student.userId}>
                    <button
                      type="button"
                      onClick={() => handleSelectStudent(student)}
                      className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-surface-muted/60"
                    >
                      <div className="min-w-0">
                        <p className="font-heading text-sm font-semibold text-on-surface">
                          {student.name}
                        </p>
                        <p className="font-body text-xs text-on-surface-muted">
                          {student.email}
                        </p>
                        <p className="font-body text-xs text-on-surface-muted">
                          {student.phone || "No phone on file"}
                        </p>
                      </div>
                      <AccountStatusBadge isActive={student.isActive} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </section>

      <StudentDetailModal
        student={selectedStudent}
        loading={detailLoading}
        error={detailError}
        toggling={toggling}
        onClose={handleCloseModal}
        onToggle={handleToggleActive}
      />
    </div>
  );
}
