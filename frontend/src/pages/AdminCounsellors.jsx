import { useCallback, useEffect, useState } from "react";
import { Headset, Loader2, Search, UserPlus, X } from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import { ApiError } from "../api/client";
import {
  demoteCounsellor,
  listAdminCounsellors,
  promoteCounsellor,
  searchPromotableStudents,
  toggleCounsellorActive,
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

function ProfileStatusBadge({ status }) {
  const isListed = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-xs font-bold ${
        isListed ? "bg-primary/10 text-primary" : "bg-surface-muted text-on-surface-muted"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isListed ? "bg-primary" : "bg-outline-muted"}`}
        aria-hidden="true"
      />
      {isListed ? "Listed" : "Unlisted"}
    </span>
  );
}

function CounsellorProfileModal({
  counsellor,
  error,
  toggling,
  demoting,
  onClose,
  onToggleActive,
  onDemote,
}) {
  if (!counsellor) return null;

  const isAccountActive = counsellor.isActive ?? true;
  const toggleLabel = isAccountActive ? "Deactivate" : "Reactivate";
  const toggleConfirm = isAccountActive
    ? "Are you sure you want to deactivate this account?"
    : "Are you sure you want to reactivate this account?";
  const demoteConfirm =
    "Are you sure you want to demote this counsellor to student? They will lose counsellor access but keep their student role.";

  const rows = [
    { label: "Phone", value: counsellor.phone || "—" },
    { label: "Year", value: counsellor.year ? `Year ${counsellor.year}` : "—" },
    { label: "Programme", value: counsellor.program || "—" },
    {
      label: "Specialties",
      value:
        counsellor.specialties.length > 0
          ? counsellor.specialties.join(", ")
          : "—",
    },
    { label: "Sessions", value: counsellor.sessions },
  ];

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
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-on-surface-muted">{row.label}</dt>
              <dd className="text-right font-medium text-on-surface">{row.value}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Directory status</dt>
            <dd>
              <ProfileStatusBadge status={counsellor.status} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Account access</dt>
            <dd>
              <AccountStatusBadge isActive={isAccountActive} />
            </dd>
          </div>
        </dl>

        {error ? (
          <p className="mt-4 font-body text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(toggleConfirm)) {
                onToggleActive();
              }
            }}
            disabled={toggling || demoting}
            className={`rounded-xl px-4 py-2.5 font-heading text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
              isAccountActive
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
            onClick={() => {
              if (window.confirm(demoteConfirm)) {
                onDemote();
              }
            }}
            disabled={toggling || demoting}
            className="rounded-xl border border-outline-muted/40 px-4 py-2.5 font-heading text-sm font-semibold text-on-surface-muted transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {demoting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Demoting…
              </span>
            ) : (
              "Demote to Student"
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-outline-muted/30 px-4 py-2.5 font-heading text-sm font-semibold text-on-surface-muted"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function PromoteStudentModal({ student, error, promoting, onClose, onPromote }) {
  if (!student) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Promote ${student.name}`}
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
                Promote {student.name} to Counsellor?
              </h2>
              <p className="font-body text-sm text-on-surface-muted">
                {student.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-on-surface-subtle transition-colors hover:bg-surface-muted hover:text-on-surface"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {student.phone ? (
          <p className="font-body text-sm text-on-surface-muted">
            Phone: {student.phone}
          </p>
        ) : null}

        <p className="mt-3 font-body text-sm text-on-surface-muted">
          They will gain counsellor access while keeping their student role.
        </p>

        {error ? (
          <p className="mt-4 font-body text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onPromote}
            disabled={promoting}
            className="rounded-xl bg-primary px-4 py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {promoting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Promoting…
              </span>
            ) : (
              "Promote"
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-outline-muted/30 px-4 py-2.5 font-heading text-sm font-semibold text-on-surface-muted"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: "counsellors", label: "Counsellors" },
  { id: "promote", label: "Promote Counsellors" },
];

export default function AdminCounsellors() {
  const [activeTab, setActiveTab] = useState("counsellors");

  const [counsellorSearch, setCounsellorSearch] = useState("");
  const [debouncedCounsellorSearch, setDebouncedCounsellorSearch] = useState("");
  const [counsellorResults, setCounsellorResults] = useState([]);
  const [counsellorSearching, setCounsellorSearching] = useState(false);
  const [counsellorSearchError, setCounsellorSearchError] = useState("");
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [counsellorActionError, setCounsellorActionError] = useState("");
  const [toggling, setToggling] = useState(false);
  const [demoting, setDemoting] = useState(false);

  const [promoteSearch, setPromoteSearch] = useState("");
  const [debouncedPromoteSearch, setDebouncedPromoteSearch] = useState("");
  const [promoteResults, setPromoteResults] = useState([]);
  const [promoteSearching, setPromoteSearching] = useState(false);
  const [promoteSearchError, setPromoteSearchError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [promoteActionError, setPromoteActionError] = useState("");
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedCounsellorSearch(counsellorSearch.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [counsellorSearch]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedPromoteSearch(promoteSearch.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [promoteSearch]);

  useEffect(() => {
    if (activeTab !== "counsellors") return;

    if (!debouncedCounsellorSearch) {
      setCounsellorResults([]);
      setCounsellorSearchError("");
      setCounsellorSearching(false);
      return;
    }

    let cancelled = false;

    async function runSearch() {
      setCounsellorSearching(true);
      setCounsellorSearchError("");
      try {
        const rows = await listAdminCounsellors({ search: debouncedCounsellorSearch });
        if (!cancelled) {
          setCounsellorResults(rows);
        }
      } catch (err) {
        if (!cancelled) {
          setCounsellorResults([]);
          if (err instanceof ApiError && err.status === 403) {
            setCounsellorSearchError("You are not authorized to manage counsellors.");
          } else {
            setCounsellorSearchError(err.message || "Unable to search counsellors.");
          }
        }
      } finally {
        if (!cancelled) {
          setCounsellorSearching(false);
        }
      }
    }

    runSearch();
    return () => {
      cancelled = true;
    };
  }, [debouncedCounsellorSearch, activeTab]);

  useEffect(() => {
    if (activeTab !== "promote") return;

    if (!debouncedPromoteSearch) {
      setPromoteResults([]);
      setPromoteSearchError("");
      setPromoteSearching(false);
      return;
    }

    let cancelled = false;

    async function runSearch() {
      setPromoteSearching(true);
      setPromoteSearchError("");
      try {
        const rows = await searchPromotableStudents({ search: debouncedPromoteSearch });
        if (!cancelled) {
          setPromoteResults(rows);
        }
      } catch (err) {
        if (!cancelled) {
          setPromoteResults([]);
          if (err instanceof ApiError && err.status === 403) {
            setPromoteSearchError("You are not authorized to promote counsellors.");
          } else {
            setPromoteSearchError(err.message || "Unable to search students.");
          }
        }
      } finally {
        if (!cancelled) {
          setPromoteSearching(false);
        }
      }
    }

    runSearch();
    return () => {
      cancelled = true;
    };
  }, [debouncedPromoteSearch, activeTab]);

  const handleToggleActive = useCallback(async () => {
    if (!selectedCounsellor) return;

    setToggling(true);
    setCounsellorActionError("");
    try {
      const result = await toggleCounsellorActive(selectedCounsellor.userId);
      const updated = { ...selectedCounsellor, isActive: result.isActive };
      setSelectedCounsellor(updated);
      setCounsellorResults((current) =>
        current.map((row) =>
          row.userId === updated.userId ? { ...row, isActive: result.isActive } : row,
        ),
      );
    } catch (err) {
      setCounsellorActionError(err.message || "Unable to update account status.");
    } finally {
      setToggling(false);
    }
  }, [selectedCounsellor]);

  const handleDemote = useCallback(async () => {
    if (!selectedCounsellor) return;

    setDemoting(true);
    setCounsellorActionError("");
    try {
      await demoteCounsellor(selectedCounsellor.userId);
      setCounsellorResults((current) =>
        current.filter((row) => row.userId !== selectedCounsellor.userId),
      );
      setSelectedCounsellor(null);
    } catch (err) {
      setCounsellorActionError(err.message || "Unable to demote counsellor.");
    } finally {
      setDemoting(false);
    }
  }, [selectedCounsellor]);

  const handlePromote = useCallback(async () => {
    if (!selectedStudent) return;

    setPromoting(true);
    setPromoteActionError("");
    try {
      await promoteCounsellor(selectedStudent.userId);
      setSelectedStudent(null);
      if (debouncedPromoteSearch) {
        const rows = await searchPromotableStudents({ search: debouncedPromoteSearch });
        setPromoteResults(rows);
      }
    } catch (err) {
      setPromoteActionError(err.message || "Unable to promote student.");
    } finally {
      setPromoting(false);
    }
  }, [selectedStudent, debouncedPromoteSearch]);

  const showCounsellorDropdown = activeTab === "counsellors" && debouncedCounsellorSearch.length > 0;
  const showPromoteDropdown = activeTab === "promote" && debouncedPromoteSearch.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <AdminPageHeader
        eyebrow="Counsellor management"
        title="Manage Counsellors"
        description="Search counsellors, manage account access, or promote students to counsellor."
        stats={[{ label: "Directory", value: "—", icon: Headset }]}
      />

      <div
        className="flex gap-2 rounded-2xl border border-outline-muted/30 bg-surface p-1.5"
        role="tablist"
        aria-label="Counsellor management sections"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-xl px-4 py-2.5 font-heading text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-muted hover:bg-surface-muted/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "counsellors" ? (
        <section className="relative" role="tabpanel">
          <label htmlFor="admin-counsellor-search" className="sr-only">
            Search counsellors
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-subtle"
              aria-hidden="true"
            />
            <input
              id="admin-counsellor-search"
              type="search"
              value={counsellorSearch}
              onChange={(event) => setCounsellorSearch(event.target.value)}
              placeholder="Search counsellors by name, email, or specialty..."
              className="w-full rounded-2xl border border-outline-muted/40 bg-surface py-3.5 pl-12 pr-4 font-body text-base text-on-surface shadow-sm transition-all duration-200 placeholder:text-on-surface-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-accent/40"
              autoComplete="off"
            />
          </div>

          {showCounsellorDropdown ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-primary/10 bg-surface shadow-xl">
              {counsellorSearching ? (
                <p className="px-4 py-6 text-center font-body text-sm text-on-surface-muted">
                  Searching…
                </p>
              ) : counsellorSearchError ? (
                <p className="px-4 py-6 text-center font-body text-sm text-danger" role="alert">
                  {counsellorSearchError}
                </p>
              ) : counsellorResults.length === 0 ? (
                <p className="px-4 py-6 text-center font-body text-sm text-on-surface-muted">
                  No counsellors match your search.
                </p>
              ) : (
                <ul className="max-h-80 divide-y divide-outline-muted/10 overflow-y-auto">
                  {counsellorResults.map((counsellor) => (
                    <li key={counsellor.userId}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCounsellor(counsellor);
                          setCounsellorActionError("");
                        }}
                        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-surface-muted/60"
                      >
                        <div className="min-w-0">
                          <p className="font-heading text-sm font-semibold text-on-surface">
                            {counsellor.name}
                          </p>
                          <p className="font-body text-xs text-on-surface-muted">
                            {counsellor.email}
                          </p>
                          <p className="font-body text-xs text-on-surface-muted">
                            {counsellor.phone || "No phone on file"}
                          </p>
                          <p className="mt-1 font-body text-xs text-on-surface-muted">
                            {counsellor.specialties.length > 0
                              ? counsellor.specialties.join(", ")
                              : "No specialties listed"}
                          </p>
                        </div>
                        <ProfileStatusBadge status={counsellor.status} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </section>
      ) : (
        <section className="relative" role="tabpanel">
          <label htmlFor="admin-promote-search" className="sr-only">
            Search students to promote
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-subtle"
              aria-hidden="true"
            />
            <input
              id="admin-promote-search"
              type="search"
              value={promoteSearch}
              onChange={(event) => setPromoteSearch(event.target.value)}
              placeholder="Search students by name or email..."
              className="w-full rounded-2xl border border-outline-muted/40 bg-surface py-3.5 pl-12 pr-4 font-body text-base text-on-surface shadow-sm transition-all duration-200 placeholder:text-on-surface-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-accent/40"
              autoComplete="off"
            />
          </div>

          {showPromoteDropdown ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-primary/10 bg-surface shadow-xl">
              {promoteSearching ? (
                <p className="px-4 py-6 text-center font-body text-sm text-on-surface-muted">
                  Searching…
                </p>
              ) : promoteSearchError ? (
                <p className="px-4 py-6 text-center font-body text-sm text-danger" role="alert">
                  {promoteSearchError}
                </p>
              ) : promoteResults.length === 0 ? (
                <p className="px-4 py-6 text-center font-body text-sm text-on-surface-muted">
                  No students match your search.
                </p>
              ) : (
                <ul className="max-h-80 divide-y divide-outline-muted/10 overflow-y-auto">
                  {promoteResults.map((student) => (
                    <li key={student.userId}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudent(student);
                          setPromoteActionError("");
                        }}
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
                        <UserPlus className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </section>
      )}

      <CounsellorProfileModal
        counsellor={selectedCounsellor}
        error={counsellorActionError}
        toggling={toggling}
        demoting={demoting}
        onClose={() => {
          setSelectedCounsellor(null);
          setCounsellorActionError("");
        }}
        onToggleActive={handleToggleActive}
        onDemote={handleDemote}
      />

      <PromoteStudentModal
        student={selectedStudent}
        error={promoteActionError}
        promoting={promoting}
        onClose={() => {
          setSelectedStudent(null);
          setPromoteActionError("");
        }}
        onPromote={handlePromote}
      />
    </div>
  );
}
