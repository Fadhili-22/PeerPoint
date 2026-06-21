import { BadgeCheck, HeartHandshake, Users } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "120+",
    label: "Peer Counsellors",
    iconClass: "text-primary bg-soft-teal",
  },
  {
    icon: HeartHandshake,
    value: "500+",
    label: "Students Supported",
    iconClass: "text-primary bg-soft-teal",
  },
  {
    icon: BadgeCheck,
    value: "Strathmore University",
    label: "Mental Health Club Endorsed",
    iconClass: "text-strathmore-blue bg-surface-muted",
    isText: true,
  },
];

export default function LandingStats() {
  return (
    <section className="mx-auto -mt-12 mb-24 w-full max-w-[1200px] px-5 md:px-10">
      <div className="flex flex-col items-center justify-around gap-8 rounded-[24px] border border-outline-muted/50 bg-surface p-8 shadow-[0_4px_30px_0_rgba(0,0,0,0.05)] md:flex-row md:p-12">
        {stats.map((stat, index) => (
          <div key={stat.label} className="contents">
            {index > 0 && (
              <div
                className="hidden h-16 w-px bg-outline-muted/20 md:block"
                aria-hidden="true"
              />
            )}
            <div className="flex flex-col items-center gap-2 text-center">
              <div
                className={`mb-2 rounded-full p-3 ${stat.iconClass}`}
                aria-hidden="true"
              >
                <stat.icon className="h-8 w-8" />
              </div>
              {stat.isText ? (
                <span className="font-heading text-2xl font-semibold text-on-surface">
                  {stat.value}
                </span>
              ) : (
                <span className="font-heading text-[32px] font-bold text-on-surface">
                  {stat.value}
                </span>
              )}
              <span className="text-sm font-semibold uppercase tracking-wider text-on-surface-muted">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
