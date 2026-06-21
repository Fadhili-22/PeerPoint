import { Link } from "react-router-dom";
import { Clock, MessageCircle } from "lucide-react";

export default function PendingApproval() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-soft-teal">
        <Clock className="h-8 w-8 text-primary" aria-hidden="true" />
      </div>
      <div className="mb-2 flex items-center justify-center gap-2 font-heading text-lg font-bold text-primary-dark">
        <MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" />
        PeerPoint
      </div>
      <h1 className="mb-2 font-heading text-2xl font-semibold text-on-surface">
        Account pending review
      </h1>
      <p className="mb-8 font-body text-base text-on-surface-muted">
        Your account is being reviewed by the PeerPoint team. You will receive
        an email at your Strathmore address once access is approved.
      </p>
      <Link
        to="/login"
        className="rounded-xl bg-primary px-5 py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Return to Sign In
      </Link>
    </div>
  );
}
