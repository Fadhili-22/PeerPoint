import { useState } from "react";
import { LifeBuoy, X } from "lucide-react";
import ComingSoonButton from "./ComingSoonButton";

export default function CrisisHelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="mb-3 w-72 overflow-hidden rounded-2xl border border-crisis/20 bg-crisis-light shadow-xl">
          <div className="flex items-start justify-between gap-3 p-4">
            <div>
              <p className="font-heading text-sm font-semibold text-crisis">
                Need urgent help?
              </p>
              <p className="mt-1 font-body text-xs text-on-surface-muted">
                Crisis support is available 24/7. You are not alone.
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
          <div className="border-t border-crisis/15 px-4 py-3">
            <ComingSoonButton className="w-full rounded-xl bg-crisis py-2.5 font-heading text-sm font-semibold text-on-primary">
              Contact Crisis Team
            </ComingSoonButton>
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
