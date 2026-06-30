import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  CheckCircle,
  ClipboardCheck,
  Eye,
  FileText,
  Plus,
  Star,
  Upload,
  XCircle,
} from "lucide-react";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminKpiCard from "../components/AdminKpiCard";
import AdminResourceRowActions, {
  ConfirmArchiveModal,
  RejectSubmissionModal,
  ResourceStatusBadge,
} from "../components/AdminResourceRowActions";
import FilterChip from "../components/FilterChip";
import { ApiError } from "../api/client";
import {
  archiveResource,
  featureResource,
  getAdminResourceStats,
  listAdminResources,
  listPendingReviewResources,
  publishResource,
  restoreResource,
  reviewResource,
  unpublishResource,
} from "../api/resources";
import { formatResourceDisplayDate } from "../data/mockResources";
import { useResources } from "../context/ResourcesContext";

const statusFilters = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Drafts" },
  { id: "pending_review", label: "Pending Review" },
  { id: "featured", label: "Featured" },
  { id: "archived", label: "Archived" },
];

export default function AdminResources() {
  const { pushAdminResourceActivity } = useResources();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    () => searchParams.get("filter") || "all",
  );
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    pendingReview: 0,
    featured: 0,
    archived: 0,
  });
  const [pendingReviewResources, setPendingReviewResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (filterParam && statusFilters.some((filter) => filter.id === filterParam)) {
      setStatusFilter(filterParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const apiStatus =
        statusFilter === "all"
          ? undefined
          : statusFilter === "featured"
            ? "published"
            : statusFilter;
      const [statsData, pendingData, resourcesData] = await Promise.all([
        getAdminResourceStats(),
        listPendingReviewResources(),
        listAdminResources({
          status: apiStatus,
          search: debouncedSearch.trim() || undefined,
        }),
      ]);
      setStats(statsData);
      setPendingReviewResources(pendingData);
      setResources(resourcesData);
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : "Unable to load resources.",
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredResources = useMemo(() => {
    if (statusFilter !== "featured") return resources;
    return resources.filter(
      (resource) => resource.featured && resource.status === "published",
    );
  }, [resources, statusFilter]);

  const handleFilterChange = (filterId) => {
    setStatusFilter(filterId);
    if (filterId === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ filter: filterId });
    }
  };

  const runAction = async (action) => {
    setActionLoading(true);
    setError("");
    try {
      await action();
      await loadData();
    } catch (actionError) {
      setError(
        actionError instanceof ApiError
          ? actionError.message
          : "Unable to complete action.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = (resource) => {
    runAction(() => publishResource(resource.id));
  };

  const handleUnpublish = (resource) => {
    runAction(() => unpublishResource(resource.id));
  };

  const handleToggleFeatured = (resource) => {
    if (resource.featured) {
      runAction(() =>
        featureResource(resource.id, { featured: false, featuredOrder: null }),
      );
      return;
    }
    const featuredCount = resources.filter(
      (item) => item.featured && item.status === "published",
    ).length;
    runAction(() =>
      featureResource(resource.id, {
        featured: true,
        featuredOrder: featuredCount + 1,
      }),
    );
  };

  const handleConfirmArchive = (resource) => {
    runAction(async () => {
      await archiveResource(resource.id);
      setArchiveTarget(null);
    });
  };

  const handleApprovePublish = (resourceId) => {
    runAction(async () => {
      await reviewResource(resourceId, { decision: "approve_publish" });
      pushAdminResourceActivity(
        "Resource Approved",
        "Submission published to Resource Hub",
        "primary",
      );
    });
  };

  const handleApproveDraft = (resourceId) => {
    runAction(async () => {
      await reviewResource(resourceId, { decision: "approve_draft" });
      pushAdminResourceActivity(
        "Resource Approved to Draft",
        "Submission moved to admin draft for editing",
        "primary",
      );
    });
  };

  const handleConfirmReject = (resource, reason) => {
    runAction(async () => {
      await reviewResource(resource.id, {
        decision: "reject",
        rejectionReason: reason,
      });
      pushAdminResourceActivity(
        "Resource Returned",
        `"${resource.title}" sent back to counsellor`,
        "warning",
      );
      setRejectTarget(null);
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <AdminPageHeader
        eyebrow="Content management"
        title="Manage Resources"
        description="Publish and curate mental health articles for the student Resource Hub."
        searchPlaceholder="Search resources by title, category, or author..."
        searchValue={search}
        onSearchChange={setSearch}
        actions={
          <Link
            to="/admin/resources/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-heading text-sm font-semibold text-on-primary shadow-sm transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Resource
          </Link>
        }
        stats={[
          { label: "Total", value: stats.total, icon: BookOpen },
          { label: "Published", value: stats.published, icon: Upload },
          { label: "Drafts", value: stats.drafts, icon: FileText },
          { label: "Featured", value: stats.featured, icon: Star },
        ]}
      />

      {error ? (
        <p className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 font-body text-sm text-danger">
          {error}
        </p>
      ) : null}

      <section aria-label="Resource key metrics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <AdminKpiCard
            icon={BookOpen}
            label="Total Resources"
            value={stats.total}
            sublabel="Excluding archived"
            iconBg="bg-primary/10"
            iconColor="text-primary"
          />
          <AdminKpiCard
            icon={Upload}
            label="Published"
            value={stats.published}
            sublabel="Live on Resource Hub"
            iconBg="bg-soft-teal"
            iconColor="text-primary"
          />
          <AdminKpiCard
            icon={FileText}
            label="Drafts"
            value={stats.drafts}
            sublabel="Awaiting publication"
            iconBg="bg-accent-gold/10"
            iconColor="text-accent-gold"
          />
          <AdminKpiCard
            icon={ClipboardCheck}
            label="Pending Review"
            value={stats.pendingReview}
            urgent
            sublabel="Counsellor submissions"
            iconBg="bg-warning/10"
            iconColor="text-accent-gold"
          />
          <AdminKpiCard
            icon={Star}
            label="Featured"
            value={stats.featured}
            sublabel="Published & featured"
            iconBg="bg-primary-accent/20"
            iconColor="text-primary-light"
          />
        </div>
      </section>

      <section
        aria-label="Counsellor resource submissions awaiting review"
        className="overflow-hidden rounded-[28px] border border-primary/5 bg-surface shadow-md"
      >
        <div className="flex flex-col gap-1 border-b border-outline-muted/10 p-5">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="font-heading text-lg font-semibold text-on-surface">
              Pending Review
            </h2>
          </div>
          <p className="font-body text-sm text-on-surface-muted">
            Peer counsellor submissions awaiting editorial approval before they go
            live on the Resource Hub.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-muted font-heading text-sm font-semibold text-on-surface-muted">
                <th scope="col" className="px-5 py-3.5">
                  Resource
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Submitted by
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Category
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Submitted
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
              {pendingReviewResources.map((resource) => (
                <tr
                  key={resource.id}
                  className="transition-colors hover:bg-surface-muted/40"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="hidden h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:block">
                        <img
                          src={resource.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-heading text-sm font-semibold text-on-surface">
                          {resource.title}
                        </p>
                        <p className="font-body text-xs text-on-surface-muted">
                          {resource.author}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-heading text-sm font-semibold text-on-surface">
                      {resource.submittedBy?.fullName || "—"}
                    </p>
                    <p className="font-body text-xs text-on-surface-muted">
                      {resource.submittedBy?.email || ""}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-surface-muted px-2 py-1 font-heading text-[10px] font-bold uppercase text-on-surface-muted">
                      {resource.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-body text-sm text-on-surface-muted">
                    {formatResourceDisplayDate(resource.submittedAt)}
                  </td>
                  <td className="px-5 py-4">
                    <ResourceStatusBadge status={resource.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/admin/resources/${resource.id}/preview`}
                        title={`Preview ${resource.title}`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-heading text-xs font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/5"
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        Preview
                      </Link>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleApprovePublish(resource.id)}
                        title={`Approve and publish ${resource.title}`}
                        aria-label={`Approve and publish ${resource.title}`}
                        className="rounded-lg p-2 text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/10 disabled:opacity-50"
                      >
                        <CheckCircle className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleApproveDraft(resource.id)}
                        title={`Approve ${resource.title} to draft for editing`}
                        aria-label={`Approve ${resource.title} to draft`}
                        className="rounded-lg p-2 text-on-surface-muted transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-surface-muted hover:text-primary disabled:opacity-50"
                      >
                        <FileText className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => setRejectTarget(resource)}
                        title={`Return ${resource.title} to counsellor`}
                        aria-label={`Return ${resource.title} to counsellor`}
                        className="rounded-lg p-2 text-danger transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-danger/10 disabled:opacity-50"
                      >
                        <XCircle className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && pendingReviewResources.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
              <p className="font-heading text-base font-semibold text-on-surface">
                No submissions awaiting review
              </p>
              <p className="max-w-sm font-body text-sm text-on-surface-muted">
                Counsellor submissions will appear here when they are sent for
                admin review.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section
        aria-label="Resource library"
        className="overflow-hidden rounded-[28px] border border-primary/5 bg-surface shadow-md"
      >
        <div className="flex flex-col gap-4 border-b border-outline-muted/10 p-5 md:flex-row md:items-center md:justify-between">
          <h2 className="font-heading text-lg font-semibold text-on-surface">
            All Resources
          </h2>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <FilterChip
                key={filter.id}
                label={filter.label}
                active={statusFilter === filter.id}
                onClick={() => handleFilterChange(filter.id)}
              />
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <p className="px-5 py-12 font-body text-sm text-on-surface-muted">
              Loading resources…
            </p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-muted font-heading text-sm font-semibold text-on-surface-muted">
                  <th scope="col" className="px-5 py-3.5">
                    Resource
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Category
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Updated
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Views
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-muted/10">
                {filteredResources.map((resource) => (
                  <tr
                    key={resource.id}
                    className="transition-colors hover:bg-surface-muted/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="hidden h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:block">
                          <img
                            src={resource.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-heading text-sm font-semibold text-on-surface">
                              {resource.title}
                            </p>
                            {resource.featured && resource.status === "published" ? (
                              <span className="rounded-full bg-accent-gold/10 px-2 py-0.5 font-heading text-[10px] font-bold uppercase text-accent-gold">
                                Featured
                                {resource.featuredOrder != null
                                  ? ` · #${resource.featuredOrder}`
                                  : ""}
                              </span>
                            ) : null}
                          </div>
                          <p className="font-body text-xs text-on-surface-muted">
                            {resource.author}
                            {resource.submittedBy
                              ? ` · via ${resource.submittedBy.fullName}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-surface-muted px-2 py-1 font-heading text-[10px] font-bold uppercase text-on-surface-muted">
                        {resource.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <ResourceStatusBadge status={resource.status} />
                    </td>
                    <td className="px-5 py-4 font-body text-sm text-on-surface-muted">
                      {formatResourceDisplayDate(resource.updatedAt)}
                    </td>
                    <td className="px-5 py-4 font-body text-sm text-on-surface">
                      {resource.views.toLocaleString("en-US")}
                    </td>
                    <td className="px-5 py-4">
                      <AdminResourceRowActions
                        resource={resource}
                        onPublish={handlePublish}
                        onUnpublish={handleUnpublish}
                        onToggleFeatured={handleToggleFeatured}
                        onArchive={setArchiveTarget}
                        onRestore={(item) =>
                          runAction(() => restoreResource(item.id))
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredResources.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted">
                <Eye className="h-6 w-6 text-on-surface-subtle" aria-hidden="true" />
              </div>
              <p className="font-heading text-base font-semibold text-on-surface">
                No resources match your filters
              </p>
              <p className="max-w-sm font-body text-sm text-on-surface-muted">
                Try adjusting your search or choosing a different status filter.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <ConfirmArchiveModal
        resource={archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleConfirmArchive}
      />

      <RejectSubmissionModal
        resource={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
}
