export default function AvailabilityCard({ day, selected, onSelect }) {
  const hasSlots = day.slots > 0;

  return (
    <button
      type="button"
      onClick={() => hasSlots && onSelect(day.day)}
      disabled={!hasSlots}
      className={`group flex flex-1 flex-col items-center rounded-2xl border px-2 py-3 transition-all duration-200 ${
        selected
          ? "border-primary bg-primary/10 shadow-sm"
          : hasSlots
            ? "border-primary/20 bg-soft-teal/60 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm"
            : "cursor-not-allowed border-outline-muted/20 bg-surface-muted/30 opacity-60"
      }`}
    >
      <span className="font-heading text-[10px] font-bold uppercase tracking-wide text-on-surface-subtle">
        {day.day}
      </span>
      <span
        className={`my-1 font-heading text-lg font-extrabold ${
          hasSlots ? "text-primary-dark" : "text-on-surface-subtle"
        }`}
      >
        {day.date}
      </span>
      <div className="flex h-5 items-end justify-center gap-0.5">
        {hasSlots ? (
          Array.from({ length: Math.min(day.slots, 4) }).map((_, index) => (
            <span
              key={index}
              className={`w-1.5 rounded-full bg-primary transition-all duration-200 ${
                selected ? "h-4" : "h-3 group-hover:h-4"
              }`}
              style={{ height: `${8 + index * 3}px` }}
              aria-hidden="true"
            />
          ))
        ) : (
          <span className="font-body text-[10px] text-on-surface-subtle">—</span>
        )}
      </div>
    </button>
  );
}
