import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ResourceForm, { formFromResource } from "../components/ResourceForm";
import { ApiError } from "../api/client";
import {
  createAdminResource,
  featureResource,
  getAdminResource,
  publishResource,
  toApiPayload,
  updateAdminResource,
} from "../api/resources";

export default function AdminResourceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [existingResource, setExistingResource] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode) return undefined;

    let cancelled = false;

    async function loadResource() {
      setLoading(true);
      setError("");
      try {
        const data = await getAdminResource(id);
        if (!cancelled) {
          setExistingResource(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setExistingResource(null);
          if (!(loadError instanceof ApiError && loadError.status === 404)) {
            setError(loadError.message || "Unable to load resource.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResource();
    return () => {
      cancelled = true;
    };
  }, [id, isEditMode]);

  const pageTitle = isEditMode ? "Edit Resource" : "New Resource";
  const notFound = isEditMode && !loading && !existingResource;

  const applyFeatured = async (resource, payload) => {
    if (resource.status !== "published") return resource;

    const featuredChanged =
      payload.featured !== resource.featured ||
      payload.featuredOrder !== resource.featuredOrder;

    if (!featuredChanged) return resource;

    await featureResource(resource.id, {
      featured: payload.featured,
      featuredOrder: payload.featured ? payload.featuredOrder : null,
    });

    return getAdminResource(resource.id);
  };

  const persist = async (payload, publish) => {
    setSaving(true);
    setError("");
    try {
      const apiPayload = toApiPayload(payload);
      let resource;

      if (isEditMode) {
        resource = await updateAdminResource(id, apiPayload);
        if (publish && resource.status !== "published") {
          await publishResource(id);
          resource = await getAdminResource(id);
        }
      } else {
        resource = await createAdminResource(apiPayload, { publish });
      }

      if (resource.status === "published" && (payload.featured || existingResource?.featured)) {
        resource = await applyFeatured(resource, payload);
      }

      navigate("/admin/resources");
    } catch (saveError) {
      setError(
        saveError instanceof ApiError
          ? saveError.message
          : "Unable to save resource.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="mx-auto max-w-2xl font-body text-sm text-on-surface-muted">
        Loading resource…
      </p>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-primary/5 bg-surface p-10 text-center shadow-md">
        <h1 className="mb-2 font-heading text-2xl font-bold text-on-surface">
          Resource not found
        </h1>
        <p className="mb-6 font-body text-sm text-on-surface-muted">
          This resource may have been removed or the link is incorrect.
        </p>
        <Link
          to="/admin/resources"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Manage Resources
        </Link>
      </div>
    );
  }

  return (
    <>
      {error ? (
        <p className="mx-auto mb-4 max-w-3xl rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 font-body text-sm text-danger">
          {error}
        </p>
      ) : null}
      <ResourceForm
        mode="admin"
        pageTitle={pageTitle}
        backTo="/admin/resources"
        backLabel="Back to Manage Resources"
        editHint={
          isEditMode ? `Editing · ${existingResource.id}` : "Create a new article"
        }
        initialForm={existingResource ? formFromResource(existingResource) : undefined}
        onSaveDraft={(payload) => persist(payload, false)}
        onPublish={(payload) => persist(payload, true)}
      />
    </>
  );
}
