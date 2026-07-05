import { Link } from "react-router-dom";
import LandingCounsellorCarousel from "./LandingCounsellorCarousel";

export default function LandingHero() {
  return (
    <section
      className="relative overflow-hidden bg-background pb-24 pt-16 md:pb-32 md:pt-24"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 50%, rgba(0, 100, 112, 0.06) 0%, transparent 70%)",
      }}
    >
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-12 px-5 md:grid-cols-2 md:px-10">
        <div className="space-y-6 text-left">
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-on-surface md:text-[56px]">
            You don&apos;t have to <br />
            <span className="italic text-primary">figure it out alone.</span>
          </h1>
          <p className="max-w-lg font-body text-lg leading-7 text-on-surface-muted">
            Connect with trained peer counsellors at Strathmore University.
            Anonymous, free, and always available to listen.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/signup"
              className="rounded-xl bg-primary px-8 py-4 font-heading text-base font-semibold text-on-primary shadow-lg transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary-dark"
            >
              Find a Counsellor
            </Link>
            <Link
              to="/student/resources"
              className="rounded-xl border-2 border-primary px-8 py-4 font-heading text-base font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-soft-teal"
            >
              Browse Resources
            </Link>
          </div>
        </div>

        <div className="relative w-full max-w-md justify-self-center md:justify-self-end">
          <div
            className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-soft-teal blur-3xl"
            aria-hidden="true"
          />
          <LandingCounsellorCarousel />
        </div>
      </div>
    </section>
  );
}
