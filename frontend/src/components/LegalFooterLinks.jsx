import { Link } from "react-router-dom";

export default function LegalFooterLinks({
  className = "font-body text-xs font-medium text-on-surface-muted transition-colors hover:text-primary",
  gapClassName = "flex gap-6",
}) {
  return (
    <div className={gapClassName}>
      <Link to="/privacy-policy" className={className}>
        Privacy Policy
      </Link>
      <Link to="/contact-support" className={className}>
        Contact Support
      </Link>
      <Link to="/terms-of-service" className={className}>
        Terms of Service
      </Link>
    </div>
  );
}
