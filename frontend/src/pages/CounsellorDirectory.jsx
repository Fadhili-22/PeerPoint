import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { listCounsellors } from "../api/counsellors";
import CounsellorCard from "../components/CounsellorCard";
import FilterChip from "../components/FilterChip";
import FilterDrawer from "../components/FilterDrawer";
import {
  counsellorLanguages,
  directoryFilterChips,
} from "../constants/counsellorFilters";

export default function CounsellorDirectory() {
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedChips, setSelectedChips] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [availability, setAvailability] = useState("all");
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  const chipAvailabilityActive = selectedChips.includes("available-now");
  const chipSpecialties = selectedChips.filter((chip) => chip !== "available-now");

  const effectiveAvailability = chipAvailabilityActive ? "available" : availability;
  const effectiveSpecialties =
    chipSpecialties.length > 0
      ? [...new Set([...chipSpecialties, ...selectedSpecialties])]
      : selectedSpecialties;

  useEffect(() => {
    let cancelled = false;

    async function loadCounsellors() {
      setLoading(true);
      setLoadError("");
      try {
        const apiAvailability =
          effectiveAvailability === "available" ? "available" : undefined;
        const data = await listCounsellors({
          search: search.trim() || undefined,
          availability: apiAvailability,
          specialties: effectiveSpecialties,
          language: selectedLanguage !== "all" ? selectedLanguage : undefined,
          year: selectedYear !== "all" ? selectedYear : undefined,
        });
        if (!cancelled) {
          setCounsellors(data);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message || "Unable to load counsellors.");
          setCounsellors([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCounsellors();
    return () => {
      cancelled = true;
    };
  }, [
    search,
    effectiveAvailability,
    effectiveSpecialties,
    selectedLanguage,
    selectedYear,
  ]);

  const filteredCounsellors = useMemo(() => {
    return counsellors.filter((counsellor) => {
      if (effectiveAvailability === "today") {
        return counsellor.availabilityStatus !== "offline";
      }
      return true;
    });
  }, [counsellors, effectiveAvailability]);

  const availableCount = counsellors.filter(
    (counsellor) => counsellor.availabilityStatus === "available",
  ).length;
  const hasActiveFilters =
    chipAvailabilityActive ||
    chipSpecialties.length > 0 ||
    availability !== "all" ||
    selectedSpecialties.length > 0 ||
    selectedLanguage !== "all" ||
    selectedYear !== "all" ||
    search.trim().length > 0;

  const toggleChip = (chipId) => {
    setSelectedChips((current) =>
      current.includes(chipId)
        ? current.filter((id) => id !== chipId)
        : [...current, chipId],
    );
  };

  const toggleDrawerSpecialty = (specialty) => {
    setSelectedSpecialties((current) =>
      current.includes(specialty)
        ? current.filter((item) => item !== specialty)
        : [...current, specialty],
    );
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedChips([]);
    setAvailability("all");
    setSelectedSpecialties([]);
    setSelectedLanguage("all");
    setSelectedYear("all");
  };

  const activeFilterLabels = [
    ...(chipAvailabilityActive || availability === "available"
      ? ["Available Now"]
      : []),
    ...(availability === "today" ? ["Available today"] : []),
    ...effectiveSpecialties.map((specialty) => specialty),
    ...(selectedLanguage !== "all" ? [selectedLanguage] : []),
    ...(selectedYear !== "all" ? [`Year ${selectedYear}`] : []),
  ];

  return (
    <div className="flex flex-col">
      <header className="mb-8">
        <h1 className="mb-2 font-heading text-[28px] font-bold leading-tight text-on-surface md:text-[36px]">
          Find a Peer Counsellor
        </h1>
        <p className="mb-6 max-w-2xl font-body text-base text-on-surface-muted">
          Connect with trained student peer supporters in a safe and confidential
          environment.
        </p>

        <div className="relative max-w-2xl">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-subtle"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, specialty, or keywords…"
            className="w-full rounded-2xl border border-outline-muted/30 bg-surface py-3.5 pl-12 pr-4 font-body text-base text-on-surface shadow-sm transition-all duration-200 placeholder:text-on-surface-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-accent/30"
            aria-label="Search counsellors"
          />
        </div>
      </header>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="scrollbar-hide flex flex-1 flex-wrap items-center gap-2 overflow-x-auto pb-1">
          {directoryFilterChips.map((chip) => (
            <FilterChip
              key={chip.id}
              label={chip.label}
              active={selectedChips.includes(chip.id)}
              onClick={() => toggleChip(chip.id)}
            />
          ))}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-outline-muted/40 bg-surface px-4 py-2 font-heading text-sm font-semibold text-on-surface-muted transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:border-primary hover:bg-soft-teal hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="whitespace-nowrap px-2 py-2 font-heading text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <section className="mb-6">
        <p className="font-heading text-lg font-bold text-on-surface">
          {availableCount} Counsellors Available
        </p>
        <p className="mt-1 font-body text-sm text-on-surface-muted">
          {hasActiveFilters
            ? "Currently showing results for your selected filters."
            : "Browse all verified peer supporters ready to listen."}
        </p>

        {activeFilterLabels.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilterLabels.map((label) => (
              <FilterChip
                key={label}
                label={label}
                removable
                onRemove={() => {
                  if (label === "Available Now") {
                    setSelectedChips((current) =>
                      current.filter((id) => id !== "available-now"),
                    );
                    setAvailability("all");
                    return;
                  }
                  if (label === "Available today") {
                    setAvailability("all");
                    return;
                  }
                  if (label.startsWith("Year ")) {
                    setSelectedYear("all");
                    return;
                  }
                  if (counsellorLanguages.includes(label)) {
                    setSelectedLanguage("all");
                    return;
                  }
                  setSelectedChips((current) => current.filter((id) => id !== label));
                  setSelectedSpecialties((current) =>
                    current.filter((item) => item !== label),
                  );
                }}
              />
            ))}
          </div>
        )}
      </section>

      {loading ? (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-3xl border border-outline-muted/20 bg-surface-muted/40"
            />
          ))}
        </section>
      ) : loadError ? (
        <section className="rounded-3xl border border-danger/20 bg-danger/5 px-6 py-12 text-center">
          <p className="font-body text-sm text-danger">{loadError}</p>
        </section>
      ) : filteredCounsellors.length > 0 ? (
        <section
          className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
          aria-label="Counsellor results"
        >
          {filteredCounsellors.map((counsellor) => (
            <CounsellorCard key={counsellor.id} counsellor={counsellor} />
          ))}
        </section>
      ) : (
        <section className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-outline-muted/40 bg-surface px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted">
            <Search className="h-6 w-6 text-on-surface-subtle" aria-hidden="true" />
          </div>
          <h2 className="mb-2 font-heading text-xl font-bold text-on-surface">
            No counsellors match
          </h2>
          <p className="mb-6 max-w-md font-body text-sm text-on-surface-muted">
            Try adjusting your search or removing a filter. Someone is always here
            to help.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="rounded-xl bg-primary px-5 py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Clear all filters
          </button>
        </section>
      )}

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        availability={availability}
        onAvailabilityChange={setAvailability}
        selectedSpecialties={selectedSpecialties}
        onToggleSpecialty={toggleDrawerSpecialty}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        onApply={() => setDrawerOpen(false)}
        onClear={clearAllFilters}
      />
    </div>
  );
}
