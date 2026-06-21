import { TrendingUp } from "lucide-react";

export default function AdminKpiCard({
  icon: Icon,
  label,
  value,
  trend,
  trendDown = false,
  sublabel,
  urgent = false,
  iconBg = "bg-primary/10",
  iconColor = "text-primary",
}) {
  return (
    <article
      className={`rounded-3xl bg-surface p-5 shadow-md transition-transform duration-300 hover:scale-[1.02] hover:-translate-y-0.5 ${
        urgent ? "border-2 border-accent-gold/25" : "border border-primary/5"
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className={`rounded-xl p-2.5 ${iconBg} ${iconColor}`}>
          {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : null}
        </div>
        {urgent ? (
          <span className="rounded-full bg-accent-gold px-2 py-0.5 font-heading text-[10px] font-bold text-on-primary">
            URGENT
          </span>
        ) : trend ? (
          <span
            className={`flex items-center font-body text-xs font-bold ${
              trendDown ? "text-on-surface-muted" : "text-success"
            }`}
          >
            {trend}
            <TrendingUp
              className={`ml-0.5 h-3.5 w-3.5 ${trendDown ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </span>
        ) : sublabel ? (
          <span className="font-body text-xs font-medium text-on-surface-muted">
            {sublabel}
          </span>
        ) : null}
      </div>
      <p className="font-body text-xs font-medium text-on-surface-muted">
        {label}
      </p>
      <h3 className="font-heading text-2xl font-semibold text-on-surface md:text-[30px] md:leading-9">
        {value}
      </h3>
      {trend && sublabel ? (
        <p className="mt-1 font-body text-[11px] text-on-surface-subtle">
          {sublabel}
        </p>
      ) : null}
    </article>
  );
}
