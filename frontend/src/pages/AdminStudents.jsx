import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Loader2, UserPlus, Users } from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import { ApiError } from "../api/client";
import {
  listAdminCounsellors,
  listAdminStudents,
  promoteCounsellor,
} from "../api/admin";

function formatNumber(value) {
  return value.toLocaleString("en-US");
}

export default function AdminStudents() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [counsellorUserIds, setCounsellorUserIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [promotingId, setPromotingId] = useState(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [rows, counsellors] = await Promise.all([
        listAdminStudents(),
        listAdminCounsellors(),
      ]);
      setStudents(rows);
      setCounsellorUserIds(new Set(counsellors.map((c) => c.userId)));
    } catch (err) {
      setStudents([]);
      setCounsellorUserIds(new Set());
      setError(err.message ?? "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query),
    );
  }, [students, search]);

  const handlePromote = async (student) => {
    setPromotingId(student.userId);
    setError("");
    setFeedback("");
    try {
      const result = await promoteCounsellor(student.userId);
      setFeedback(result?.message || `${student.name} promoted to counsellor.`);
      await loadStudents();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Unable to promote this student.");
      } else {
        setError("Unable to promote this student. Please try again.");
      }
    } finally {
      setPromotingId(null);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <AdminPageHeader
        eyebrow="Student management"
        title="Manage Students"
        description="View student accounts and promote students to peer counsellor when ready."
        searchPlaceholder="Search students by name or email..."
        searchValue={search}
        onSearchChange={setSearch}
        stats={[
          { label: "Students", value: formatNumber(students.length), icon: Users },
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
      {feedback ? (
        <div
          role="status"
          className="rounded-2xl border border-success/20 bg-success/5 px-4 py-3 font-body text-sm text-success"
        >
          {feedback}
        </div>
      ) : null}

      <section
        aria-label="Student directory"
        className="overflow-hidden rounded-[28px] border border-primary/5 bg-surface shadow-md"
      >
        <div className="border-b border-outline-muted/10 p-5">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="font-heading text-lg font-semibold text-on-surface">
              All Students
            </h2>
          </div>
          <p className="mt-1 font-body text-sm text-on-surface-muted">
            Select a student and promote them to peer counsellor. They will receive
            a default counsellor profile to complete.
          </p>
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
                  <th scope="col" className="px-5 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-muted/10">
                {filteredStudents.map((student) => {
                  const isCounsellor = counsellorUserIds.has(student.userId);
                  const isPromoting = promotingId === student.userId;
                  return (
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
                      <td className="px-5 py-4 text-right">
                        {isCounsellor ? (
                          <span className="font-body text-xs font-medium text-on-surface-muted">
                            Already a counsellor
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePromote(student)}
                            disabled={isPromoting}
                            title={`Promote ${student.name} to counsellor`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 font-heading text-xs font-semibold text-on-primary shadow-sm transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isPromoting ? (
                              <Loader2
                                className="h-4 w-4 animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                            )}
                            {isPromoting ? "Promoting…" : "Promote to Counsellor"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
    </div>
  );
}
