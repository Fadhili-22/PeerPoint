import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  computeAvailablePortals,
  fetchCurrentUser,
  loginRequest,
  logoutRequest,
  PORTAL_HOME_PATHS,
  registerRequest,
} from "../api/auth";
import { getAccessToken, setAccessToken, setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

const STORAGE_KEY = "peerpoint_user";
const PORTAL_STORAGE_KEY = "peerpoint_active_portal";
const STRATHMORE_EMAIL_ERROR =
  "Please use your Strathmore University email address.";

function isStrathmoreEmail(email) {
  return email.toLowerCase().endsWith("@strathmore.edu");
}

function loadStoredUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function persistUser(nextUser) {
  if (nextUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function loadStoredPortal() {
  try {
    return localStorage.getItem(PORTAL_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

function persistPortal(portal) {
  if (portal) {
    localStorage.setItem(PORTAL_STORAGE_KEY, portal);
  } else {
    localStorage.removeItem(PORTAL_STORAGE_KEY);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadStoredUser());
  const [activePortal, setActivePortalState] = useState(() => loadStoredPortal());
  const [initializing, setInitializing] = useState(() => Boolean(getAccessToken()));

  const availablePortals = useMemo(() => computeAvailablePortals(user), [user]);

  const setActivePortal = (portal) => {
    setActivePortalState(portal);
    persistPortal(portal);
  };

  // Set the active portal and hand back its home path so callers can navigate.
  const switchPortal = (portal) => {
    setActivePortal(portal);
    return PORTAL_HOME_PATHS[portal] ?? "/";
  };

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAccessToken(null);
      setUser(null);
      persistUser(null);
      setActivePortalState(null);
      persistPortal(null);
    });
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setInitializing(false);
      return;
    }

    let cancelled = false;

    fetchCurrentUser()
      .then((nextUser) => {
        if (!cancelled) {
          setUser(nextUser);
          persistUser(nextUser);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAccessToken(null);
          setUser(null);
          persistUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setInitializing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();

    if (!isStrathmoreEmail(normalizedEmail)) {
      return {
        success: false,
        field: "email",
        error: STRATHMORE_EMAIL_ERROR,
      };
    }

    try {
      const { user: nextUser, redirectTo } = await loginRequest(
        normalizedEmail,
        normalizedPassword,
      );
      setUser(nextUser);
      persistUser(nextUser);
      return { success: true, redirectTo, user: nextUser };
    } catch (error) {
      if (error.status === 403 || error.status === 401) {
        return { success: false, error: "Invalid email or password." };
      }
      return {
        success: false,
        error: error.message || "Unable to sign in. Please try again.",
      };
    }
  };

  const signup = async ({ fullName, email, password, admissionNumber }) => {
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();
    const normalizedAdmissionNumber = admissionNumber.trim();

    if (!isStrathmoreEmail(normalizedEmail)) {
      return {
        success: false,
        field: "email",
        error: STRATHMORE_EMAIL_ERROR,
      };
    }

    try {
      const { email: registeredEmail } = await registerRequest({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password: normalizedPassword,
        admissionNumber: normalizedAdmissionNumber,
      });
      return { success: true, email: registeredEmail };
    } catch (error) {
      if (error.status === 409) {
        return {
          success: false,
          field: "email",
          error: "An account with this email already exists.",
        };
      }
      if (error.status === 400) {
        return {
          success: false,
          field: "email",
          error:
            typeof error.detail === "string"
              ? error.detail
              : STRATHMORE_EMAIL_ERROR,
        };
      }
      return {
        success: false,
        error: error.message || "Unable to create account. Please try again.",
      };
    }
  };

  const logout = () => {
    void logoutRequest().catch(() => {});
    setAccessToken(null);
    setUser(null);
    persistUser(null);
    setActivePortalState(null);
    persistPortal(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      signup,
      logout,
      initializing,
      isAuthenticated: Boolean(user),
      activePortal,
      availablePortals,
      setActivePortal,
      switchPortal,
    }),
    [user, initializing, activePortal, availablePortals],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
