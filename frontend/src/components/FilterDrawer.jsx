import { X } from "lucide-react";
import { counsellorLanguages, sessionTopics, studyYears } from "../constants/counsellorFilters";

export default function FilterDrawer({
  open,
  onClose,
  availability,
  onAvailabilityChange,
  selectedSpecialties,
  onToggleSpecialty,
  selectedLanguage,
  onLanguageChange,
  selectedYear,
  onYearChange,
  onApply,
  onClear,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
        aria-label="Close filters"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-drawer-title"
        className="relative flex h-full w-full max-w-md flex-col bg-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-outline-muted/20 px-6 py-5">
          <h2
            id="filter-drawer-title"
            className="font-heading text-lg font-bold text-on-surface"
          >
            Advanced Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-on-surface-subtle transition-colors hover:bg-surface-muted hover:text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Close filter panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
          <section>
            <h3 className="mb-3 font-heading text-xs font-bold uppercase tracking-wide text-on-surface-subtle">
              Availability
            </h3>
            <div className="space-y-2">
              {[
                { value: "all", label: "All counsellors" },
                { value: "available", label: "Available now" },
                { value: "today", label: "Available today" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-muted/60 ${
                    availability === option.value ? "bg-soft-teal/80" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="drawer-availability"
                    checked={availability === option.value}
                    onChange={() => onAvailabilityChange(option.value)}
                    className="h-4 w-4 border-outline-muted text-primary focus:ring-primary"
                  />
                  <span className="font-body text-sm text-on-surface">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 font-heading text-xs font-bold uppercase tracking-wide text-on-surface-subtle">
              Year of study
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onYearChange("all")}
                className={`rounded-full px-4 py-2 font-heading text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 ${
                  selectedYear === "all"
                    ? "bg-primary text-on-primary"
                    : "border border-outline-muted/40 bg-surface text-on-surface-muted"
                }`}
              >
                Any year
              </button>
              {studyYears.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => onYearChange(year)}
                  className={`rounded-full px-4 py-2 font-heading text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 ${
                    selectedYear === year
                      ? "bg-primary text-on-primary"
                      : "border border-outline-muted/40 bg-surface text-on-surface-muted"
                  }`}
                >
                  Year {year}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 font-heading text-xs font-bold uppercase tracking-wide text-on-surface-subtle">
              Language
            </h3>
            <select
              value={selectedLanguage}
              onChange={(event) => onLanguageChange(event.target.value)}
              className="w-full rounded-xl border border-outline-muted/30 bg-surface-muted/40 px-4 py-3 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Filter by language"
            >
              <option value="all">Any language</option>
              {counsellorLanguages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </section>

          <section>
            <h3 className="mb-3 font-heading text-xs font-bold uppercase tracking-wide text-on-surface-subtle">
              Specialties
            </h3>
            <div className="space-y-1">
              {sessionTopics.filter((topic) => topic !== "Other").map((topic) => (
                <label
                  key={topic}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-surface-muted/60"
                >
                  <input
                    type="checkbox"
                    checked={selectedSpecialties.includes(topic)}
                    onChange={() => onToggleSpecialty(topic)}
                    className="h-4 w-4 rounded border-outline-muted text-primary focus:ring-primary"
                  />
                  <span className="font-body text-sm text-on-surface">{topic}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="flex gap-3 border-t border-outline-muted/20 px-6 py-5">
          <button
            type="button"
            onClick={onClear}
            className="flex-1 rounded-xl border border-outline-muted/40 bg-surface px-4 py-3 font-heading text-sm font-semibold text-on-surface-muted transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onApply}
            className="flex-1 rounded-xl bg-primary px-4 py-3 font-heading text-sm font-semibold text-on-primary shadow-sm transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Show results
          </button>
        </div>
      </aside>
    </div>
  );
}
