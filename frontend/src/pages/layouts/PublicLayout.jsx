import { Link, Outlet } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-primary/10 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-heading text-xl font-bold text-primary-dark transition-transform duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
          >
            <MessageCircle className="h-6 w-6 text-primary" />
            PeerPoint
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-primary-dark transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/10"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary-dark"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
