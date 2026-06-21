export default function ComingSoonButton({
  children,
  className = "",
  showBadge = false,
  ...props
}) {
  return (
    <button
      type="button"
      disabled
      title="Coming soon"
      aria-disabled="true"
      className={`cursor-not-allowed opacity-60 ${className}`}
      {...props}
    >
      {children}
      {showBadge ? (
        <span className="ml-1.5 rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
          Soon
        </span>
      ) : null}
    </button>
  );
}
