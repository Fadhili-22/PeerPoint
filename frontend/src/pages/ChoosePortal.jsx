import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  GraduationCap,
  HeartHandshake,
  LogOut,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PORTAL_CARDS = {
  student: {
    title: "Student Portal",
    subtitle: "Book sessions, browse resources",
    icon: GraduationCap,
  },
  counsellor: {
    title: "Peer Counsellor Portal",
    subtitle: "Manage requests & availability",
    icon: HeartHandshake,
  },
  admin: {
    title: "Admin Portal",
    subtitle: "Platform management",
    icon: ShieldCheck,
  },
};

export default function ChoosePortal() {
  const { user, availablePortals, switchPortal, logout } = useAuth();
  const navigate = useNavigate();

  // A single portal needs no choice — send the user straight in.
  useEffect(() => {
    if (availablePortals.length === 1) {
      navigate(switchPortal(availablePortals[0]), { replace: true });
    }
  }, [availablePortals, switchPortal, navigate]);

  // No usable portal — route to the appropriate pending screen.
  if (availablePortals.length === 0) {
    const roles = user?.roles ?? [];
    if (roles.includes("student") && !user?.emailVerified) {
      return (
        <Navigate
          to="/verify-email-pending"
          replace
          state={{ email: user.email }}
        />
      );
    }
    return <Navigate to="/pending-approval" replace />;
  }

  if (availablePortals.length === 1) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-primary/10 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-heading text-xl font-bold text-primary-dark">
            <MessageCircle className="h-6 w-6 text-primary" aria-hidden="true" />
            PeerPoint
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 font-heading text-sm font-semibold text-danger transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-danger/10"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="font-heading text-3xl font-semibold text-on-surface">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 font-body text-base text-on-surface-muted">
            Choose which portal you would like to open. You can switch anytime.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-3xl gap-5 sm:grid-cols-2">
          {availablePortals.map((portal) => {
            const card = PORTAL_CARDS[portal];
            if (!card) return null;
            const Icon = card.icon;
            return (
              <button
                key={portal}
                type="button"
                onClick={() => navigate(switchPortal(portal))}
                className="group flex flex-col items-start gap-4 rounded-2xl border border-outline-muted/20 bg-surface p-6 text-left shadow-[0_8px_30px_0_rgba(0,100,112,0.06)] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:border-primary/30 hover:shadow-[0_12px_40px_0_rgba(0,100,112,0.12)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-on-primary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <h2 className="font-heading text-lg font-semibold text-on-surface">
                    {card.title}
                  </h2>
                  <p className="mt-1 font-body text-sm text-on-surface-muted">
                    {card.subtitle}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 font-heading text-sm font-semibold text-primary-dark transition-transform duration-200 group-hover:translate-x-1">
                  Enter
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
