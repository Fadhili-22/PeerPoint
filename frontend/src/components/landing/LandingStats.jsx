import { useEffect, useState } from "react";
import { BadgeCheck, HeartHandshake, Users } from "lucide-react";
import {
  formatPublicStatDisplay,
  getPublicStats,
  mapPublicStats,
} from "../../api/public";

const staticStat = {
  icon: BadgeCheck,
  value: "Strathmore University",
  label: "Mental Health Club Endorsed",
  iconClass: "text-strathmore-blue bg-surface-muted",
  isText: true,
};

export default function LandingStats() {
  const [display, setDisplay] = useState({ counsellors: "0", studentsSupported: "0" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setLoading(true);
      setError(null);
      try {
        const api = await getPublicStats();
        if (cancelled) return;
        const mapped = mapPublicStats(api);
        setDisplay(formatPublicStatDisplay(mapped));
      } catch (err) {
        if (!cancelled) {
          setError(err.message ?? "Could not load platform stats.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    {
      icon: Users,
      value: loading ? "…" : display.counsellors,
      label: "Peer Counsellors",
      iconClass: "text-primary bg-soft-teal",
    },
    {
      icon: HeartHandshake,
      value: loading ? "…" : display.studentsSupported,
      label: "Students Supported",
      iconClass: "text-primary bg-soft-teal",
    },
    staticStat,
  ];

  return (
    <section className="mx-auto -mt-12 mb-24 w-full max-w-[1200px] px-5 md:px-10">
      {error ? (
        <p
          role="alert"
          className="mb-4 text-center font-body text-sm text-on-surface-muted"
        >
          {error}
        </p>
      ) : null}
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
