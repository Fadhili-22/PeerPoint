import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "PeerPoint changed how I view seeking help. I was nervous at first, but my counsellor was just another student who truly understood the pressure of exams and social life here at Strathmore. It felt like talking to a wise friend.",
    program: "Bachelor of Commerce, Year 2",
  },
  {
    quote:
      "The anonymity was the most important part for me. Being able to reach out without fear of judgment allowed me to address my anxiety early before it affected my grades. A truly essential service for every student.",
    program: "Faculty of IT, Year 4",
  },
];

function StarRating() {
  return (
    <div className="flex text-warning" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className="h-5 w-5 fill-warning" aria-hidden="true" />
      ))}
    </div>
  );
}

export default function LandingTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToPrevious = () => {
    setActiveIndex(
      (index) => (index - 1 + testimonials.length) % testimonials.length,
    );
  };

  const goToNext = () => {
    setActiveIndex((index) => (index + 1) % testimonials.length);
  };

  const visibleTestimonials = [
    testimonials[activeIndex],
    testimonials[(activeIndex + 1) % testimonials.length],
  ];

  return (
    <section className="bg-background py-24">
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-10">
        <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
          <div className="space-y-4">
            <h2 className="font-heading text-3xl font-semibold text-on-surface">
              Voices from Campus
            </h2>
            <p className="font-body text-base text-on-surface-muted">
              Real feedback from students who found support through PeerPoint.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goToPrevious}
              aria-label="Previous testimonial"
              className="rounded-full border border-primary/20 p-4 text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-soft-teal focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next testimonial"
              className="rounded-full bg-primary p-4 text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {visibleTestimonials.map((testimonial, index) => (
            <blockquote
              key={`${testimonial.program}-${index}`}
              className="relative rounded-[40px] border border-soft-teal bg-surface p-12 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <Quote
                className="absolute left-8 top-8 h-16 w-16 text-soft-teal"
                aria-hidden="true"
              />
              <div className="relative z-10 space-y-6">
                <StarRating />
                <p className="font-body text-lg italic leading-relaxed text-on-surface">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <footer>
                  <p className="font-heading text-2xl font-semibold text-on-surface">
                    — Anonymous Student
                  </p>
                  <p className="text-sm font-semibold text-on-surface-muted">
                    {testimonial.program}
                  </p>
                </footer>
              </div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
