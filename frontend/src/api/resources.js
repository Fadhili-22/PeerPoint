import { apiFetch } from "./client";



export function mapResource(api) {

  return {

    id: api.id,

    slug: api.slug,

    title: api.title,

    category: api.category,

    description: api.description,

    readTime: api.read_time,

    author: api.author,

    authorRole: api.author_role,

    image: api.image,

    imageAlt: api.image_alt,

    body: api.body ?? [],

    status: api.status,

    featured: api.featured,

    featuredOrder: api.featured_order,

    publishedAt: api.published_at,

    createdAt: api.created_at,

    updatedAt: api.updated_at,

    lastEditedBy: api.last_edited_by,

    submittedBy: api.submitted_by

      ? {

          id: api.submitted_by.id,

          fullName: api.submitted_by.full_name,

          email: api.submitted_by.email,

        }

      : null,

    submittedAt: api.submitted_at,

    reviewedBy: api.reviewed_by,

    reviewedAt: api.reviewed_at,

    rejectionReason: api.rejection_reason,

    views: api.views,

    saves: api.saves,

  };

}



export function mapResourceStats(api) {

  return {

    total: api.total,

    published: api.published,

    drafts: api.drafts,

    pendingReview: api.pending_review,

    featured: api.featured,

    archived: api.archived,

  };

}



export function toApiPayload(formPayload, { publish } = {}) {

  const body = (formPayload.body || [])

    .map((paragraph) => paragraph.trim())

    .filter(Boolean);



  const payload = {

    title: formPayload.title,

    category: formPayload.category,

    description: formPayload.description,

    read_time: formPayload.readTime?.trim() || "5 min read",

    author: formPayload.author,

    author_role: formPayload.authorRole,

    image: formPayload.image,

    image_alt: formPayload.imageAlt,

    body,

  };



  if (publish !== undefined) {

    payload.publish = publish;

  }



  return payload;

}



// --- Student reads (Prompt 7) ---



export async function listResources({ category, search } = {}) {

  const params = new URLSearchParams();

  if (category) params.set("category", category);

  if (search?.trim()) params.set("search", search.trim());

  const query = params.toString();

  const data = await apiFetch(`/resources${query ? `?${query}` : ""}`);

  return (data.resources ?? []).map(mapResource);

}



export async function getFeaturedResources(limit = 2) {

  const data = await apiFetch(`/resources/featured?limit=${limit}`);

  return (data.resources ?? []).map(mapResource);

}



export async function getRecommendedResources() {

  const data = await apiFetch("/resources/recommended");

  return (data.resources ?? []).map(mapResource);

}



export async function getResource(resourceId) {

  const data = await apiFetch(`/resources/${resourceId}`);

  return mapResource(data);

}



export async function getRelatedResources(resourceId) {

  const data = await apiFetch(`/resources/${resourceId}/related`);

  return (data.resources ?? []).map(mapResource);

}



export async function recordResourceView(resourceId) {

  return apiFetch(`/resources/${resourceId}/view`, { method: "POST" });

}



// --- Counsellor CMS ---



export async function listMyResources({ status } = {}) {

  const params = new URLSearchParams();

  if (status) params.set("status", status);

  const query = params.toString();

  const data = await apiFetch(`/counsellor/resources${query ? `?${query}` : ""}`);

  return (data.resources ?? []).map(mapResource);

}



export async function getMyResource(id) {

  const data = await apiFetch(`/counsellor/resources/${id}`);

  return mapResource(data);

}



export async function createResource(payload) {

  const data = await apiFetch("/counsellor/resources", {

    method: "POST",

    body: payload,

  });

  return mapResource(data);

}



export async function updateResource(id, payload) {

  const data = await apiFetch(`/counsellor/resources/${id}`, {

    method: "PUT",

    body: payload,

  });

  return mapResource(data);

}



export async function submitResourceForReview(id) {

  return apiFetch(`/counsellor/resources/${id}/submit`, { method: "POST" });

}



// --- Admin CMS ---



export async function listAdminResources({ status, search } = {}) {

  const params = new URLSearchParams();

  if (status) params.set("status", status);

  if (search?.trim()) params.set("search", search.trim());

  const query = params.toString();

  const data = await apiFetch(`/admin/resources${query ? `?${query}` : ""}`);

  return (data.resources ?? []).map(mapResource);

}



export async function getAdminResourceStats() {

  const data = await apiFetch("/admin/resources/stats");

  return mapResourceStats(data);

}



export async function listPendingReviewResources() {

  const data = await apiFetch("/admin/resources/pending-review");

  return (data.resources ?? []).map(mapResource);

}



export async function getAdminResource(id) {

  const data = await apiFetch(`/admin/resources/${id}`);

  return mapResource(data);

}



export async function createAdminResource(payload, { publish = false } = {}) {

  const data = await apiFetch("/admin/resources", {

    method: "POST",

    body: { ...payload, publish },

  });

  return mapResource(data);

}



export async function updateAdminResource(id, payload) {

  const data = await apiFetch(`/admin/resources/${id}`, {

    method: "PUT",

    body: payload,

  });

  return mapResource(data);

}



export async function publishResource(id) {

  return apiFetch(`/admin/resources/${id}/publish`, { method: "POST" });

}



export async function unpublishResource(id) {

  return apiFetch(`/admin/resources/${id}/unpublish`, { method: "POST" });

}



export async function featureResource(id, { featured, featuredOrder } = {}) {

  return apiFetch(`/admin/resources/${id}/feature`, {

    method: "POST",

    body: {

      featured,

      featured_order: featuredOrder ?? null,

    },

  });

}



export async function archiveResource(id) {

  return apiFetch(`/admin/resources/${id}/archive`, { method: "POST" });

}



export async function restoreResource(id) {

  return apiFetch(`/admin/resources/${id}/restore`, { method: "POST" });

}



export async function reviewResource(id, { decision, rejectionReason } = {}) {

  return apiFetch(`/admin/resources/${id}/review`, {

    method: "POST",

    body: {

      decision,

      rejection_reason: rejectionReason ?? null,

    },

  });

}


