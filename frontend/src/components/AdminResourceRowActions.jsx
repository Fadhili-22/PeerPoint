import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  ArchiveRestore,
  Eye,
  MoreHorizontal,
  Pencil,
  Star,
  StarOff,
} from "lucide-react";
import { formatResourceDisplayDate } from "../data/mockResources";

function ResourceStatusBadge({ status }) {
  const styles = {
    published: "bg-success/10 text-success",
    draft: "bg-accent-gold/10 text-accent-gold",
    pending_review: "bg-accent-gold/10 text-accent-gold",
    rejected: "bg-danger/10 text-danger",
    archived: "bg-surface-muted text-on-surface-muted",
  };

  const labels = {
    published: "Published",
    draft: "Draft",
    pending_review: "Pending Review",
    rejected: "Rejected",
    archived: "Archived",
  };

  const dotStyles = {
    published: "bg-success",
    draft: "bg-accent-gold",
    pending_review: "bg-accent-gold",
    rejected: "bg-danger",
    archived: "bg-outline-muted",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-xs font-bold ${styles[status] || styles.draft}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotStyles[status] || dotStyles.draft}`}
        aria-hidden="true"
      />
      {labels[status] || status}
    </span>
  );
}

function ConfirmArchiveModal({ resource, onClose, onConfirm }) {
  if (!resource) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Archive ${resource.title}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-primary/5 bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="font-heading text-lg font-semibold text-on-surface">
          Archive resource?
        </h2>
        <p className="mt-2 font-body text-sm text-on-surface-muted">
          &ldquo;{resource.title}&rdquo; will be hidden from the student Resource Hub.
          You can restore it later from the Archived filter.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-outline-muted/40 bg-surface py-2.5 font-heading text-sm font-semibold text-on-surface transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(resource)}
            className="flex-1 rounded-xl bg-danger py-2.5 font-heading text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectSubmissionModal({ resource, onClose, onConfirm }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (resource) setReason("");
  }, [resource]);

  if (!resource) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Reject ${resource.title}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-primary/5 bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="font-heading text-lg font-semibold text-on-surface">
          Return submission to counsellor?
        </h2>
        <p className="mt-2 font-body text-sm text-on-surface-muted">
          &ldquo;{resource.title}&rdquo; will be sent back to{" "}
          {resource.submittedBy?.fullName || "the submitter"} for edits. You may
          include optional feedback below.
        </p>
        <label htmlFor="rejection-reason" className="mt-4 block">
          <span className="mb-1.5 block font-heading text-sm font-semibold text-on-surface">
            Rejection reason (optional)
          </span>
          <textarea
            id="rejection-reason"
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Explain what needs to change before this can be approved..."
            className="w-full rounded-xl border border-outline-muted/40 bg-surface px-4 py-2.5 font-body text-sm text-on-surface shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-accent/40"
          />
        </label>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-outline-muted/40 bg-surface py-2.5 font-heading text-sm font-semibold text-on-surface transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(resource, reason)}
            className="flex-1 rounded-xl bg-danger py-2.5 font-heading text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
          >
            Return to Counsellor
          </button>
        </div>
      </div>
    </div>
  );
}

function RowActionsMenu({
  resource,
  onPublish,
  onUnpublish,
  onToggleFeatured,
  onArchive,
  onRestore,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const isPublished = resource.status === "published";
  const isDraft = resource.status === "draft";
  const isArchived = resource.status === "archived";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`More actions for ${resource.title}`}
        className="inline-flex items-center justify-center rounded-lg p-2 font-heading text-xs font-semibold text-on-surface-muted transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-surface-muted hover:text-on-surface"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-primary/10 bg-surface py-1 shadow-xl"
        >
          {!isArchived && isPublished ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onUnpublish(resource);
                setOpen(false);
              }}
              className="flex w-full px-4 py-2.5 text-left font-body text-sm text-on-surface transition-colors hover:bg-surface-muted"
            >
              Unpublish
            </button>
          ) : null}
          {!isArchived && isDraft ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onPublish(resource);
                setOpen(false);
              }}
              className="flex w-full px-4 py-2.5 text-left font-body text-sm text-on-surface transition-colors hover:bg-surface-muted"
            >
              Publish
            </button>
          ) : null}
          {!isArchived ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onToggleFeatured(resource);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-body text-sm text-on-surface transition-colors hover:bg-surface-muted"
            >
              {resource.featured ? (
                <>
                  <StarOff className="h-4 w-4" aria-hidden="true" />
                  Unfeature
                </>
              ) : (
                <>
                  <Star className="h-4 w-4" aria-hidden="true" />
                  Feature
                </>
              )}
            </button>
          ) : null}
          {!isArchived ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onArchive(resource);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-body text-sm text-danger transition-colors hover:bg-danger/5"
            >
              <Archive className="h-4 w-4" aria-hidden="true" />
              Archive
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onRestore(resource);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-body text-sm text-on-surface transition-colors hover:bg-surface-muted"
            >
              <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
              Restore to draft
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminResourceRowActions({
  resource,
  onPublish,
  onUnpublish,
  onToggleFeatured,
  onArchive,
  onRestore,
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        to={`/admin/resources/${resource.id}/preview`}
        title={`Preview ${resource.title}`}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-heading text-xs font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/5"
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
        Preview
      </Link>
      <Link
        to={`/admin/resources/${resource.id}/edit`}
        title={`Edit ${resource.title}`}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-heading text-xs font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/5"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
        Edit
      </Link>
      <RowActionsMenu
        resource={resource}
        onPublish={onPublish}
        onUnpublish={onUnpublish}
        onToggleFeatured={onToggleFeatured}
        onArchive={onArchive}
        onRestore={onRestore}
      />
    </div>
  );
}

export { ResourceStatusBadge, ConfirmArchiveModal, RejectSubmissionModal };
