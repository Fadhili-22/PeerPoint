import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function FeaturedResourceCard({ resource }) {
  return (
    <article className="group relative flex min-h-[400px] flex-col overflow-hidden rounded-[32px] bg-surface shadow-md transition-transform duration-300 hover:scale-[1.01] md:flex-row">
      <div className="h-64 w-full overflow-hidden md:h-auto md:w-1/2">
        <img
          src={resource.image}
          alt={resource.imageAlt}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="flex w-full flex-col justify-center p-8 md:w-1/2 md:p-12">
        <span className="mb-6 inline-flex w-fit items-center rounded-full bg-accent-gold/10 px-3 py-1 font-heading text-sm font-semibold text-accent-gold">
          Featured Insight
        </span>
        <h3 className="mb-4 font-heading text-2xl font-semibold text-on-surface md:text-[32px] md:leading-10">
          {resource.title}
        </h3>
        <p className="mb-8 font-body text-base leading-relaxed text-on-surface-muted">
          {resource.description}
        </p>
        <Link
          to={`/student/resources/${resource.id}`}
          className="inline-flex items-center gap-2 font-heading text-sm font-bold text-primary transition-all duration-200 hover:gap-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Read the full guide
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
