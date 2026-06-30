import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ResourceForm, { formFromResource } from "../components/ResourceForm";
import { ApiError } from "../api/client";
import {
  createResource,
  getMyResource,
  submitResourceForReview,
  toApiPayload,
  updateResource,
} from "../api/resources";
import { useAuth } from "../context/AuthContext";
import { COUNSELLOR_AUTHOR_ROLE } from "../data/mockResources";

function isOwnedByCounsellor(resource, userId) {
  return (
    resource.submittedBy && String(resource.submittedBy.id) === String(userId)
  );
}

export default function CounsellorResourceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = Boolean(id);
  const [existingResource, setExistingResource] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const lockedAuthor = {
    author: user.fullName,
    authorRole: COUNSELLOR_AUTHOR_ROLE,
  };

  useEffect(() => {
    if (!isEditMode) return undefined;

    let cancelled = false;

    async function loadResource() {
      setLoading(true);
      setError("");
      try {
        const data = await getMyResource(id);
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

  const notFound = isEditMode && !loading && !existingResource;
  const notOwner =
    isEditMode &&
    existingResource &&
    !isOwnedByCounsellor(existingResource, user.id);
  const readOnlyQueued =
    isEditMode && existingResource?.status === "pending_review";
  const readOnlyPublished =
    isEditMode && existingResource?.status === "published";

  const persistDraft = async (payload) => {
    const apiPayload = toApiPayload({
      ...payload,
      author: lockedAuthor.author,
      authorRole: lockedAuthor.authorRole,
    });

    if (existingResource?.id) {
      return updateResource(existingResource.id, apiPayload);
    }

    return createResource(apiPayload);
  };

  const handleSaveDraft = async (payload) => {
    setSaving(true);
    setError("");
    try {
      await persistDraft(payload);
      navigate("/counsellor/resources");
    } catch (saveError) {
      setError(
        saveError instanceof ApiError
          ? saveError.message
          : "Unable to save draft.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async (payload) => {
    setSaving(true);
    setError("");
    try {
      const saved = await persistDraft(payload);
      await submitResourceForReview(saved.id);
      navigate("/counsellor/resources");
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : "Unable to submit resource for review.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="mx-auto max-w-2xl font-body text-sm text-on-surface-muted">
        Loading submission…
      </p>
    );
  }

  if (notFound || notOwner) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-primary/5 bg-surface p-10 text-center shadow-md">
        <h1 className="mb-2 font-heading text-2xl font-bold text-on-surface">
          Resource not found
        </h1>
        <p className="mb-6 font-body text-sm text-on-surface-muted">
          This submission may have been removed or you do not have access to edit it.
        </p>
        <Link
          to="/counsellor/resources"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to My Submissions
        </Link>
      </div>
    );
  }

  if (readOnlyQueued || readOnlyPublished) {
    const message = readOnlyQueued
      ? "This submission is awaiting admin review and cannot be edited right now."
      : "This article is published. Counsellors cannot edit live resources in this version of PeerPoint.";

    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-primary/5 bg-surface p-10 text-center shadow-md">
        <h1 className="mb-2 font-heading text-2xl font-bold text-on-surface">
          {existingResource.title}
        </h1>
        <p className="mb-6 font-body text-sm text-on-surface-muted">{message}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/counsellor/resources"
            className="inline-flex items-center gap-2 rounded-xl border border-outline-muted/40 bg-surface px-5 py-2.5 font-heading text-sm font-semibold text-on-surface transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
          >
            Back to My Submissions
          </Link>
          <Link
            to={`/counsellor/resources/${existingResource.id}/preview`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
          >
            Preview
          </Link>
        </div>
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
        mode="counsellor"
        pageTitle={isEditMode ? "Edit Submission" : "Submit Resource"}
        backTo="/counsellor/resources"
        backLabel="Back to My Submissions"
        editHint={
          isEditMode
            ? `Editing · ${existingResource.id}`
            : "Draft an article for admin review before it goes live"
        }
        initialForm={existingResource ? formFromResource(existingResource) : undefined}
        lockedAuthor={lockedAuthor}
        onSaveDraft={handleSaveDraft}
        onSubmitForReview={handleSubmitForReview}
      />
    </>
  );
}
