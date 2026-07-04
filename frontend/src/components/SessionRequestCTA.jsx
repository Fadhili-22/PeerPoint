import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

export default function SessionRequestCTA({ counsellorId, counsellorName }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-primary-dark/20 bg-gradient-to-br from-primary-dark via-primary to-primary-light shadow-[0_12px_40px_rgba(0,100,112,0.25)]">
      <div className="p-6">
        <h3 className="font-heading text-lg font-bold text-on-primary">Ready to connect?</h3>
        <p className="mt-2 font-body text-sm leading-relaxed text-on-primary/85">
          Book a confidential 30-minute introductory session to see if {counsellorName} is
          the right fit for your needs.
        </p>
        <Link
          to={`/student/book/${counsellorId}`}
          className="mt-5 flex w-full items-center justify-center rounded-xl bg-surface py-3 font-heading text-sm font-bold text-primary-dark shadow-md transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-on-primary focus:ring-offset-2 focus:ring-offset-primary"
        >
          Request a Session
        </Link>
      </div>
      <div className="flex items-start gap-2.5 border-t border-on-primary/15 bg-black/10 px-5 py-4">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-on-primary/80" aria-hidden="true" />
        <p className="font-body text-xs leading-relaxed text-on-primary/75">
          <span className="font-semibold text-on-primary">Privacy note:</span>{" "}
          {counsellorName} won&apos;t see your name until you confirm a specific time slot.
        </p>
      </div>
    </div>
  );
}
