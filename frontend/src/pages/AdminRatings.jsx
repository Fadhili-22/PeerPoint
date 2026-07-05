import { useCallback, useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import { ApiError } from "../api/client";
import { listAdminCounsellors, listAdminRatings } from "../api/admin";

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StarsDisplay({ count }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= count
              ? "fill-accent-gold text-accent-gold"
              : "text-outline-muted"
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function AdminRatingsPanel() {
  const [ratings, setRatings] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [counsellorFilter, setCounsellorFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const counsellorId =
        counsellorFilter === "all" ? undefined : Number(counsellorFilter);
      const [ratingRows, counsellorRows] = await Promise.all([
        listAdminRatings({ counsellorId }),
        listAdminCounsellors(),
      ]);
      setRatings(ratingRows);
      setCounsellors(counsellorRows);
    } catch (err) {
      setRatings([]);
      if (err instanceof ApiError && err.status === 403) {
        setError("You are not authorized to view ratings.");
      } else {
        setError(err.message || "Unable to load ratings.");
      }
    } finally {
      setLoading(false);
    }
  }, [counsellorFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(
    () => ({
      total: ratings.length,
      average:
        ratings.length > 0
          ? (
              ratings.reduce((sum, rating) => sum + rating.stars, 0) /
              ratings.length
            ).toFixed(1)
          : "—",
    }),
    [ratings],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <AdminPageHeader
        eyebrow="Session feedback"
        title="Session Ratings"
        description="Anonymous student feedback on completed counselling sessions."
        stats={[
          { label: "Total ratings", value: stats.total, icon: Star },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex flex-col gap-2 font-body text-sm text-on-surface-muted sm:flex-row sm:items-center">
          <span className="font-medium">Filter by counsellor</span>
          <select
            value={counsellorFilter}
            onChange={(event) => setCounsellorFilter(event.target.value)}
            className="rounded-xl border border-outline-muted/30 bg-surface px-3 py-2 font-body text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All counsellors</option>
            {counsellors.map((counsellor) => (
              <option key={counsellor.userId} value={counsellor.userId}>
                {counsellor.name}
              </option>
            ))}
          </select>
        </label>
        <p className="font-body text-sm text-on-surface-muted">
          Average rating: <span className="font-semibold text-on-surface">{stats.average}</span>
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-danger/20 bg-danger/5 px-5 py-3 font-body text-sm font-medium text-danger"
        >
          {error}
        </div>
      ) : null}

      <section
        aria-label="Session ratings"
        className="overflow-hidden rounded-[28px] border border-primary/5 bg-surface shadow-md"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-muted font-heading text-sm font-semibold text-on-surface-muted">
                <th scope="col" className="px-5 py-3.5">
                  Counsellor
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Topic
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Rating
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Comment
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-muted/10">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center font-body text-sm text-on-surface-muted"
                  >
                    Loading ratings…
                  </td>
                </tr>
              ) : ratings.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center font-body text-sm text-on-surface-muted"
                  >
                    No ratings yet.
                  </td>
                </tr>
              ) : (
                ratings.map((rating) => (
                  <tr
                    key={rating.id}
                    className="transition-colors hover:bg-surface-muted/40"
                  >
                    <td className="px-5 py-4 font-heading text-sm font-semibold text-on-surface">
                      {rating.counsellorName}
                    </td>
                    <td className="px-5 py-4 font-body text-sm text-on-surface">
                      {rating.sessionTopic}
                    </td>
                    <td className="px-5 py-4">
                      <StarsDisplay count={rating.stars} />
                    </td>
                    <td className="max-w-xs px-5 py-4 font-body text-sm text-on-surface-muted">
                      {rating.comment || "—"}
                    </td>
                    <td className="px-5 py-4 font-body text-sm text-on-surface-muted">
                      {formatDateTime(rating.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
