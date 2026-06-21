import { Link } from "react-router-dom";

export default function LandingCTA() {
  return (
    <section className="px-5 py-20">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[48px] bg-primary p-12 text-center text-on-primary md:p-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          aria-hidden="true"
        >
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl space-y-8">
          <h2 className="font-heading text-3xl font-bold md:text-5xl">
            Ready to talk? We&apos;re ready to listen.
          </h2>
          <p className="font-body text-lg opacity-90">
            Our peer counsellors are available around the clock to support your
            mental well-being journey.
          </p>
          <Link
            to="/signup"
            className="inline-block rounded-2xl bg-surface px-12 py-5 font-heading text-base font-semibold text-primary shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
          >
            Start Your First Session
          </Link>
        </div>
      </div>
    </section>
  );
}
