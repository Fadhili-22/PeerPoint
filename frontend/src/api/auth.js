import { apiFetch, setAccessToken } from "./client";

const ROLE_PRIORITY = ["student", "counsellor", "admin"];

// Default home route for each portal shell. The portal a user "wears" is a
// client-only UI choice (see AuthContext.activePortal); it never changes what
// the API authorizes — that stays on the full roles[] array.
export const PORTAL_HOME_PATHS = {
  student: "/student",
  counsellor: "/counsellor",
  admin: "/admin",
};

/**
 * Portals the user is allowed to enter, derived from their roles plus
 * verification rules:
 *  - student   → only when emailVerified is true
 *  - counsellor → only when the account is verified
 *  - admin     → always (if the role is present)
 * Order is stable (student → counsellor → admin) for predictable defaults.
 */
export function computeAvailablePortals(user) {
  if (!user) return [];
  const roles = user.roles ?? [];
  const portals = [];
  if (roles.includes("student") && user.emailVerified) portals.push("student");
  if (roles.includes("counsellor") && user.isVerified) portals.push("counsellor");
  if (roles.includes("admin")) portals.push("admin");
  return portals;
}

/**
 * Decide where to send a user right after login/signup.
 *  - 2+ portals + a still-valid stored portal → that portal (last-used wins)
 *  - 2+ portals + no valid stored portal      → the chooser
 *  - exactly 1 portal                         → that portal
 *  - 0 portals                                → backend redirect (e.g.
 *                                               /verify-email-pending for
 *                                               unverified students,
 *                                               /pending-approval for
 *                                               unverified counsellors)
 * Returns the target `path` and, when applicable, the `portal` to activate.
 */
export function resolvePostAuthRedirect(user, storedPortal, backendRedirect) {
  const portals = computeAvailablePortals(user);

  if (portals.length > 1) {
    const validStored = storedPortal && portals.includes(storedPortal);
    if (validStored) {
      return { portal: storedPortal, path: PORTAL_HOME_PATHS[storedPortal] };
    }
    return { portal: null, path: "/choose-portal" };
  }

  if (portals.length === 1) {
    return { portal: portals[0], path: PORTAL_HOME_PATHS[portals[0]] };
  }

  return { portal: null, path: backendRedirect };
}

// NOTE: kept only as a fallback label for legacy callers. Navigation, the portal
// switcher, and post-login routing must use activePortal — NOT this priority,
// which would silently pick "student" even while the user browses /counsellor.
export function resolvePrimaryRole(roles = []) {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return role;
  }
  return roles[0] ?? "student";
}

export function mapAuthUser(apiUser) {
  const roles = (apiUser.roles ?? []).map((role) =>
    typeof role === "string" ? role : role.value ?? role,
  );
  return {
    id: apiUser.id,
    fullName: apiUser.full_name,
    email: apiUser.email,
    role: resolvePrimaryRole(roles),
    roles,
    isVerified: apiUser.is_verified,
    emailVerified: apiUser.email_verified,
  };
}

export async function loginRequest(email, password) {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  const data = await apiFetch("/auth/login", {
    method: "POST",
    auth: false,
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  setAccessToken(data.token.access_token);
  return {
    user: mapAuthUser(data.user),
    redirectTo: data.redirect_to,
  };
}

export async function registerRequest({ fullName, email, password, admissionNumber }) {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    auth: false,
    body: {
      full_name: fullName,
      email,
      password,
      admission_number: admissionNumber,
      role: "student",
    },
  });

  return {
    message: data.message,
    email: data.user.email,
  };
}

export async function fetchCurrentUser() {
  const data = await apiFetch("/auth/me");
  return mapAuthUser(data);
}

export async function forgotPassword(email) {
  return apiFetch("/auth/forgot-password", {
    method: "POST",
    auth: false,
    body: { email },
  });
}

export async function resetPassword(token, newPassword) {
  return apiFetch("/auth/reset-password", {
    method: "POST",
    auth: false,
    body: {
      token,
      new_password: newPassword,
    },
  });
}

export async function verifyEmail(token) {
  return apiFetch("/auth/verify-email", {
    method: "POST",
    auth: false,
    body: { token },
  });
}

export async function resendVerificationEmail(email) {
  return apiFetch("/auth/resend-verification", {
    method: "POST",
    auth: false,
    body: { email },
  });
}
