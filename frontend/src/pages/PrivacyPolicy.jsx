import StaticContentPage from "../components/landing/StaticContentPage";

export default function PrivacyPolicy() {
  return (
    <StaticContentPage title="Privacy Policy">
      {/* Placeholder copy pending real legal review. */}
      <p className="font-body text-base leading-relaxed text-on-surface-muted">
        PeerPoint collects account information you provide when you register,
        including your name, Strathmore email address, admission number, and
        phone number. When you request a counselling session, we also store
        session request details such as your preferred topic, date, format, and
        any notes you choose to share.
      </p>
      <p className="font-body text-base leading-relaxed text-on-surface-muted">
        We use this information to match students with peer counsellors, manage
        session requests, and improve the platform experience. Feedback and
        ratings you may provide help us understand counsellor quality and
        strengthen peer support on campus.
      </p>
      <p className="font-body text-base leading-relaxed text-on-surface-muted">
        Your data is used solely to operate PeerPoint and is not shared outside
        Strathmore University&apos;s Mental Health Club administration and the
        platform team responsible for student well-being support.
      </p>
      <p className="font-body text-base leading-relaxed text-on-surface-muted">
        This privacy policy is placeholder text and will be finalized before
        PeerPoint&apos;s full institutional launch.
      </p>
    </StaticContentPage>
  );
}
