import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, Repeat } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PORTAL_LABELS = {
  student: "Student Portal",
  counsellor: "Peer Counsellor Portal",
  admin: "Admin Portal",
};

/**
 * Lets multi-portal users hop between the UI shells they have access to.
 * Switching only updates the client-side activePortal + navigates — it never
 * changes what the API authorizes (that stays on the full roles[] array).
 *
 * `currentPortal` is the shell currently rendered, so it is excluded from the
 * target list. Hidden entirely when the user has no other portal.
 */
export default function PortalSwitcher({
  currentPortal,
  onNavigate,
  variant = "inline",
  menuDirection = "down",
}) {
  const { availablePortals, switchPortal } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const targets = availablePortals.filter((portal) => portal !== currentPortal);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (targets.length === 0) {
    return null;
  }

  const goTo = (portal) => {
    setOpen(false);
    onNavigate?.();
    navigate(switchPortal(portal));
  };

  const isBlock = variant === "block";

  const triggerClass = isBlock
    ? "flex w-full items-center gap-3 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-sm font-medium text-primary-dark transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/10"
    : "inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 font-heading text-sm font-semibold text-primary-dark transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/10";

  // Single alternate portal → a direct button, no menu needed.
  if (targets.length === 1) {
    const portal = targets[0];
    return (
      <button
        type="button"
        onClick={() => goTo(portal)}
        className={triggerClass}
      >
        {isBlock ? (
          <Repeat className="h-4 w-4" aria-hidden="true" />
        ) : null}
        <span className={isBlock ? "flex-1 text-left" : undefined}>
          {PORTAL_LABELS[portal]}
        </span>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  // Multiple alternate portals → dropdown menu.
  return (
    <div ref={containerRef} className={`relative ${isBlock ? "w-full" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={triggerClass}
      >
        {isBlock ? <Repeat className="h-4 w-4" aria-hidden="true" /> : null}
        <span className={isBlock ? "flex-1 text-left" : undefined}>
          Switch portal
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          role="menu"
          className={`absolute z-40 w-56 overflow-hidden rounded-xl border border-outline-muted/20 bg-surface p-1 shadow-[0_12px_40px_0_rgba(0,100,112,0.12)] ${
            menuDirection === "up" ? "bottom-full mb-2" : "top-full mt-2"
          } ${isBlock ? "left-0" : "right-0"}`}
        >
          {targets.map((portal) => (
            <button
              key={portal}
              type="button"
              role="menuitem"
              onClick={() => goTo(portal)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-heading text-sm font-semibold text-on-surface-muted transition-colors duration-150 hover:bg-primary/5 hover:text-primary-dark"
            >
              <span className="flex-1">{PORTAL_LABELS[portal]}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
