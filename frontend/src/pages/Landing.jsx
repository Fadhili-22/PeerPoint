import LandingCTA from "../components/landing/LandingCTA";
import LandingFooter from "../components/landing/LandingFooter";
import LandingHero from "../components/landing/LandingHero";
import LandingHowItWorks from "../components/landing/LandingHowItWorks";
import LandingStats from "../components/landing/LandingStats";
import LandingTestimonials from "../components/landing/LandingTestimonials";

export default function Landing() {
  return (
    <>
      <LandingHero />
      <LandingStats />
      <LandingHowItWorks />
      <LandingTestimonials />
      <LandingCTA />
      <LandingFooter />
    </>
  );
}
