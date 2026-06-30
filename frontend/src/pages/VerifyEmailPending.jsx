import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AtSign,
  Info,
  LockKeyhole,
  Mail,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { resendVerificationEmail } from "../api/auth";
import ComingSoonText from "../components/ComingSoonText";

function AuthHero() {
  return (
    <section className="relative flex h-[353px] w-full flex-col items-center justify-center overflow-hidden bg-soft-teal md:h-[397px]">
      <div className="blob-shape absolute -left-10 -top-10 h-64 w-64 animate-pulse bg-primary-accent/20" />
      <div className="blob-shape absolute -right-20 top-20 h-80 w-80 bg-accent-gold/10" />

      <div className="relative z-10 px-5 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <MessageCircle className="h-10 w-10 text-primary" aria-hidden="true" />
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-primary">
            PeerPoint
          </h1>
        </div>
        <p className="mx-auto max-w-md font-heading text-2xl font-semibold text-on-surface-muted">
          A safe space, always available.
        </p>
      </div>

      <div className="relative z-10 mt-8 flex flex-wrap justify-center gap-4 px-5">
        <div className="flex items-center gap-2 rounded-full border border-primary/10 bg-white/60 px-4 py-2 transition-transform duration-300 hover:scale-105">
          <LockKeyhole className="h-5 w-5 text-primary" aria-hidden="true" />
          <span className="font-heading text-sm font-semibold text-on-surface-muted">
            Confidential Support
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-primary/10 bg-white/60 px-4 py-2 transition-transform duration-300 hover:scale-105">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          <span className="font-heading text-sm font-semibold text-on-surface-muted">
            Private &amp; Secure
          </span>
        </div>
      </div>
    </section>
  );
}

function AuthFooter() {
  return (
    <footer className="mt-auto flex w-full flex-col items-center justify-between gap-4 border-t border-outline-muted/30 bg-background px-5 py-8 md:flex-row md:px-10">
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <span className="font-heading text-sm font-semibold text-strathmore-blue">
          PeerPoint
        </span>
        <span className="font-body text-xs font-medium text-on-surface-muted">
          Endorsed by Strathmore University Mental Health Club
        </span>
      </div>
      <div className="flex gap-6">
        <ComingSoonText className="font-body text-xs font-medium text-on-surface-muted">
          Privacy Policy
        </ComingSoonText>
        <ComingSoonText className="font-body text-xs font-medium text-on-surface-muted">
          Contact Support
        </ComingSoonText>
        <ComingSoonText className="font-body text-xs font-medium text-on-surface-muted">
          Terms of Service
        </ComingSoonText>
      </div>
    </footer>
  );
}

function PrivacyDisclaimer() {
  return (
    <div className="mt-8 flex gap-4 rounded-xl border border-outline-muted/20 bg-surface-muted p-4">
      <Info className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      <p className="font-body text-xs font-medium text-on-surface-muted">
        Everything you do here is private. We never share your information without
        your consent. Your student identity is used only for authentication.
      </p>
    </div>
  );
}

const RESEND_SUCCESS_MESSAGE =
  "If that email is registered and unverified, we've sent a new link.";

export default function VerifyEmailPending() {
  const location = useLocation();
  const stateEmail = location.state?.email?.trim() ?? "";

  const [email, setEmail] = useState(stateEmail);
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (value) => {
    if (!value.toLowerCase().endsWith("@strathmore.edu")) {
      setEmailError("Please use your Strathmore University email address.");
      return false;
    }

    setEmailError("");
    return true;
  };

  const handleResend = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    const trimmedEmail = (stateEmail || email).trim();

    if (!validateEmail(trimmedEmail)) {
      return;
    }

    setSubmitting(true);
    try {
      await resendVerificationEmail(trimmedEmail);
      setSuccessMessage(RESEND_SUCCESS_MESSAGE);
    } catch (err) {
      setError(err.message || "Unable to send verification link. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AuthHero />

      <div className="relative z-20 -mt-16 flex items-start justify-center px-5 pb-20 md:px-10">
        <div className="w-full max-w-[480px] overflow-hidden rounded-2xl bg-surface shadow-[0_12px_40px_0_rgba(0,100,112,0.08)] transition-all duration-500">
          <div className="border-b border-outline-muted/20 py-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-teal">
              <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <h2 className="font-heading text-2xl font-semibold text-primary">
              Verify your email
            </h2>
            <p className="mt-2 px-8 font-body text-sm text-on-surface-muted">
              {stateEmail ? (
                <>
                  We sent a verification link to{" "}
                  <span className="font-semibold text-on-surface">{stateEmail}</span>.
                  Open it from your Strathmore inbox to continue. The link expires in
                  24 hours.
                </>
              ) : (
                <>
                  If you just signed up, check your Strathmore inbox for a verification
                  link. Links expire in 24 hours. Enter your email below to request a new
                  one.
                </>
              )}
            </p>
          </div>

          <div className="p-8 md:p-10">
            {successMessage ? (
              <div
                role="status"
                className="rounded-xl border border-success/20 bg-success/5 px-4 py-3 font-body text-sm text-success"
              >
                {successMessage}
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleResend} noValidate>
                {error ? (
                  <p
                    className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 font-body text-sm text-danger"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}

                {!stateEmail ? (
                  <div className="space-y-2">
                    <label
                      htmlFor="verify-pending-email"
                      className="ml-1 font-heading text-sm font-semibold text-on-surface-muted"
                    >
                      Strathmore Email
                    </label>
                    <div className="group relative">
                      <AtSign
                        className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary"
                        aria-hidden="true"
                      />
                      <input
                        id="verify-pending-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          if (emailError) {
                            setEmailError("");
                          }
                        }}
                        placeholder="student@strathmore.edu"
                        aria-invalid={Boolean(emailError)}
                        aria-describedby={
                          emailError ? "verify-pending-email-error" : undefined
                        }
                        className={`w-full rounded-xl border bg-transparent py-4 pl-12 pr-4 font-body text-base outline-none transition-all focus:ring-1 focus:ring-primary ${
                          emailError
                            ? "border-danger focus:border-danger"
                            : "border-outline-muted focus:border-primary"
                        }`}
                      />
                    </div>
                    {emailError ? (
                      <p
                        id="verify-pending-email-error"
                        className="ml-1 font-body text-sm text-danger"
                        role="alert"
                      >
                        {emailError}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-primary py-4 font-heading text-2xl font-semibold text-on-primary shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Sending..." : "Resend verification link"}
                </button>
              </form>
            )}

            <p className="mt-6 text-center font-body text-sm text-on-surface-muted">
              <Link
                to="/login"
                className="font-heading font-semibold text-primary hover:underline"
              >
                Return to Sign In
              </Link>
            </p>

            <PrivacyDisclaimer />
          </div>
        </div>
      </div>

      <AuthFooter />

      <style>{`
        .blob-shape {
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
        }
      `}</style>
    </>
  );
}
