import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Info,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { verifyEmail } from "../api/auth";
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

const TOKEN_ERROR_MESSAGE =
  "This verification link is invalid or has expired. Verification links are valid for 24 hours.";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [verifying, setVerifying] = useState(Boolean(token));

  const hasToken = Boolean(token);

  useEffect(() => {
    if (!hasToken) {
      return undefined;
    }

    let cancelled = false;

    verifyEmail(token)
      .then((data) => {
        if (cancelled) {
          return;
        }
        setSuccessMessage(
          data?.message === "Email already verified"
            ? "Your email is already verified. Redirecting you to sign in..."
            : "Your email has been verified. Redirecting you to sign in...",
        );
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }
        if (err.status === 400) {
          setError(TOKEN_ERROR_MESSAGE);
          return;
        }
        setError(err.message || "Unable to verify email. Please try again.");
      })
      .finally(() => {
        if (!cancelled) {
          setVerifying(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasToken, token]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage, navigate]);

  return (
    <>
      <AuthHero />

      <div className="relative z-20 -mt-16 flex items-start justify-center px-5 pb-20 md:px-10">
        <div className="w-full max-w-[480px] overflow-hidden rounded-2xl bg-surface shadow-[0_12px_40px_0_rgba(0,100,112,0.08)] transition-all duration-500">
          <div className="border-b border-outline-muted/20 py-5 text-center">
            <h2 className="font-heading text-2xl font-semibold text-primary">
              Email Verification
            </h2>
            <p className="mt-2 px-8 font-body text-sm text-on-surface-muted">
              {verifying
                ? "Confirming your email address..."
                : "Your verification status is shown below."}
            </p>
          </div>

          <div className="p-8 md:p-10">
            {!hasToken ? (
              <div
                className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 font-body text-sm text-danger"
                role="alert"
              >
                <p>{TOKEN_ERROR_MESSAGE}</p>
                <p className="mt-3">
                  <Link
                    to="/verify-email-pending"
                    className="font-heading font-semibold text-primary hover:underline"
                  >
                    Request a new verification link
                  </Link>
                </p>
              </div>
            ) : verifying ? (
              <p className="text-center font-body text-sm text-on-surface-muted">
                Verifying...
              </p>
            ) : successMessage ? (
              <div
                role="status"
                className="rounded-xl border border-success/20 bg-success/5 px-4 py-3 font-body text-sm text-success"
              >
                {successMessage}
              </div>
            ) : (
              <div
                className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 font-body text-sm text-danger"
                role="alert"
              >
                <p>{error || TOKEN_ERROR_MESSAGE}</p>
                <p className="mt-3">
                  <Link
                    to="/verify-email-pending"
                    className="font-heading font-semibold text-primary hover:underline"
                  >
                    Request a new verification link
                  </Link>
                </p>
              </div>
            )}

            <p className="mt-6 text-center font-body text-sm text-on-surface-muted">
              <Link
                to="/login"
                className="font-heading font-semibold text-primary hover:underline"
              >
                Back to Sign In
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
