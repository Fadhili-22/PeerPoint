import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ResourceCard from "../components/ResourceCard";
import ResourceArticleView from "../components/ResourceArticleView";
import { ApiError } from "../api/client";
import {
  getRelatedResources,
  getResource,
  recordResourceView,
} from "../api/resources";

export default function ResourceDetails() {
  const { resourceId } = useParams();
  const [resource, setResource] = useState(null);
  const [relatedResources, setRelatedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const viewRecordedForRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadResource() {
      setLoading(true);
      setError("");
      setResource(null);
      setRelatedResources([]);

      try {
        const article = await getResource(resourceId);
        if (cancelled) return;

        setResource(article);

        if (viewRecordedForRef.current !== resourceId) {
          viewRecordedForRef.current = resourceId;
          recordResourceView(resourceId).catch(() => {});
        }

        const related = await getRelatedResources(resourceId);
        if (!cancelled) {
          setRelatedResources(related);
        }
      } catch (loadError) {
        if (!cancelled) {
          if (loadError instanceof ApiError && loadError.status === 404) {
            setResource(null);
          } else if (loadError instanceof ApiError && loadError.status === 403) {
            setError("You are not authorized to view this resource.");
          } else {
            setError(
              loadError.message || "Unable to load this resource. Please try again.",
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResource();
    return () => {
      cancelled = true;
    };
  }, [resourceId]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col">
        <div className="mb-6 h-5 w-36 animate-pulse rounded bg-surface-muted/60" />
        <div className="h-[480px] animate-pulse rounded-3xl bg-surface-muted/40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-danger/20 bg-danger/5 p-10 text-center">
        <p className="font-body text-sm text-danger">{error}</p>
        <Link
          to="/student/resources"
          className="mt-6 inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Resources
        </Link>
      </div>
    );
  }

  if (!resource || resource.status !== "published") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-soft-teal bg-surface p-10 text-center shadow-sm">
        <h1 className="mb-2 font-heading text-2xl font-bold text-on-surface">
          Resource not found
        </h1>
        <p className="mb-6 font-body text-sm text-on-surface-muted">
          We could not find the resource you are looking for.
        </p>
        <Link
          to="/student/resources"
          className="inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <Link
        to="/student/resources"
        className="mb-6 inline-flex items-center gap-2 self-start font-heading text-sm font-semibold text-primary transition-all duration-200 hover:gap-3 hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Resources
      </Link>

      <ResourceArticleView resource={resource} />

      {relatedResources.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-6 font-heading text-2xl font-semibold text-on-surface">
            Related Resources
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {relatedResources.map((related) => (
              <ResourceCard key={related.id} resource={related} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
