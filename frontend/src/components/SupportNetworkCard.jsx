import { Link } from "react-router-dom";
import { Brain, Users } from "lucide-react";
import ComingSoonButton from "./ComingSoonButton";

const iconMap = {
  psychology: Brain,
  groups: Users,
};

export default function SupportNetworkCard({ option }) {
  const Icon = iconMap[option.icon] || Brain;

  return (
    <article className="group flex flex-col items-center rounded-3xl border border-outline-muted/20 bg-surface p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-soft-teal text-primary transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-8 w-8" aria-hidden="true" />
      </div>
      <h5 className="mb-2 font-heading text-xl font-semibold text-on-surface">
        {option.title}
      </h5>
      <p className="mb-6 font-body text-base text-on-surface-muted">
        {option.description}
      </p>
      {option.id === "su-counsellors" ? (
        <Link
          to="/student/directory"
          className="mt-auto flex w-full items-center justify-center rounded-2xl bg-soft-teal py-3 font-heading text-sm font-bold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/10"
        >
          {option.actionLabel}
        </Link>
      ) : (
        <ComingSoonButton className="mt-auto w-full rounded-2xl bg-soft-teal py-3 font-heading text-sm font-bold text-primary">
          {option.actionLabel}
        </ComingSoonButton>
      )}
    </article>
  );
}
