import { Link } from "react-router-dom";
import { Clock, ExternalLink } from "lucide-react";

export default function ResourceCard({ resource }) {
  return (
    <article className="group flex flex-col rounded-3xl bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-6 overflow-hidden rounded-2xl">
        <img
          src={resource.image}
          alt={resource.imageAlt}
          className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-soft-teal px-3 py-1 font-heading text-sm font-semibold text-primary">
          {resource.category}
        </span>
      </div>
      <h4 className="mb-3 font-heading text-xl font-semibold text-on-surface">
        {resource.title}
      </h4>
      <p className="mb-4 line-clamp-2 flex-grow font-body text-base text-on-surface-muted">
        {resource.description}
      </p>
      <div className="mb-4 flex items-center gap-1.5 font-body text-sm text-on-surface-subtle">
        <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{resource.readTime}</span>
      </div>
      <Link
        to={`/student/resources/${resource.id}`}
        className="inline-flex items-center gap-1 font-heading text-sm font-semibold text-primary transition-all duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Read More
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
