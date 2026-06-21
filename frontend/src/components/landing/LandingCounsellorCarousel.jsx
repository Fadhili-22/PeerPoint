import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { counsellors } from "../../data/mockCounsellors";

const AUTO_ADVANCE_MS = 6000;

function CounsellorAvatar({ counsellor }) {
  if (counsellor.photoUrl) {
    return (
      <img
        src={counsellor.photoUrl}
        alt={`${counsellor.shortName}, peer counsellor`}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <span className="font-heading text-2xl font-semibold text-primary">
      {counsellor.initials}
    </span>
  );
}

function CounsellorSlide({ counsellor, isActive, prefersReducedMotion }) {
  const motionClass = prefersReducedMotion
    ? isActive
      ? "opacity-100"
      : "opacity-0"
    : isActive
      ? "translate-y-0 opacity-100"
      : "translate-y-2 opacity-0";

  return (
    <article
      className={`absolute inset-0 rounded-[32px] border border-soft-teal bg-surface p-8 shadow-[0_20px_50px_rgba(0,100,112,0.08)] transition-all duration-500 ease-in-out ${
        isActive
          ? "pointer-events-auto z-10 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,100,112,0.12)]"
          : "pointer-events-none z-0"
      } ${motionClass}`}
      aria-hidden={!isActive}
    >
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-soft-teal">
          <CounsellorAvatar counsellor={counsellor} />
        </div>
        <div>
          <h3 className="font-heading text-2xl font-semibold text-on-surface">
            {counsellor.shortName}
          </h3>
          <div className="flex items-center gap-1.5 text-primary">
            <span
              className="h-2 w-2 animate-pulse rounded-full bg-primary"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold">
              {counsellor.availabilityNote}
            </span>
          </div>
        </div>
      </div>
      <div className="mb-8 space-y-4">
        <div className="flex min-h-[32px] flex-wrap gap-2">
          {counsellor.specialties.slice(0, 2).map((specialty) => (
            <span
              key={specialty}
              className="rounded-full bg-soft-teal px-3 py-1 text-xs font-semibold text-primary"
            >
              {specialty}
            </span>
          ))}
        </div>
        <p className="line-clamp-4 min-h-[6.5rem] font-body text-base italic leading-relaxed text-on-surface-muted">
          &ldquo;{counsellor.bio}&rdquo;
        </p>
      </div>
      <Link
        to="/signup"
        className="block w-full rounded-xl bg-primary py-4 text-center text-sm font-semibold text-on-primary transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary-dark"
        tabIndex={isActive ? 0 : -1}
      >
        Request Session
      </Link>
    </article>
  );
}

function EmptyCounsellorCard() {
  return (
    <article className="rounded-[32px] border border-soft-teal bg-surface p-8 shadow-[0_20px_50px_rgba(0,100,112,0.08)]">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-soft-teal font-heading text-2xl font-semibold text-primary">
          PP
        </div>
        <h3 className="font-heading text-xl font-semibold text-on-surface">
          Counsellors checking in soon
        </h3>
        <p className="font-body text-base leading-relaxed text-on-surface-muted">
          No peer counsellors are marked available right now. Browse resources or
          sign up to get notified when someone is free.
        </p>
        <Link
          to="/signup"
          className="block w-full rounded-xl bg-primary py-4 text-center text-sm font-semibold text-on-primary transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          Get Started
        </Link>
      </div>
    </article>
  );
}

export default function LandingCounsellorCarousel() {
  const activeCounsellors = useMemo(
    () => counsellors.filter((c) => c.availabilityStatus === "available"),
    [],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const carouselRef = useRef(null);

  const slideCount = activeCounsellors.length;
  const hasMultipleSlides = slideCount > 1;

  const goToSlide = useCallback(
    (index) => {
      if (slideCount === 0) return;
      setActiveIndex(((index % slideCount) + slideCount) % slideCount);
    },
    [slideCount],
  );

  const goToPrevious = useCallback(() => {
    goToSlide(activeIndex - 1);
  }, [activeIndex, goToSlide]);

  const goToNext = useCallback(() => {
    goToSlide(activeIndex + 1);
  }, [activeIndex, goToSlide]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (!hasMultipleSlides || isPaused || prefersReducedMotion) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slideCount);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [hasMultipleSlides, isPaused, prefersReducedMotion, slideCount]);

  useEffect(() => {
    if (activeIndex >= slideCount && slideCount > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, slideCount]);

  const handleKeyDown = (event) => {
    if (!hasMultipleSlides) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPrevious();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNext();
    }
  };

  if (slideCount === 0) {
    return <EmptyCounsellorCard />;
  }

  const currentCounsellor = activeCounsellors[activeIndex];

  return (
    <div
      ref={carouselRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured peer counsellors"
      className="group/carousel relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!carouselRef.current?.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        className="relative min-h-[420px]"
        aria-live="polite"
        aria-atomic="true"
      >
        {activeCounsellors.map((counsellor, index) => (
          <CounsellorSlide
            key={counsellor.id}
            counsellor={counsellor}
            isActive={index === activeIndex}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>

      {hasMultipleSlides && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <div
            className="flex flex-1 justify-center gap-2"
            role="tablist"
            aria-label="Choose counsellor"
          >
            {activeCounsellors.map((counsellor, index) => {
              const isSelected = index === activeIndex;
              return (
                <button
                  key={counsellor.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-label={`Show ${counsellor.shortName}`}
                  onClick={() => goToSlide(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    isSelected
                      ? "w-8 bg-primary"
                      : "w-2.5 bg-primary/25 hover:bg-primary/40"
                  }`}
                />
              );
            })}
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={goToPrevious}
              aria-label={`Previous counsellor, currently showing ${currentCounsellor.shortName}`}
              className="rounded-full border border-primary/20 p-2.5 text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-soft-teal focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label={`Next counsellor, currently showing ${currentCounsellor.shortName}`}
              className="rounded-full bg-primary p-2.5 text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <p className="sr-only">
        {hasMultipleSlides
          ? `Showing counsellor ${activeIndex + 1} of ${slideCount}: ${currentCounsellor.fullName}.`
          : `Showing ${currentCounsellor.fullName}.`}
      </p>
    </div>
  );
}
