import StaticContentPage from "../components/landing/StaticContentPage";

export default function TermsOfService() {
  return (
    <StaticContentPage title="Terms of Service">
      {/* Placeholder copy pending real legal review. */}
      <p className="font-body text-base leading-relaxed text-on-surface-muted">
        By using PeerPoint, you agree to use the platform respectfully and only
        for its intended purpose: connecting Strathmore students with trained
        peer counsellors for supportive conversations.
      </p>
      <p className="font-body text-base leading-relaxed text-on-surface-muted">
        PeerPoint provides peer support and is not a replacement for
        professional mental health treatment, emergency services, or clinical
        care. If you are in crisis or need urgent help, please use the
        emergency resources linked on this site or contact local emergency
        services.
      </p>
      <p className="font-body text-base leading-relaxed text-on-surface-muted">
        You are responsible for keeping your account credentials secure and for
        the accuracy of the information you provide. Misuse of the platform,
        harassment, or attempts to harm other users may result in account
        restrictions.
      </p>
      <p className="font-body text-base leading-relaxed text-on-surface-muted">
        These terms of service are placeholder text and will be finalized before
        PeerPoint&apos;s full institutional launch.
      </p>
    </StaticContentPage>
  );
}
