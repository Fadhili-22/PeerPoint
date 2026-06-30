import { useEffect, useState } from "react";

export default function RejectSessionModal({
  request,
  onClose,
  onConfirm,
  submitting,
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    setReason("");
  }, [request?.id]);

  if (!request) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Reject request from ${request.name}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-primary/5 bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-2 font-heading text-lg font-semibold text-on-surface">
          Reject session request
        </h2>
        <p className="mb-4 font-body text-sm text-on-surface-muted">
          {request.name} will be notified that you could not meet on the
          requested day and encouraged to book with another counsellor. You can
          optionally leave a short message below.
        </p>
        <label
          htmlFor="reject-reason"
          className="mb-2 block font-heading text-sm font-semibold text-on-surface"
        >
          Message for the student{" "}
          <span className="font-normal text-on-surface-muted">(optional)</span>
        </label>
        <textarea
          id="reject-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={4}
          placeholder="e.g. I'm unavailable that day — sorry about that!"
          className="mb-4 w-full resize-none rounded-xl border border-outline-muted bg-surface px-4 py-3 font-body text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-outline-muted/30 px-4 py-2.5 font-heading text-sm font-semibold text-on-surface-muted transition-colors hover:bg-surface-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason.trim() || undefined)}
            disabled={submitting}
            className="rounded-xl bg-danger px-4 py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Rejecting..." : "Reject Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
