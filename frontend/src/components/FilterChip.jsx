import { X } from "lucide-react";

export default function FilterChip({
  label,
  active = false,
  onClick,
  onRemove,
  removable = false,
}) {
  if (removable) {
    return (
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-2 font-heading text-xs font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        {label}
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`whitespace-nowrap rounded-full px-4 py-2 font-heading text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        active
          ? "bg-primary text-on-primary shadow-sm"
          : "border border-outline-muted/40 bg-surface text-on-surface-muted hover:border-primary hover:bg-soft-teal"
      }`}
    >
      {label}
    </button>
  );
}
