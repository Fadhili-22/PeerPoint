import { Link, useParams } from "react-router-dom";
import { ArrowLeft, EyeOff } from "lucide-react";
import { ResourceStatusBadge } from "../components/AdminResourceRowActions";
import ResourceArticleView from "../components/ResourceArticleView";
import { useAuth } from "../context/AuthContext";
import { useResources } from "../context/ResourcesContext";

export default function CounsellorResourcePreview() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getResourceById } = useResources();
  const resource = getResourceById(id);

  const isOwner =
    resource?.submittedBy &&
    String(resource.submittedBy.id) === String(user.id);

  if (!resource || !isOwner) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-primary/5 bg-surface p-10 text-center shadow-md">
        <h1 className="mb-2 font-heading text-2xl font-bold text-on-surface">
          Resource not found
        </h1>
        <p className="mb-6 font-body text-sm text-on-surface-muted">
          This submission may have been removed or you do not have access to preview it.
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

  const isStudentVisible = resource.status === "published";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/counsellor/resources"
          className="inline-flex items-center gap-2 self-start font-heading text-sm font-semibold text-primary transition-all duration-200 hover:gap-3 hover:text-primary-dark"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to My Submissions
        </Link>
        <ResourceStatusBadge status={resource.status} />
      </div>

      {!isStudentVisible ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-accent-gold/30 bg-accent-gold/10 px-5 py-4"
        >
          <EyeOff className="mt-0.5 h-5 w-5 shrink-0 text-accent-gold" aria-hidden="true" />
          <div>
            <p className="font-heading text-sm font-semibold text-on-surface">
              Preview — not visible to students
            </p>
            <p className="mt-1 font-body text-sm text-on-surface-muted">
              Only published resources appear on the student Resource Hub.
            </p>
            {resource.status === "rejected" && resource.rejectionReason ? (
              <p className="mt-2 font-body text-sm text-on-surface">
                <span className="font-semibold">Admin feedback:</span>{" "}
                {resource.rejectionReason}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4"
        >
          <EyeOff className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="font-heading text-sm font-semibold text-on-surface">
              Preview — published and live
            </p>
            <p className="mt-1 font-body text-sm text-on-surface-muted">
              Students can view this resource on the Resource Hub.
            </p>
          </div>
        </div>
      )}

      <ResourceArticleView resource={resource} />
    </div>
  );
}
