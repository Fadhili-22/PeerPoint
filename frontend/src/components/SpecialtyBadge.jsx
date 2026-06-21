import {
  Brain,
  Briefcase,
  Clock,
  Frown,
  GraduationCap,
  Heart,
  MessageCircle,
  Scale,
  Sparkles,
  UserX,
} from "lucide-react";

const iconMap = {
  "graduation-cap": GraduationCap,
  frown: Frown,
  briefcase: Briefcase,
  "user-x": UserX,
  scale: Scale,
  heart: Heart,
  sparkles: Sparkles,
  brain: Brain,
  clock: Clock,
  "message-circle": MessageCircle,
};

export default function SpecialtyBadge({ label, icon }) {
  const Icon = iconMap[icon] || Brain;

  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-primary/15 bg-soft-teal/80 px-3.5 py-2 font-heading text-xs font-semibold text-primary-dark transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-soft-teal">
      <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
      {label}
    </span>
  );
}
