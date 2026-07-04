import { useState } from "react";
import { ApiError } from "../api/client";
import { subscribeToNewsletter } from "../api/newsletter";

const STRATHMORE_EMAIL_SUFFIX = "@strathmore.edu";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(false);

    const trimmed = email.trim();
    if (!trimmed.toLowerCase().endsWith(STRATHMORE_EMAIL_SUFFIX)) {
      setError("Please use your Strathmore University email address.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await subscribeToNewsletter(trimmed);
      setSubmitted(true);
      setEmail("");
    } catch (err) {
      setSubmitted(false);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mb-12">
      <div className="relative overflow-hidden rounded-[32px] bg-primary p-8 shadow-xl md:p-12">
        <div className="pointer-events-none absolute inset-0 opacity-5">
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="max-w-lg text-center md:text-left">
            <h3 className="mb-2 font-heading text-2xl font-semibold text-on-primary md:text-[32px] md:leading-10">
              Wellness in your inbox
            </h3>
            <p className="font-body text-base text-on-primary/80">
              Get weekly mindfulness tips, resources, and event updates from the
              Strathmore community.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-3 sm:flex-row md:w-auto"
            noValidate
          >
            <div className="w-full sm:w-80">
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError("");
                  if (submitted) setSubmitted(false);
                }}
                placeholder="student@strathmore.edu"
                disabled={submitting}
                className="w-full rounded-2xl border-none bg-surface px-6 py-4 font-body text-base text-on-surface placeholder:text-outline transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-accent disabled:opacity-70"
                aria-invalid={error ? "true" : undefined}
                aria-describedby={error ? "newsletter-email-error" : undefined}
              />
              {error && (
                <p
                  id="newsletter-email-error"
                  className="mt-2 text-left font-body text-sm text-on-primary"
                  role="alert"
                >
                  {error}
                </p>
              )}
              {submitted && !error && (
                <p className="mt-2 text-left font-body text-sm text-on-primary">
                  You&apos;re subscribed. Check your inbox soon.
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="whitespace-nowrap rounded-2xl bg-surface-muted px-8 py-4 font-heading text-sm font-bold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-soft-teal focus:outline-none focus:ring-4 focus:ring-primary-accent disabled:opacity-70"
            >
              {submitting ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
