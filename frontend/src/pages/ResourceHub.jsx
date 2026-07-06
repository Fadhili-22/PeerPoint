import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import FeaturedResourceCard from "../components/FeaturedResourceCard";
import LegalFooterLinks from "../components/LegalFooterLinks";
import NewsletterSignup from "../components/NewsletterSignup";
import ResourceCard from "../components/ResourceCard";
import SupportNetworkCard from "../components/SupportNetworkCard";
import { campusSupportOptions, resourceCategories } from "../data/mockResources";
import { ApiError } from "../api/client";
import { getFeaturedResources, listResources } from "../api/resources";

export default function ResourceHub() {
  const [activeCategory, setActiveCategory] = useState("All Resources");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [publishedResources, setPublishedResources] = useState([]);
  const [heroFeaturedResources, setHeroFeaturedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;

    async function loadResources() {
      setLoading(true);
      setError("");
      try {
        const categoryFilter =
          activeCategory === "All Resources" ? undefined : activeCategory;
        const searchFilter = debouncedSearch.trim() || undefined;
        const showHero =
          activeCategory === "All Resources" && !searchFilter;

        const [listData, featuredData] = await Promise.all([
          listResources({ category: categoryFilter, search: searchFilter }),
          showHero ? getFeaturedResources(2) : Promise.resolve([]),
        ]);

        if (!cancelled) {
          setPublishedResources(listData);
          setHeroFeaturedResources(featuredData);
        }
      } catch (loadError) {
        if (!cancelled) {
          if (loadError instanceof ApiError && loadError.status === 403) {
            setError("You are not authorized to view resources.");
          } else {
            setError(
              loadError.message || "Unable to load resources. Please try again.",
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResources();
    return () => {
      cancelled = true;
    };
  }, [activeCategory, debouncedSearch]);

  const heroFeaturedIds = useMemo(
    () => new Set(heroFeaturedResources.map((resource) => resource.id)),
    [heroFeaturedResources],
  );

  const showFeatured =
    activeCategory === "All Resources" &&
    !debouncedSearch.trim() &&
    heroFeaturedResources.length > 0;

  const gridResources = useMemo(() => {
    if (!showFeatured) return publishedResources;
    return publishedResources.filter((resource) => !heroFeaturedIds.has(resource.id));
  }, [publishedResources, showFeatured, heroFeaturedIds]);

  return (
    <div className="relative flex flex-col">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,theme(colors.primary-accent/20),transparent_70%)]"
        aria-hidden="true"
      />

      <header className="mb-8 md:mb-10">
        <h1 className="mb-2 font-heading text-[28px] font-semibold leading-9 text-on-surface md:text-[36px] md:leading-10">
          Mental Health Resources
        </h1>
        <p className="mb-6 max-w-2xl font-body text-base text-on-surface-muted">
          A curated collection of guides, articles, and professional tools designed
          to support your academic and emotional journey at Strathmore.
        </p>
        <div className="relative max-w-xl">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-subtle"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search guides, articles, and tools..."
            className="w-full rounded-2xl border border-outline-muted/40 bg-surface py-3.5 pl-12 pr-4 font-body text-base text-on-surface shadow-sm transition-all duration-200 placeholder:text-on-surface-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-accent/40"
            aria-label="Search mental health resources"
          />
        </div>
      </header>

      <div className="scrollbar-hide mb-10 flex flex-wrap gap-3 overflow-x-auto pb-2">
        {resourceCategories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-full px-6 py-2 font-heading text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                isActive
                  ? "bg-primary text-on-primary shadow-sm"
                  : "border border-outline-muted bg-surface text-on-surface-muted hover:border-primary hover:bg-soft-teal"
              }`}
              aria-pressed={isActive}
            >
              {category}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="mb-8 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 font-body text-sm text-danger">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-80 animate-pulse rounded-3xl bg-surface-muted/40"
            />
          ))}
        </div>
      ) : (
        <>
          {showFeatured ? (
            <section className="mb-12 space-y-8">
              {heroFeaturedResources.map((resource) => (
                <FeaturedResourceCard key={resource.id} resource={resource} />
              ))}
            </section>
          ) : null}

          <section className="mb-16">
            {publishedResources.length > 0 ? (
              gridResources.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {gridResources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              ) : null
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-outline-muted/40 bg-surface px-6 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted">
                  <Search className="h-6 w-6 text-on-surface-subtle" aria-hidden="true" />
                </div>
                <p className="font-heading text-xl font-bold text-on-surface">
                  No resources match
                </p>
                <p className="mt-2 max-w-md font-body text-sm text-on-surface-muted">
                  Try a different search term or browse another category.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All Resources");
                  }}
                  className="mt-6 rounded-xl bg-primary px-5 py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Clear search
                </button>
              </div>
            )}
          </section>
        </>
      )}

      <section className="mb-16">
        <h2 className="mb-8 font-heading text-2xl font-semibold text-on-surface md:text-[32px] md:leading-10">
          Campus Support Network
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {campusSupportOptions.map((option) => (
            <SupportNetworkCard key={option.id} option={option} />
          ))}
        </div>
      </section>

      <NewsletterSignup />

      <footer className="w-full border-t border-outline-muted/30 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <div className="font-heading text-sm font-semibold text-strathmore-blue">
              PeerPoint
            </div>
            <p className="font-body text-xs text-on-surface-muted">
              Endorsed by Strathmore University Mental Health Club
            </p>
          </div>
          <LegalFooterLinks gapClassName="flex gap-8" />
        </div>
      </footer>
    </div>
  );
}
