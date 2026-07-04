import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  Users,
  X,
  BookOpen,
} from "lucide-react";
import CounsellorMatchWidget from "../components/CounsellorMatchWidget";
import CrisisHelpButton from "../components/CrisisHelpButton";
import PortalSwitcher from "../components/PortalSwitcher";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/student/directory", label: "Directory", icon: Users },
  { to: "/student/resources", label: "Resources", icon: BookOpen },
  { to: "/student/sessions", label: "Sessions", icon: Calendar },
];

function isNavActive(item, pathname) {
  if (item.to === "/student") {
    return pathname === "/student";
  }
  if (item.to === "/student/resources") {
    return pathname.startsWith("/student/resources");
  }
  if (item.to === "/student/directory") {
    return (
      pathname.startsWith("/student/directory") ||
      pathname.startsWith("/student/counsellors") ||
      pathname.startsWith("/student/book")
    );
  }
  if (item.to === "/student/sessions") {
    return pathname.startsWith("/student/sessions");
  }
  return pathname.startsWith(item.to);
}

export default function StudentPortalLayout() {
  const { user, logout, activePortal, setActivePortal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // The rendered shell is the source of truth: keep the stored portal in sync
  // with the route so a refresh on /student doesn't snap back to a stale choice.
  useEffect(() => {
    if (activePortal !== "student") {
      setActivePortal("student");
    }
  }, [activePortal, setActivePortal]);

  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClass = (active) =>
    `relative font-heading text-sm font-semibold transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:rounded-full after:bg-primary after:transition-all after:duration-200 ${
      active
        ? "text-primary-dark after:w-full"
        : "text-on-surface-muted hover:text-primary-dark after:w-0 hover:after:w-full"
    }`;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-outline-muted/20 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 lg:gap-10">
            <NavLink
              to="/student/directory"
              className="flex items-center gap-2 font-heading text-lg font-bold text-primary-dark transition-transform duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
            >
              <MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" />
              PeerPoint
            </NavLink>

            <nav
              className="hidden items-center gap-8 md:flex"
              aria-label="Student portal"
            >
              {navItems.map((item) => {
                const active = isNavActive(item, location.pathname);
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={item.end}
                    aria-current={active ? "page" : undefined}
                    className={navLinkClass(active)}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <PortalSwitcher currentPortal="student" />
            </div>

            <div
              className="hidden items-center gap-3 rounded-2xl bg-primary/5 px-3 py-2 sm:flex"
              title={user.fullName}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-on-primary">
                {initials}
              </div>
              <div className="hidden min-w-0 lg:block">
                <p className="truncate text-sm font-medium text-on-surface">
                  {user.fullName}
                </p>
                <p className="truncate text-xs text-on-surface-subtle">
                  Student Account
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="hidden items-center gap-2 rounded-xl px-3 py-2 font-heading text-sm font-semibold text-danger transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-danger/10 sm:inline-flex"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="rounded-xl p-2 text-on-surface-muted transition-colors hover:bg-surface-muted hover:text-on-surface md:hidden"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-outline-muted/20 px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Student portal mobile">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(item, location.pathname);
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-primary/10 text-primary-dark"
                        : "text-on-surface-muted hover:bg-primary/5 hover:text-primary-dark"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
              <div className="px-1 py-1">
                <PortalSwitcher
                  currentPortal="student"
                  variant="block"
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
              <button
                type="button"
                disabled
                title="Coming soon"
                aria-disabled="true"
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface-subtle"
              >
                <Settings className="h-4 w-4" />
                Settings
                <span className="ml-auto rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-on-surface-subtle">
                  Soon
                </span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>

      <CounsellorMatchWidget />
      <CrisisHelpButton />
    </div>
  );
}
