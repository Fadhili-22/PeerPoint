import StaticContentPage from "../components/landing/StaticContentPage";

export default function ContactSupport() {
  return (
    <StaticContentPage title="Contact Support">
      <p className="font-body text-base leading-relaxed text-on-surface-muted">
        For questions about PeerPoint, session requests, or peer counselling on
        campus, please reach out to the Strathmore University Mental Health
        Club. They coordinate peer support initiatives and can guide you to the
        right help.
      </p>
      <p className="font-body text-base leading-relaxed text-on-surface-muted">
        {/* TODO: replace with the official Mental Health Club email. */}
        Email:{" "}
        <span className="font-medium text-on-surface">
          TODO_MHC_EMAIL@strathmore.edu
        </span>
      </p>
      <p className="font-body text-base leading-relaxed text-on-surface-muted">
        {/* TODO: replace with the official Mental Health Club phone number. */}
        Phone:{" "}
        <span className="font-medium text-on-surface">TODO_MHC_PHONE</span>
      </p>
    </StaticContentPage>
  );
}
