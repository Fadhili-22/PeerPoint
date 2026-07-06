import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Info,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { resetPassword } from "../api/auth";
import LegalFooterLinks from "../components/LegalFooterLinks";

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
      <LegalFooterLinks />
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
  "This password reset link is invalid or has expired. Reset links are valid for 30 minutes.";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasToken = Boolean(token);

  useEffect(() => {
    if (!successMessage) return undefined;

    const timeoutId = window.setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setPasswordError("");
    setConfirmError("");

    if (!hasToken) {
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setSuccessMessage("Your password has been reset. Redirecting you to sign in...");
    } catch (err) {
      if (err.status === 400) {
        setError(TOKEN_ERROR_MESSAGE);
        return;
      }
      if (err.status === 422) {
        const fieldErrors = err.fieldErrors ?? {};
        if (fieldErrors.new_password) {
          setPasswordError(fieldErrors.new_password);
        }
        if (fieldErrors.token) {
          setError(fieldErrors.token);
        }
        if (!fieldErrors.new_password && !fieldErrors.token) {
          setError(err.message || "Please check your input and try again.");
        }
        return;
      }
      setError(err.message || "Unable to reset password. Please try again.");
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
            <h2 className="font-heading text-2xl font-semibold text-primary">
              Choose a New Password
            </h2>
            <p className="mt-2 px-8 font-body text-sm text-on-surface-muted">
              Enter and confirm your new password below.
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
                    to="/forgot-password"
                    className="font-heading font-semibold text-primary hover:underline"
                  >
                    Request a new reset link
                  </Link>
                </p>
              </div>
            ) : successMessage ? (
              <div
                role="status"
                className="rounded-xl border border-success/20 bg-success/5 px-4 py-3 font-body text-sm text-success"
              >
                {successMessage}
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                {error ? (
                  <div
                    className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 font-body text-sm text-danger"
                    role="alert"
                  >
                    <p>{error}</p>
                    {error === TOKEN_ERROR_MESSAGE ? (
                      <p className="mt-3">
                        <Link
                          to="/forgot-password"
                          className="font-heading font-semibold text-primary hover:underline"
                        >
                          Request a new reset link
                        </Link>
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label
                    htmlFor="reset-password"
                    className="ml-1 font-heading text-sm font-semibold text-on-surface-muted"
                  >
                    New Password
                  </label>
                  <div className="group relative">
                    <input
                      id="reset-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (passwordError) {
                          setPasswordError("");
                        }
                      }}
                      placeholder="Min. 8 characters"
                      aria-invalid={Boolean(passwordError)}
                      aria-describedby={
                        passwordError ? "reset-password-error" : undefined
                      }
                      className={`w-full rounded-xl border bg-transparent px-4 py-4 pr-12 font-body text-base outline-none transition-all focus:ring-1 focus:ring-primary ${
                        passwordError
                          ? "border-danger focus:border-danger"
                          : "border-outline-muted focus:border-primary"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-primary"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {passwordError ? (
                    <p
                      id="reset-password-error"
                      className="ml-1 font-body text-sm text-danger"
                      role="alert"
                    >
                      {passwordError}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="reset-confirm-password"
                    className="ml-1 font-heading text-sm font-semibold text-on-surface-muted"
                  >
                    Confirm Password
                  </label>
                  <div className="group relative">
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        if (confirmError) {
                          setConfirmError("");
                        }
                      }}
                      placeholder="Re-enter your password"
                      aria-invalid={Boolean(confirmError)}
                      aria-describedby={
                        confirmError ? "reset-confirm-password-error" : undefined
                      }
                      className={`w-full rounded-xl border bg-transparent px-4 py-4 pr-12 font-body text-base outline-none transition-all focus:ring-1 focus:ring-primary ${
                        confirmError
                          ? "border-danger focus:border-danger"
                          : "border-outline-muted focus:border-primary"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-primary"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {confirmError ? (
                    <p
                      id="reset-confirm-password-error"
                      className="ml-1 font-body text-sm text-danger"
                      role="alert"
                    >
                      {confirmError}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-primary py-4 font-heading text-2xl font-semibold text-on-primary shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Update Password"}
                </button>
              </form>
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
