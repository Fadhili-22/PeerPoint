import { useState } from "react";
import { Link } from "react-router-dom";
import { LifeBuoy, Phone, X } from "lucide-react";
import {
  crisisLines,
  EMERGENCY_SERVICES_NUMBER,
} from "../constants/crisisSupport";

export default function CrisisHelpButton() {
  const [open, setOpen] = useState(false);
  const primaryHelpline = crisisLines[1];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="mb-3 w-80 overflow-hidden rounded-2xl border border-crisis/20 bg-crisis-light shadow-xl">
          <div className="flex items-start justify-between gap-3 p-4">
            <div>
              <p className="font-heading text-sm font-semibold text-crisis">
                Need urgent help?
              </p>
              <p className="mt-1 font-body text-xs text-on-surface-muted">
                If you are in immediate danger, call emergency services. For
                emotional crisis support, use a helpline below.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-on-surface-subtle transition-colors hover:bg-crisis/10 hover:text-crisis focus:outline-none focus:ring-2 focus:ring-crisis focus:ring-offset-2"
              aria-label="Close crisis support panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 border-t border-crisis/15 px-4 py-3">
            <a
              href={`tel:${EMERGENCY_SERVICES_NUMBER}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-crisis py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-crisis focus:ring-offset-2"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call {EMERGENCY_SERVICES_NUMBER} (Emergency)
            </a>

            <a
              href={`tel:${primaryHelpline.tel}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-crisis/30 bg-surface py-2.5 font-heading text-sm font-semibold text-crisis transition-all duration-200 hover:bg-crisis/5 focus:outline-none focus:ring-2 focus:ring-crisis focus:ring-offset-2"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call {primaryHelpline.number}
            </a>

            <ul className="space-y-2 font-body text-xs text-on-surface-muted">
              {crisisLines.map((line) => (
                <li key={line.name}>
                  <span className="font-semibold text-on-surface">{line.name}</span>
                  {" — "}
                  <a
                    href={`tel:${line.tel}`}
                    className="font-medium text-crisis underline-offset-2 hover:underline"
                  >
                    {line.number}
                  </a>
                  {line.detail ? ` (${line.detail})` : null}
                </li>
              ))}
            </ul>

            <Link
              to="/emergency-info"
              onClick={() => setOpen(false)}
              className="block text-center font-heading text-xs font-semibold text-crisis underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-crisis focus:ring-offset-2"
            >
              View full emergency info
            </Link>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close crisis support" : "Open crisis support"}
        className="flex items-center gap-2 rounded-full border border-crisis/20 bg-crisis-light px-4 py-3 font-heading text-sm font-semibold text-crisis shadow-lg transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-crisis focus:ring-offset-2"
      >
        <LifeBuoy className="h-5 w-5" aria-hidden="true" />
        <span className="hidden sm:inline">Crisis Support</span>
      </button>
    </div>
  );
}
