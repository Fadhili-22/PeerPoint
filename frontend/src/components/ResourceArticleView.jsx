import { CalendarDays, Clock, User } from "lucide-react";
import { formatResourceDisplayDate } from "../data/mockResources";

function getAuthorInitials(author) {
  if (!author) return "PP";
  return author
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ResourceArticleView({ resource }) {
  const authorInitials = getAuthorInitials(resource.author);
  const publishedLabel = formatResourceDisplayDate(resource.publishedAt);

  return (
    <article className="overflow-hidden rounded-3xl border border-outline-muted/20 bg-surface shadow-sm">
      <img
        src={resource.image}
        alt={resource.imageAlt}
        className="h-56 w-full object-cover sm:h-80"
      />
      <div className="p-6 sm:p-8 md:p-10">
        <header className="mb-8 border-b border-outline-muted/20 pb-8">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-soft-teal px-3 py-1 font-heading text-sm font-semibold text-primary">
              {resource.category}
            </span>
            <span className="inline-flex items-center gap-1.5 font-body text-sm text-on-surface-subtle">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {resource.readTime}
            </span>
          </div>

          <h1 className="mb-6 font-heading text-3xl font-bold leading-tight text-on-surface md:text-[40px] md:leading-[1.15]">
            {resource.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary">
                {authorInitials}
              </div>
              <div className="min-w-0">
                <p className="inline-flex items-center gap-1.5 font-heading text-sm font-semibold text-on-surface">
                  <User className="h-3.5 w-3.5 text-on-surface-subtle" aria-hidden="true" />
                  {resource.author || "PeerPoint Team"}
                </p>
                {resource.authorRole ? (
                  <p className="truncate font-body text-xs text-on-surface-subtle">
                    {resource.authorRole}
                  </p>
                ) : null}
              </div>
            </div>

            {publishedLabel ? (
              <span className="inline-flex items-center gap-1.5 font-body text-sm text-on-surface-subtle">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Published {publishedLabel}
              </span>
            ) : null}
          </div>
        </header>

        <p className="mb-8 font-body text-lg leading-relaxed text-on-surface-muted">
          {resource.description}
        </p>

        <div className="space-y-5">
          {resource.body.map((paragraph, index) => (
            <p
              key={`${resource.id}-paragraph-${index}`}
              className="font-body text-base leading-relaxed text-on-surface-muted"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
