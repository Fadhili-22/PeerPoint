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
        Email:{" "}
        <a
          href="mailto:mentalhealthclub@strathmore.edu"
          className="font-medium text-on-surface transition-colors hover:text-primary"
        >
          mentalhealthclub@strathmore.edu
        </a>
      </p>
      <p className="font-body text-base leading-relaxed text-on-surface-muted">
        Instagram:{" "}
        <a
          href="https://www.instagram.com/su_mentalhealthclub"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-on-surface transition-colors hover:text-primary"
        >
          @su_mentalhealthclub
        </a>
      </p>
    </StaticContentPage>
  );
}
