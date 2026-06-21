import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Info,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
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

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");

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

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");

    if (!agreed) {
      setFormError("Please agree to the Privacy Policy to continue.");
      return;
    }

    const trimmedEmail = email.trim();

    if (!validateEmail(trimmedEmail)) {
      return;
    }

    const result = signup({
      fullName: fullName.trim(),
      email: trimmedEmail,
      password,
      role: "student",
    });

    if (result.success) {
      navigate(result.redirectTo);
      return;
    }

    if (result.field === "email") {
      setEmailError(result.error);
      return;
    }

    setFormError(result.error);
  };

  return (
    <>
      <AuthHero />

      <div className="relative z-20 -mt-16 flex items-start justify-center px-5 pb-20 md:px-10">
        <div className="w-full max-w-[480px] overflow-hidden rounded-2xl bg-surface shadow-[0_12px_40px_0_rgba(0,100,112,0.08)] transition-all duration-500">
          <div className="flex border-b border-outline-muted/20">
            <Link
              to="/login"
              className="flex-1 py-5 text-center font-heading text-2xl font-semibold text-outline-muted transition-all hover:text-on-surface-muted"
            >
              Sign In
            </Link>
            <span className="flex-1 border-b-2 border-primary bg-surface py-5 text-center font-heading text-2xl font-semibold text-primary">
              Sign Up
            </span>
          </div>

          <div className="p-8 md:p-10">
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              {formError ? (
                <p
                  className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 font-body text-sm text-danger"
                  role="alert"
                >
                  {formError}
                </p>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="signup-full-name"
                    className="ml-1 font-heading text-sm font-semibold text-on-surface-muted"
                  >
                    Full Name
                  </label>
                  <input
                    id="signup-full-name"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-outline-muted bg-transparent px-4 py-4 font-body text-base outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="signup-student-id"
                    className="ml-1 font-heading text-sm font-semibold text-on-surface-muted"
                  >
                    Student ID
                  </label>
                  <input
                    id="signup-student-id"
                    type="text"
                    required
                    value={studentId}
                    onChange={(event) => setStudentId(event.target.value)}
                    placeholder="123456"
                    className="w-full rounded-xl border border-outline-muted bg-transparent px-4 py-4 font-body text-base outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="signup-email"
                  className="ml-1 font-heading text-sm font-semibold text-on-surface-muted"
                >
                  Strathmore Email
                </label>
                <input
                  id="signup-email"
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
                  aria-describedby={emailError ? "signup-email-error" : undefined}
                  className={`w-full rounded-xl border bg-transparent px-4 py-4 font-body text-base outline-none transition-all focus:ring-1 focus:ring-primary ${
                    emailError
                      ? "border-danger focus:border-danger"
                      : "border-outline-muted focus:border-primary"
                  }`}
                />
                {emailError ? (
                  <p
                    id="signup-email-error"
                    className="ml-1 font-body text-sm text-danger"
                    role="alert"
                  >
                    {emailError}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="signup-password"
                  className="ml-1 font-heading text-sm font-semibold text-on-surface-muted"
                >
                  Password
                </label>
                <div className="group relative">
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-xl border border-outline-muted bg-transparent px-4 py-4 pr-12 font-body text-base outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
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

              <div className="flex items-start gap-3 py-2">
                <input
                  id="signup-agreement"
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  className="mt-1 rounded border-outline-muted text-primary focus:ring-primary"
                />
                <label
                  htmlFor="signup-agreement"
                  className="font-body text-xs font-medium text-on-surface-muted"
                >
                  I agree to the{" "}
                  <ComingSoonText className="text-primary underline">
                    Privacy Policy
                  </ComingSoonText>{" "}
                  and understand that everything I do here is private.
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-primary py-4 font-heading text-2xl font-semibold text-on-primary shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95"
              >
                Create Account
              </button>
            </form>

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
