import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedChips, setSelectedChips] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState(
    () => location.state?.specialties ?? [],
  );
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  const effectiveSpecialties = useMemo(() => {
    if (selectedChips.length === 0) return selectedSpecialties;
    return [...new Set([...selectedChips, ...selectedSpecialties])];
  }, [selectedChips, selectedSpecialties]);

  useEffect(() => {
    let cancelled = false;

    async function loadCounsellors() {
      setLoading(true);
      setLoadError("");
      try {
        const data = await listCounsellors({
          search: search.trim() || undefined,
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
  }, [search, effectiveSpecialties, selectedLanguage, selectedYear]);

  const hasActiveFilters =
    selectedChips.length > 0 ||
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
    setSelectedSpecialties([]);
    setSelectedLanguage("all");
    setSelectedYear("all");
  };

  const activeFilterLabels = [
    ...effectiveSpecialties,
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
          {counsellors.length} Counsellors
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
      ) : counsellors.length > 0 ? (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {counsellors.map((counsellor) => (
            <CounsellorCard key={counsellor.id} counsellor={counsellor} />
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-outline-muted/20 bg-surface px-6 py-16 text-center shadow-sm">
          <p className="font-heading text-lg font-bold text-on-surface">
            No counsellors found
          </p>
          <p className="mt-2 font-body text-sm text-on-surface-muted">
            Try adjusting your search or filters to see more results.
          </p>
        </section>
      )}

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedSpecialties={selectedSpecialties}
        onToggleSpecialty={toggleDrawerSpecialty}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        onApply={() => setDrawerOpen(false)}
        onClear={() => {
          clearAllFilters();
          setDrawerOpen(false);
        }}
      />
    </div>
  );
}
