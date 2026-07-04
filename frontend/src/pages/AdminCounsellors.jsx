import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Headset, Loader2, Users, X } from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import { ApiError } from "../api/client";
import { listAdminCounsellors } from "../api/admin";

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

  const rows = [
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
              <dd className="text-right font-medium text-on-surface">
                {row.value}
              </dd>
            </div>
          ))}
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-muted">Status</dt>
            <dd>
              <StatusBadge status={counsellor.status} />
            </dd>
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
  const [counsellorList, setCounsellorList] = useState([]);
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const counsellorData = await listAdminCounsellors();
      setCounsellorList(counsellorData);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("You are not authorized to manage counsellors.");
      } else {
        setError(err.message || "Unable to load counsellors. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCounsellors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return counsellorList;
    return counsellorList.filter(
      (counsellor) =>
        counsellor.name.toLowerCase().includes(query) ||
        counsellor.email.toLowerCase().includes(query) ||
        counsellor.specialties.some((specialty) =>
          specialty.toLowerCase().includes(query),
        ),
    );
  }, [search, counsellorList]);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <AdminPageHeader
        eyebrow="Counsellor management"
        title="Manage Counsellors"
        description="View and oversee the active peer counselling team."
        searchPlaceholder="Search counsellors by name, email, or specialty..."
        searchValue={search}
        onSearchChange={setSearch}
        stats={[
          { label: "Counsellors", value: counsellorList.length, icon: Headset },
        ]}
      />

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-danger/20 bg-danger/5 px-5 py-3 font-body text-sm font-medium text-danger"
        >
          {error}
        </div>
      ) : null}

      <section
        aria-label="Counsellor directory"
        className="overflow-hidden rounded-[28px] border border-primary/5 bg-surface shadow-md"
      >
        <div className="border-b border-outline-muted/10 p-5">
          <h2 className="font-heading text-lg font-semibold text-on-surface">
            All Counsellors
          </h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-5 py-16 font-body text-sm text-on-surface-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Loading counsellors...
            </div>
          ) : (
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
                        {counsellor.specialties.length > 0 ? (
                          counsellor.specialties.map((specialty) => (
                            <span
                              key={specialty}
                              className="rounded-full bg-surface-muted px-2 py-1 font-heading text-[10px] font-bold uppercase text-on-surface-muted"
                            >
                              {specialty}
                            </span>
                          ))
                        ) : (
                          <span className="font-body text-xs text-on-surface-subtle">
                            —
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-body text-sm text-on-surface">
                      {counsellor.sessions}
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
          )}
          {!loading && filteredCounsellors.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted">
                <Users className="h-6 w-6 text-on-surface-subtle" aria-hidden="true" />
              </div>
              <p className="font-heading text-base font-semibold text-on-surface">
                {counsellorList.length === 0
                  ? "No counsellors yet"
                  : "No counsellors match your search"}
              </p>
              <p className="max-w-sm font-body text-sm text-on-surface-muted">
                {counsellorList.length === 0
                  ? "Promote a student from Manage Students to add a counsellor."
                  : "Try adjusting your search terms."}
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
