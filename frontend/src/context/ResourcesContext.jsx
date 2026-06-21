import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  COUNSELLOR_AUTHOR_ROLE,
  createInitialResources,
  emptySubmissionMetadata,
  slugifyTitle,
  sortFeaturedResources,
} from "../data/mockResources";
import { useAuth } from "./AuthContext";

const ResourcesContext = createContext(null);

function nowIso() {
  return new Date().toISOString();
}

function ensureUniqueId(baseId, existingIds) {
  let candidate = baseId;
  let suffix = 1;
  while (existingIds.has(candidate)) {
    candidate = `${baseId}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function normalizeBody(body) {
  return body.map((paragraph) => paragraph.trim()).filter(Boolean);
}

function counsellorSubmitter(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
}

export function ResourcesProvider({ children }) {
  const { user } = useAuth();
  const [resources, setResources] = useState(() => createInitialResources());
  const [counsellorActivity, setCounsellorActivity] = useState([]);
  const [adminResourceActivity, setAdminResourceActivity] = useState([]);

  const editorName = user?.fullName || "Admin User";
  const isCounsellor = user?.role === "counsellor";

  const pushCounsellorActivity = useCallback((text, variant = "primary", icon = "done") => {
    setCounsellorActivity((prev) =>
      [
        {
          id: `counsellor-activity-${Date.now()}-${prev.length}`,
          icon,
          variant,
          text,
          time: "Just now",
        },
        ...prev,
      ].slice(0, 10),
    );
  }, []);

  const pushAdminResourceActivity = useCallback(
    (title, description, variant = "primary") => {
      setAdminResourceActivity((prev) =>
        [
          {
            id: `admin-resource-activity-${Date.now()}-${prev.length}`,
            title,
            description,
            time: "Just now",
            variant,
          },
          ...prev,
        ].slice(0, 10),
      );
    },
    [],
  );

  const getResourceById = useCallback(
    (resourceId) => {
      const normalized = String(resourceId);
      return resources.find((resource) => String(resource.id) === normalized) || null;
    },
    [resources],
  );

  const getPublishedResources = useCallback(() => {
    return resources.filter((resource) => resource.status === "published");
  }, [resources]);

  const getFeaturedPublishedResources = useCallback(
    (limit = 2) => {
      const featured = getPublishedResources().filter((resource) => resource.featured);
      return sortFeaturedResources(featured).slice(0, limit);
    },
    [getPublishedResources],
  );

  const getRelatedResources = useCallback(
    (resourceId, limit = 3) => {
      const current = getResourceById(resourceId);
      if (!current) return [];

      const normalized = String(resourceId);
      const pool = getPublishedResources().filter(
        (resource) => String(resource.id) !== normalized,
      );
      const sameCategory = pool.filter(
        (resource) => resource.category === current.category,
      );
      const others = pool.filter(
        (resource) => resource.category !== current.category,
      );
      return [...sameCategory, ...others].slice(0, limit);
    },
    [getResourceById, getPublishedResources],
  );

  const getPendingReviewResources = useCallback(() => {
    return resources.filter((resource) => resource.status === "pending_review");
  }, [resources]);

  const getResourcesBySubmitter = useCallback(
    (userId) => {
      const normalized = String(userId);
      return resources.filter(
        (resource) =>
          resource.submittedBy &&
          String(resource.submittedBy.id) === normalized,
      );
    },
    [resources],
  );

  const saveResource = useCallback(
    ({ id, publish = false, ...payload }) => {
      const timestamp = nowIso();
      const body = normalizeBody(payload.body || []);
      const nextStatus = publish ? "published" : payload.status || "draft";

      if (id) {
        setResources((prev) =>
          prev.map((resource) => {
            if (resource.id !== id) return resource;

            const publishedAt =
              nextStatus === "published"
                ? resource.publishedAt || timestamp
                : nextStatus === "draft"
                  ? null
                  : resource.publishedAt;

            const submissionPatch =
              isCounsellor && resource.submittedBy
                ? {}
                : isCounsellor
                  ? { submittedBy: counsellorSubmitter(user) }
                  : {};

            return {
              ...resource,
              ...payload,
              body,
              status: nextStatus,
              publishedAt,
              updatedAt: timestamp,
              lastEditedBy: editorName,
              featured: Boolean(payload.featured),
              featuredOrder: payload.featured ? payload.featuredOrder ?? null : null,
              ...submissionPatch,
            };
          }),
        );
        return id;
      }

      const baseId = slugifyTitle(payload.title) || "resource";
      const newId = ensureUniqueId(
        baseId,
        new Set(resources.map((resource) => resource.id)),
      );
      const publishedAt = nextStatus === "published" ? timestamp : null;
      const submissionMeta = isCounsellor
        ? { ...emptySubmissionMetadata(), submittedBy: counsellorSubmitter(user) }
        : emptySubmissionMetadata();

      const newResource = {
        id: newId,
        slug: newId,
        title: payload.title,
        category: payload.category,
        description: payload.description,
        readTime: payload.readTime || "5 min read",
        author: payload.author,
        authorRole: payload.authorRole,
        image: payload.image,
        imageAlt: payload.imageAlt,
        body,
        status: nextStatus,
        featured: Boolean(payload.featured),
        featuredOrder: payload.featured ? payload.featuredOrder ?? null : null,
        publishedAt,
        createdAt: timestamp,
        updatedAt: timestamp,
        lastEditedBy: editorName,
        ...submissionMeta,
        views: 0,
        saves: 0,
      };

      setResources((prev) => [...prev, newResource]);
      return newId;
    },
    [editorName, isCounsellor, resources, user],
  );

  const submitForReview = useCallback(
    (resourceId) => {
      const existing = resources.find((resource) => resource.id === resourceId);
      if (!existing) return null;

      const body = normalizeBody(existing.body || []);
      const isComplete =
        existing.title?.trim() &&
        existing.category &&
        existing.description?.trim() &&
        existing.image?.trim() &&
        existing.imageAlt?.trim() &&
        body.length > 0;

      if (!isComplete) return null;

      const timestamp = nowIso();
      let title = existing.title;

      setResources((prev) =>
        prev.map((resource) => {
          if (resource.id !== resourceId) return resource;
          return {
            ...resource,
            status: "pending_review",
            submittedAt: resource.submittedAt || timestamp,
            submittedBy: resource.submittedBy || counsellorSubmitter(user),
            rejectionReason: null,
            updatedAt: timestamp,
            lastEditedBy: editorName,
          };
        }),
      );

      pushCounsellorActivity(`Submitted "${title}" for admin review`, "primary", "check");

      return resourceId;
    },
    [editorName, pushCounsellorActivity, resources, user],
  );

  const reviewResource = useCallback(
    ({ resourceId, decision, rejectionReason = "" }) => {
      const timestamp = nowIso();
      let title = "";
      let submitterName = "";

      setResources((prev) =>
        prev.map((resource) => {
          if (resource.id !== resourceId) return resource;

          title = resource.title;
          submitterName = resource.submittedBy?.fullName || "Counsellor";

          if (decision === "approve_publish") {
            return {
              ...resource,
              status: "published",
              publishedAt: resource.publishedAt || timestamp,
              reviewedBy: editorName,
              reviewedAt: timestamp,
              rejectionReason: null,
              updatedAt: timestamp,
              lastEditedBy: editorName,
            };
          }

          if (decision === "approve_draft") {
            return {
              ...resource,
              status: "draft",
              publishedAt: null,
              reviewedBy: editorName,
              reviewedAt: timestamp,
              rejectionReason: null,
              updatedAt: timestamp,
              lastEditedBy: editorName,
            };
          }

          return {
            ...resource,
            status: "rejected",
            reviewedBy: editorName,
            reviewedAt: timestamp,
            rejectionReason: rejectionReason.trim() || null,
            updatedAt: timestamp,
            lastEditedBy: editorName,
          };
        }),
      );

      if (!title) return resourceId;

      if (decision === "approve_publish") {
        pushCounsellorActivity(`Your article "${title}" was approved and published`, "success", "check");
        pushAdminResourceActivity(
          "Resource Approved",
          `"${title}" published to Resource Hub`,
          "primary",
        );
      } else if (decision === "approve_draft") {
        pushCounsellorActivity(
          `Your article "${title}" was approved — an admin will finalize edits before publishing`,
          "primary",
          "done",
        );
        pushAdminResourceActivity(
          "Resource Approved to Draft",
          `"${title}" moved to admin draft for editing`,
          "primary",
        );
      } else {
        pushCounsellorActivity(`Your article "${title}" was returned for edits`, "primary", "calendar");
        pushAdminResourceActivity(
          "Resource Returned",
          `"${title}" sent back to ${submitterName}`,
          "warning",
        );
      }

      return resourceId;
    },
    [editorName, pushAdminResourceActivity, pushCounsellorActivity],
  );

  const setResourceStatus = useCallback(
    (resourceId, status) => {
      const timestamp = nowIso();
      setResources((prev) =>
        prev.map((resource) => {
          if (resource.id !== resourceId) return resource;

          const publishedAt =
            status === "published"
              ? resource.publishedAt || timestamp
              : status === "draft"
                ? null
                : resource.publishedAt;

          return {
            ...resource,
            status,
            publishedAt,
            updatedAt: timestamp,
            lastEditedBy: editorName,
          };
        }),
      );
    },
    [editorName],
  );

  const setResourceFeatured = useCallback(
    (resourceId, featured, featuredOrder = null) => {
      const timestamp = nowIso();
      setResources((prev) =>
        prev.map((resource) => {
          if (resource.id !== resourceId) return resource;
          return {
            ...resource,
            featured,
            featuredOrder: featured ? featuredOrder : null,
            updatedAt: timestamp,
            lastEditedBy: editorName,
          };
        }),
      );
    },
    [editorName],
  );

  const archiveResource = useCallback(
    (resourceId) => {
      setResourceStatus(resourceId, "archived");
    },
    [setResourceStatus],
  );

  const restoreResource = useCallback(
    (resourceId) => {
      setResourceStatus(resourceId, "draft");
    },
    [setResourceStatus],
  );

  const stats = useMemo(() => {
    const active = resources.filter((resource) => resource.status !== "archived");
    return {
      total: active.length,
      published: resources.filter((resource) => resource.status === "published").length,
      drafts: resources.filter((resource) => resource.status === "draft").length,
      pendingReview: resources.filter((resource) => resource.status === "pending_review")
        .length,
      featured: resources.filter(
        (resource) => resource.featured && resource.status === "published",
      ).length,
      archived: resources.filter((resource) => resource.status === "archived").length,
    };
  }, [resources]);

  const value = useMemo(
    () => ({
      resources,
      stats,
      counsellorActivity,
      adminResourceActivity,
      getResourceById,
      getPublishedResources,
      getFeaturedPublishedResources,
      getRelatedResources,
      getPendingReviewResources,
      getResourcesBySubmitter,
      saveResource,
      submitForReview,
      reviewResource,
      setResourceStatus,
      setResourceFeatured,
      archiveResource,
      restoreResource,
    }),
    [
      resources,
      stats,
      counsellorActivity,
      adminResourceActivity,
      getResourceById,
      getPublishedResources,
      getFeaturedPublishedResources,
      getRelatedResources,
      getPendingReviewResources,
      getResourcesBySubmitter,
      saveResource,
      submitForReview,
      reviewResource,
      setResourceStatus,
      setResourceFeatured,
      archiveResource,
      restoreResource,
    ],
  );

  return (
    <ResourcesContext.Provider value={value}>{children}</ResourcesContext.Provider>
  );
}

export function useResources() {
  const context = useContext(ResourcesContext);
  if (!context) {
    throw new Error("useResources must be used within a ResourcesProvider");
  }
  return context;
}

export { COUNSELLOR_AUTHOR_ROLE };
