import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function userHasRole(user, role) {
  if (user.roles?.includes(role)) return true;
  return user.role === role;
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="font-body text-sm text-on-surface-muted">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some((role) => userHasRole(user, role))) {
    return <Navigate to="/" replace />;
  }

  // Student and counsellor verification gates are independent per role.
  // A dual-role user may pass one check while failing the other — e.g. a
  // counsellor pending admin approval (isVerified=false) with a verified
  // student role (emailVerified=true) still reaches student routes; an
  // email-unverified student with an approved counsellor role still reaches
  // counsellor routes.
  const guardsStudentRoute = allowedRoles?.includes("student");
  if (
    guardsStudentRoute &&
    userHasRole(user, "student") &&
    !user.emailVerified
  ) {
    return (
      <Navigate
        to="/verify-email-pending"
        replace
        state={{ email: user.email }}
      />
    );
  }

  const guardsCounsellorRoute = allowedRoles?.includes("counsellor");
  if (
    guardsCounsellorRoute &&
    userHasRole(user, "counsellor") &&
    !user.isVerified
  ) {
    return <Navigate to="/pending-approval" replace />;
  }

  return children;
}
