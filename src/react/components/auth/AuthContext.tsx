/*
  Purpose:
  Centralize authentication state and actions for the React application.

  This context:
  - Stores the currently authenticated user (or null)
  - Exposes high-level auth actions (sendMagicLink, verifyMagicLink, logout)
  - Performs an initial session check on mount (/api/me)

  Usage:
  - Wrap the app with <AuthProvider>
  - Access auth state and actions via the useAuth() hook
*/

import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useContext,
  useState,
} from "react";

import { cache, csrfToken } from "../utils";

/* ************************************************************************ */
/* Types                                                                    */
/* ************************************************************************ */

type AuthContextType = {
  me: User | null;
  check: () => boolean;
  sendMagicLink: (email: string) => Promise<void>;
  verifyMagicLink: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

/* ************************************************************************ */
/* Context                                                                  */
/* ************************************************************************ */

const AuthContext = createContext<AuthContextType | null>(null);

/* ************************************************************************ */
/* Provider                                                                 */
/* ************************************************************************ */

export function AuthProvider({ children }: PropsWithChildren) {
  /* ********************************************************************** */
  /* Initial session check                                                 */
  /* ********************************************************************** */

  const [user, setUser] = useState<User | null>(use(cache("/api/me")));

  /* ********************************************************************** */
  /* Actions                                                                */
  /* ********************************************************************** */

  const sendMagicLink = useCallback(async (email: string) => {
    await fetch("/api/auth/magic-link", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": await csrfToken(),
      },
      body: JSON.stringify({ email }),
    });
  }, []);

  const verifyMagicLink = useCallback(async (token: string) => {
    const response = await fetch("/api/auth/verify", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": await csrfToken(),
      },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      const data: User = await response.json();
      setUser(data);
    } else {
      throw new Error("Invalid or expired magic link");
    }
  }, []);

  const logout = useCallback(async () => {
    const response = await fetch("/api/auth/logout", {
      method: "post",
      headers: {
        "X-CSRF-Token": await csrfToken(),
      },
    });

    if (response.ok) {
      setUser(null);
    } else {
      throw new Error("Logout failed");
    }
  }, []);

  /* ********************************************************************** */
  /* Provider value                                                         */
  /* ********************************************************************** */

  return (
    <AuthContext
      value={{
        me: user,
        check: () => user != null,
        sendMagicLink,
        verifyMagicLink,
        logout,
      }}
    >
      {children}
    </AuthContext>
  );
}

/* ************************************************************************ */
/* Consumer hook                                                            */
/* ************************************************************************ */

export const useAuth = () => {
  const value = useContext(AuthContext);

  if (value == null) {
    throw new Error("useAuth has to be used within <AuthProvider />");
  }

  return value;
};
