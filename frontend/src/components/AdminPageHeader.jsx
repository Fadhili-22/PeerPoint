import { useEffect, useRef, useState } from "react";
import { Bell, Search } from "lucide-react";
import { platformActivity } from "../data/mockAdminDashboard";

export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  actions,
  stats,
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);

  useEffect(() => {
    if (!notificationsOpen) return undefined;

    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsOpen]);

  return (
    <>
      <section
        aria-label="Search and notifications"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="relative flex-1 sm:max-w-md">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-2xl border border-primary/5 bg-surface py-2.5 pl-10 pr-4 font-body text-base text-on-surface shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-light"
            aria-label={searchPlaceholder}
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {actions}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen((value) => !value)}
              aria-label="View notifications"
              aria-expanded={notificationsOpen}
              className="rounded-full border border-primary/5 bg-surface p-2.5 text-on-surface-muted shadow-sm transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
            </button>
            {notificationsOpen ? (
              <div
                role="menu"
                aria-label="Notifications"
                className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-primary/10 bg-surface shadow-xl"
              >
                <div className="border-b border-outline-muted/10 px-4 py-3">
                  <p className="font-heading text-sm font-semibold text-on-surface">
                    Notifications
                  </p>
                </div>
                <ul className="max-h-72 divide-y divide-outline-muted/10 overflow-y-auto">
                  {platformActivity.slice(0, 3).map((item) => (
                    <li key={item.id} className="px-4 py-3">
                      <p className="font-heading text-sm font-semibold text-on-surface">
                        {item.title}
                      </p>
                      <p className="mt-0.5 font-body text-xs text-on-surface-muted">
                        {item.description}
                      </p>
                      <span className="mt-1 block font-heading text-[10px] font-bold uppercase text-outline">
                        {item.time}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-primary/5 bg-surface p-6 shadow-md md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex-1">
            {eyebrow ? (
              <p className="mb-1 font-body text-sm font-medium text-on-surface-muted">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="font-heading text-2xl font-semibold text-on-surface md:text-[32px] md:leading-10">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 max-w-xl font-body text-base text-on-surface-muted">
                {description}
              </p>
            ) : null}
          </div>
          {stats && stats.length > 0 ? (
            <div className="flex flex-wrap gap-3 xl:justify-end">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <article
                    key={stat.label}
                    className="flex min-w-[108px] flex-col items-center rounded-2xl border border-primary/5 bg-surface-muted/60 px-4 py-3 text-center shadow-sm transition-transform duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
                  >
                    {Icon ? (
                      <Icon
                        className="mb-1 h-4 w-4 text-primary"
                        aria-hidden="true"
                      />
                    ) : null}
                    <p className="font-heading text-2xl font-bold leading-none text-on-surface md:text-[28px]">
                      {stat.value}
                    </p>
                    <p className="mt-1 font-body text-[11px] font-medium uppercase tracking-wide text-on-surface-muted">
                      {stat.label}
                    </p>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
