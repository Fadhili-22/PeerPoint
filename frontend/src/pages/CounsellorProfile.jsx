import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Calendar, ExternalLink, Info } from "lucide-react";
import { ApiError } from "../api/client";
import {
  getCounsellor,
  mapCounsellorProfileForPage,
} from "../api/counsellors";
import AvailabilityCard from "../components/AvailabilityCard";
import ComingSoonText from "../components/ComingSoonText";
import ProfileHeader from "../components/ProfileHeader";
import SessionRequestCTA from "../components/SessionRequestCTA";
import SpecialtyBadge from "../components/SpecialtyBadge";

function CounsellorNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl border border-outline-muted/20 bg-surface px-6 py-16 text-center shadow-sm">
      <h1 className="mb-2 font-heading text-xl font-bold text-on-surface">
        Counsellor not found
      </h1>
      <p className="mb-6 font-body text-sm text-on-surface-muted">
        We could not find the counsellor profile you are looking for.
      </p>
      <Link
        to="/student/directory"
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Directory
      </Link>
    </div>
  );
}

function SharedResourcesCard({ resources }) {
  return (
    <div className="rounded-3xl border border-outline-muted/20 bg-surface p-5 shadow-[0_8px_30px_rgba(17,29,39,0.05)]">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <h3 className="font-heading text-sm font-bold text-on-surface">Shared Resources</h3>
      </div>
      <ul className="space-y-2">
        {resources.map((resource) => (
          <li key={resource.title}>
            <Link
              to="/student/resources"
              className="group flex w-full items-center justify-between gap-3 rounded-xl border border-outline-muted/15 bg-surface-muted/30 px-3.5 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-soft-teal/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <div>
                <p className="font-heading text-sm font-semibold text-primary-dark group-hover:text-primary">
                  {resource.title}
                </p>
                <p className="font-body text-[11px] text-on-surface-subtle">{resource.type}</p>
              </div>
              <ExternalLink
                className="h-4 w-4 shrink-0 text-on-surface-subtle transition-colors group-hover:text-primary"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CounsellorProfile() {
  const { counsellorId } = useParams();
  const numericId = Number(counsellorId);

  const [counsellor, setCounsellor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedDay, setSelectedDay] = useState("Tue");

  useEffect(() => {
    if (!Number.isInteger(numericId) || numericId <= 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setLoadError("");
      try {
        const profile = await getCounsellor(numericId);
        if (!cancelled) {
          setCounsellor(mapCounsellorProfileForPage(profile));
        }
      } catch (error) {
        if (!cancelled) {
          if (error instanceof ApiError && error.status === 404) {
            setCounsellor(null);
          } else {
            setLoadError(
              error.message || "Unable to load counsellor profile. Please try again.",
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [numericId]);

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center py-16">
        <p className="font-body text-sm text-on-surface-muted">
          Loading counsellor profile...
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl border border-outline-muted/20 bg-surface px-6 py-16 text-center shadow-sm">
        <p className="mb-6 font-body text-sm text-danger">{loadError}</p>
        <Link
          to="/student/directory"
          className="inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Directory
        </Link>
      </div>
    );
  }

  if (!counsellor) {
    return <CounsellorNotFound />;
  }

  return (
    <div className="flex flex-col gap-5">
      <Link
        to="/student/directory"
        className="inline-flex w-fit items-center gap-2 rounded-xl px-3 py-2 font-heading text-sm font-semibold text-on-surface-muted transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface hover:text-primary-dark hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Directory
      </Link>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-5">
          <ProfileHeader counsellor={counsellor} />

          <section className="rounded-3xl border border-outline-muted/20 bg-surface p-6 shadow-[0_8px_30px_rgba(17,29,39,0.05)]">
            <h2 className="font-heading text-lg font-bold text-on-surface">
              About {counsellor.firstName}
            </h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-on-surface-muted">
              {counsellor.bio}
            </p>
            {counsellor.quote && (
              <blockquote className="relative mt-5 overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-r from-soft-teal/80 to-surface-muted/50 p-5 pl-6">
                <span
                  className="absolute left-0 top-0 h-full w-1 bg-primary"
                  aria-hidden="true"
                />
                <p className="font-body text-sm italic leading-relaxed text-on-surface-muted">
                  &ldquo;{counsellor.quote}&rdquo;
                </p>
              </blockquote>
            )}
          </section>

          <section className="rounded-3xl border border-outline-muted/20 bg-surface p-6 shadow-[0_8px_30px_rgba(17,29,39,0.05)]">
            <h2 className="font-heading text-lg font-bold text-on-surface">Focus Areas</h2>
            <p className="mt-1 font-body text-sm text-on-surface-subtle">
              Topics {counsellor.firstName} is trained and comfortable supporting.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {counsellor.focusAreas.map((area) => (
                <SpecialtyBadge key={area.label} label={area.label} icon={area.icon} />
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-outline-muted/20 bg-surface p-6 shadow-[0_8px_30px_rgba(17,29,39,0.05)]">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-on-surface">
                  Weekly Availability
                </h2>
                <p className="mt-0.5 font-body text-sm text-on-surface-subtle">
                  Open slots for peer sessions this week
                </p>
              </div>
              {selectedDay && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-heading text-xs font-semibold text-primary">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {selectedDay} selected
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {counsellor.weeklyAvailability.map((day) => (
                <AvailabilityCard
                  key={day.day}
                  day={day}
                  selected={selectedDay === day.day}
                  onSelect={setSelectedDay}
                />
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-muted/50 px-3 py-2.5">
              <Info className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <p className="font-body text-xs text-on-surface-muted">
                Teal bars represent open slots. Select a day to see available times when
                booking.
              </p>
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-5 xl:sticky xl:top-24 xl:self-start">
          <SessionRequestCTA
            counsellorId={counsellor.id}
            counsellorName={counsellor.firstName}
            isAvailable={counsellor.isAvailable}
          />
          <SharedResourcesCard resources={counsellor.sharedResources} />

          <div className="rounded-2xl border border-outline-muted/15 bg-soft-teal/50 px-4 py-3 text-center">
            <p className="font-body text-[11px] leading-relaxed text-on-surface-muted">
              Endorsed by{" "}
              <span className="font-semibold text-primary-dark">
                Strathmore University Mental Health Club
              </span>
            </p>
          </div>
        </aside>
      </div>

      <footer className="flex flex-col items-center justify-between gap-2 border-t border-outline-muted/15 pt-4 sm:flex-row">
        <p className="font-body text-xs text-on-surface-subtle">
          Endorsed by Strathmore University Mental Health Club
        </p>
        <div className="flex gap-4">
          <ComingSoonText className="font-body text-xs text-on-surface-subtle">
            Privacy Policy
          </ComingSoonText>
          <ComingSoonText className="font-body text-xs text-on-surface-subtle">
            Contact
          </ComingSoonText>
        </div>
      </footer>
    </div>
  );
}
