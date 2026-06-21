import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ResourceForm, { formFromResource } from "../components/ResourceForm";
import { useResources } from "../context/ResourcesContext";

export default function AdminResourceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getResourceById, saveResource } = useResources();
  const isEditMode = Boolean(id);
  const existingResource = isEditMode ? getResourceById(id) : null;

  const pageTitle = isEditMode ? "Edit Resource" : "New Resource";
  const notFound = isEditMode && !existingResource;

  const persist = (payload, publish) => {
    saveResource({
      id: existingResource?.id,
      publish,
      ...payload,
      status: publish ? "published" : "draft",
    });
    navigate("/admin/resources");
  };

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
  );
}
