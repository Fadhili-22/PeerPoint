const steps = [
  {
    number: "1",
    title: "Browse Anonymously",
    description:
      "Search through our directory of trained peer supporters. Filter by expertise or availability without revealing your identity.",
  },
  {
    number: "2",
    title: "Send a Request",
    description:
      'Found someone you connect with? Simply click "Request Session" and choose a time that works best for your schedule.',
  },
  {
    number: "3",
    title: "Connect & Support",
    description:
      "Meet online or on campus in a safe environment. Discuss your challenges and work together towards better mental well-being.",
  },
];

export default function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface-muted py-24">
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-10">
        <div className="mb-16 space-y-4 text-center">
          <h2 className="font-heading text-3xl font-semibold text-on-surface">
            How PeerPoint works
          </h2>
          <div
            className="mx-auto h-1.5 w-24 rounded-full bg-primary"
            aria-hidden="true"
          />
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="group rounded-[32px] border border-transparent bg-surface p-10 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-soft-teal hover:shadow-xl"
            >
              <div
                className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-heading text-2xl font-semibold text-on-primary transition-transform duration-300 group-hover:scale-110"
                aria-hidden="true"
              >
                {step.number}
              </div>
              <h3 className="mb-4 font-heading text-2xl font-semibold text-on-surface">
                {step.title}
              </h3>
              <p className="font-body text-base leading-relaxed text-on-surface-muted">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
