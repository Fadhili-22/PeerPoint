import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import PortalSwitcher from "../components/PortalSwitcher";
import { useAuth } from "../context/AuthContext";

const navByRole = {
  counsellor: [
    { to: "/counsellor", label: "Dashboard", icon: LayoutDashboard },
    { to: "/counsellor/requests", label: "Requests", icon: ClipboardList },
    { to: "/counsellor/resources", label: "Resources", icon: BookOpen },
    { to: "/counsellor/availability", label: "Availability", icon: UserCheck },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/counsellors", label: "Manage Counsellors", icon: UserCheck },
    { to: "/admin/students", label: "Manage Students", icon: Users },
    { to: "/admin/sessions", label: "Sessions", icon: Calendar },
    { to: "/admin/resources", label: "Resources", icon: BookOpen },
    { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  ],
};

const roleLabels = {
  student: "Student Account",
  counsellor: "Peer Counsellor",
  admin: "Administrator",
};

function resolveDashboardRole(pathname, user) {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/counsellor")) return "counsellor";
  if (user.roles?.includes("admin")) return "admin";
  if (user.roles?.includes("counsellor")) return "counsellor";
  return user.role;
}

function SidebarNav({ navItems, activeIndex, onNavigate, className = "" }) {
  return (
    <nav className={`flex-1 space-y-1 px-3 py-3 ${className}`}>
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = index === activeIndex;
        return (
          <NavLink
            key={item.label}
            to={item.to}
            end
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 ${
              isActive
                ? "bg-primary/10 text-primary-dark"
                : "text-on-surface/70 hover:bg-primary/5 hover:text-primary-dark"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ user, initials, onLogout, dashboardRole, onNavigate }) {
  return (
    <div className="space-y-2 border-t border-primary/10 px-3 py-3">
      <PortalSwitcher
        currentPortal={dashboardRole}
        variant="block"
        menuDirection="up"
        onNavigate={onNavigate}
      />

      <button
        type="button"
        disabled
        title="Coming soon"
        aria-disabled="true"
        className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-on-surface/40"
      >
        <Settings className="h-4 w-4" />
        Settings
        <span className="ml-auto rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
          Soon
        </span>
      </button>

      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-danger transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-danger/10"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>

      <div className="flex items-center gap-3 rounded-xl bg-primary/5 px-3 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-on-surface">
            {user.fullName}
          </p>
          <p className="truncate text-xs text-on-surface/60">
            {roleLabels[dashboardRole] ?? roleLabels[user.role]}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const { user, logout, activePortal, setActivePortal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const dashboardRole = resolveDashboardRole(location.pathname, user);

  // Route wins over stored portal: keep activePortal aligned with the shell the
  // user is actually viewing so a refresh on /counsellor or /admin stays put.
  useEffect(() => {
    if (dashboardRole && activePortal !== dashboardRole) {
      setActivePortal(dashboardRole);
    }
  }, [dashboardRole, activePortal, setActivePortal]);
  const navItems = navByRole[dashboardRole] || [];
  const activeIndex = navItems.reduce(
    (best, item, index) => {
      const isMatch =
        location.pathname === item.to ||
        location.pathname.startsWith(`${item.to}/`);
      if (!isMatch) return best;
      if (best === -1 || item.to.length > navItems[best].to.length) {
        return index;
      }
      return best;
    },
    -1,
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <header className="flex items-center justify-between border-b border-primary/10 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2 font-heading text-lg font-bold text-primary-dark">
          <MessageCircle className="h-5 w-5 text-primary" />
          PeerPoint
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="rounded-xl p-2 text-on-surface-muted transition-colors hover:bg-surface-muted hover:text-on-surface"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={closeMobile}
          />
          <aside className="relative flex h-full w-64 max-w-[85vw] flex-col border-r border-primary/10 bg-white shadow-xl">
            <div className="border-b border-primary/10 px-6 py-4">
              <div className="flex items-center gap-2 font-heading text-lg font-bold text-primary-dark">
                <MessageCircle className="h-5 w-5 text-primary" />
                PeerPoint
              </div>
              {dashboardRole === "admin" && (
                <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-primary">
                  Admin Panel
                </span>
              )}
            </div>
            <SidebarNav
              navItems={navItems}
              activeIndex={activeIndex}
              onNavigate={closeMobile}
            />
            <SidebarFooter
              user={user}
              initials={initials}
              onLogout={handleLogout}
              dashboardRole={dashboardRole}
              onNavigate={closeMobile}
            />
          </aside>
        </div>
      )}

      <aside className="hidden w-64 shrink-0 flex-col border-r border-primary/10 bg-white md:flex">
        <div className="border-b border-primary/10 px-6 py-4">
          <div className="flex items-center gap-2 font-heading text-lg font-bold text-primary-dark">
            <MessageCircle className="h-5 w-5 text-primary" />
            PeerPoint
          </div>
          {dashboardRole === "admin" && (
            <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-primary">
              Admin Panel
            </span>
          )}
        </div>

        <SidebarNav navItems={navItems} activeIndex={activeIndex} />

        <SidebarFooter
          user={user}
          initials={initials}
          onLogout={handleLogout}
          dashboardRole={dashboardRole}
        />
      </aside>

      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
