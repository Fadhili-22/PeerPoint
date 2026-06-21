export default function ComingSoonText({ children, className = "", ...props }) {
  return (
    <span
      title="Coming soon"
      aria-disabled="true"
      className={`cursor-not-allowed opacity-60 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
