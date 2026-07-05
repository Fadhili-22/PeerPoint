import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AtSign,
  Eye,
  EyeOff,
  Info,
  Lock,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { resolvePostAuthRedirect } from "../api/auth";
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

export default function Login() {
  const { login, activePortal, setActivePortal } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [accountInactive, setAccountInactive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (value) => {
    if (!value.toLowerCase().endsWith("@strathmore.edu")) {
      setEmailError("Please use your Strathmore University email address.");
      return false;
    }

    setEmailError("");
    return true;
  };

  const handleEmailBlur = () => {
    if (email.trim()) {
      validateEmail(email.trim());
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setAccountInactive(false);

    const trimmedEmail = email.trim();

    if (!validateEmail(trimmedEmail)) {
      return;
    }

    setSubmitting(true);
    const result = await login(trimmedEmail, password.trim());
    setSubmitting(false);

    if (result.success) {
      const { portal, path } = resolvePostAuthRedirect(
        result.user,
        activePortal,
        result.redirectTo,
      );
      if (portal) {
        setActivePortal(portal);
      }
      navigate(path);
      return;
    }

    if (result.accountInactive) {
      setAccountInactive(true);
      return;
    }

    if (result.field === "email") {
      setEmailError(result.error);
      return;
    }

    setError(result.error);
  };

  return (
    <>
      <AuthHero />

      <div className="relative z-20 -mt-16 flex items-start justify-center px-5 pb-20 md:px-10">
        <div className="w-full max-w-[480px] overflow-hidden rounded-2xl bg-surface shadow-[0_12px_40px_0_rgba(0,100,112,0.08)] transition-all duration-500">
          <div className="flex border-b border-outline-muted/20">
            <span className="flex-1 border-b-2 border-primary bg-surface py-5 text-center font-heading text-2xl font-semibold text-primary">
              Sign In
            </span>
            <Link
              to="/signup"
              className="flex-1 py-5 text-center font-heading text-2xl font-semibold text-outline-muted transition-all hover:text-on-surface-muted"
            >
              Sign Up
            </Link>
          </div>

          <div className="p-8 md:p-10">
            {accountInactive ? (
              <div className="space-y-6 text-center">
                <div className="rounded-2xl border border-danger/20 bg-danger/5 px-5 py-6">
                  <h2 className="mb-2 font-heading text-xl font-semibold text-on-surface">
                    Account deactivated
                  </h2>
                  <p className="font-body text-sm leading-relaxed text-on-surface-muted">
                    Your account has been deactivated. Please contact the Mental
                    Health Club for more information.
                  </p>
                </div>
                <Link
                  to="/contact-support"
                  className="inline-flex rounded-xl bg-primary px-5 py-2.5 font-heading text-sm font-semibold text-on-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
                >
                  Contact Support
                </Link>
              </div>
            ) : (
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {error ? (
                <p
                  className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 font-body text-sm text-danger"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <div className="space-y-2">
                <label
                  htmlFor="login-email"
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
                    id="login-email"
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
                    onBlur={handleEmailBlur}
                    placeholder="student@strathmore.edu"
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={emailError ? "login-email-error" : undefined}
                    className={`w-full rounded-xl border bg-transparent py-4 pl-12 pr-4 font-body text-base outline-none transition-all focus:ring-1 focus:ring-primary ${
                      emailError
                        ? "border-danger focus:border-danger"
                        : "border-outline-muted focus:border-primary"
                    }`}
                  />
                </div>
                {emailError ? (
                  <p
                    id="login-email-error"
                    className="ml-1 font-body text-sm text-danger"
                    role="alert"
                  >
                    {emailError}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="ml-1 font-heading text-sm font-semibold text-on-surface-muted"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-heading text-sm font-semibold text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="group relative">
                  <Lock
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary"
                    aria-hidden="true"
                  />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-outline-muted bg-transparent py-4 pl-12 pr-12 font-body text-base outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
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
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-primary py-4 font-heading text-2xl font-semibold text-on-primary shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Signing In..." : "Sign In"}
              </button>
            </form>
            )}

            {!accountInactive ? <PrivacyDisclaimer /> : null}
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
