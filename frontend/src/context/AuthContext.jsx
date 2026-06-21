import { createContext, useContext, useMemo, useState } from "react";
import { mockUsers } from "../data/mockUsers";

const AuthContext = createContext(null);

const STORAGE_KEY = "peerpoint_user";
const REGISTERED_USERS_KEY = "peerpoint_registered_users";
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

function loadCustomUsers() {
  try {
    const stored = localStorage.getItem(REGISTERED_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function persistCustomUsers(customUsers) {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(customUsers));
}

function getAllRegisteredUsers(customUsers) {
  const mockEmails = new Set(mockUsers.map((entry) => entry.email.toLowerCase()));
  const extras = customUsers.filter(
    (entry) => !mockEmails.has(entry.email.toLowerCase())
  );

  return [...mockUsers, ...extras];
}

function toPublicUser(account) {
  return {
    id: account.id,
    fullName: account.fullName,
    email: account.email,
    role: account.role,
    isVerified: account.isVerified,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadStoredUser());
  const [customUsers, setCustomUsers] = useState(() => loadCustomUsers());

  const persistUser = (nextUser) => {
    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setUser(nextUser);
  };

  const login = (email, password) => {
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();

    if (!isStrathmoreEmail(normalizedEmail)) {
      return {
        success: false,
        field: "email",
        error: STRATHMORE_EMAIL_ERROR,
      };
    }

    const account = getAllRegisteredUsers(customUsers).find(
      (entry) =>
        entry.email.toLowerCase() === normalizedEmail.toLowerCase() &&
        entry.password === normalizedPassword
    );

    if (!account) {
      return { success: false, error: "Invalid email or password." };
    }

    const publicUser = toPublicUser(account);
    persistUser(publicUser);

    let redirectTo = "/";
    if (account.role === "student") {
      redirectTo = "/student";
    } else if (account.role === "counsellor") {
      redirectTo = account.isVerified ? "/counsellor" : "/pending-approval";
    } else if (account.role === "admin") {
      redirectTo = "/admin";
    }

    return { success: true, redirectTo };
  };

  const signup = ({ fullName, email, password, role }) => {
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();

    if (!isStrathmoreEmail(normalizedEmail)) {
      return {
        success: false,
        field: "email",
        error: STRATHMORE_EMAIL_ERROR,
      };
    }

    const allUsers = getAllRegisteredUsers(customUsers);
    const exists = allUsers.some(
      (entry) => entry.email.toLowerCase() === normalizedEmail.toLowerCase()
    );

    if (exists) {
      return {
        success: false,
        field: "email",
        error: "An account with this email already exists.",
      };
    }

    const nextId =
      allUsers.reduce((max, entry) => Math.max(max, entry.id), 0) + 1;

    const newAccount = {
      id: nextId,
      fullName,
      email: normalizedEmail,
      password: normalizedPassword,
      role,
      isVerified: role !== "counsellor",
    };

    const nextCustomUsers = [...customUsers, newAccount];
    setCustomUsers(nextCustomUsers);
    persistCustomUsers(nextCustomUsers);

    const publicUser = toPublicUser(newAccount);
    persistUser(publicUser);

    let redirectTo = "/";
    if (role === "student") {
      redirectTo = "/student";
    } else if (role === "counsellor") {
      redirectTo = newAccount.isVerified ? "/counsellor" : "/pending-approval";
    } else if (role === "admin") {
      redirectTo = "/admin";
    }

    return { success: true, redirectTo };
  };

  const logout = () => {
    persistUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      signup,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, customUsers]
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
