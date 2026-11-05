/*
  Purpose:
  Centralize current user (me) session state and actions for the React application.

  This context:
  - Stores the currently authenticated user (or null)
  - Exposes authentication actions (sendMagicLink, verifyMagicLink, logout)
  - Exposes profile management actions (updateMe, deleteMe, uploadMeAvatar)

  Usage:
  - Wrap the app with <MeProvider>
  - Access user state and actions via the useMe() hook
*/

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from "react";
import { getOrFetch } from "../../helpers/cache";
import { mutate } from "../../helpers/mutate";
import { disablePush } from "../../helpers/push";

/* ************************************************************************ */
/* Types                                                                    */
/* ************************************************************************ */

type MeContextType = {
  user: User | null;
  isAuthenticated: boolean;
  // next: the page the link of the email opens once logged in
  sendMagicLink: (email: string, next?: string) => Promise<void>;
  verifyMagicLink: (token: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutEverywhere: () => Promise<void>;
  // Resolves with the address waiting for confirmation, if the email changed
  updateMe: (
    newMe: Omit<User, "id" | "created_at" | "deleted_at" | "avatar_url">,
  ) => Promise<{ pendingEmail: string | null }>;
  confirmEmail: (code: string) => Promise<void>;
  updateMeAvatar: (fileOrNull: File | null) => Promise<void>;
  deleteMe: () => Promise<void>;
};

/* ************************************************************************ */
/* Context                                                                  */
/* ************************************************************************ */

const MeContext = createContext<MeContextType | null>(null);

/* ************************************************************************ */
/* Provider                                                                 */
/* ************************************************************************ */

export function MeProvider({
  children,
  initialUser,
}: PropsWithChildren<{ initialUser?: User | null }>) {
  /* ********************************************************************** */
  /* User state                                                             */
  /* ********************************************************************** */

  const [user, setUser] = useState<User | null>(initialUser ?? null);

  /* ********************************************************************** */
  /* Actions                                                                */
  /* ********************************************************************** */

  const sendMagicLink = useCallback(async (email: string, next?: string) => {
    await mutate(
      "/api/auth/magic-link",
      "post",
      next == null ? { email } : { email, next },
    );
  }, []);

  const verifyMagicLink = useCallback(async (token: string) => {
    const response = await mutate("/api/auth/verify", "post", { token });
    const data: User = await response.json();
    setUser(data);
  }, []);

  const verifyCode = useCallback(async (email: string, code: string) => {
    const response = await mutate("/api/auth/verify-code", "post", {
      email,
      code,
    });
    const data: User = await response.json();
    setUser(data);
  }, []);

  const logout = useCallback(async () => {
    // Before the session ends, so a shared device stops receiving the alerts
    // of this account. This must never prevent logging out.
    await disablePush().catch(() => {});

    await mutate("/api/auth/logout", "post");

    setUser(null);
  }, []);

  const logoutEverywhere = useCallback(async () => {
    await disablePush().catch(() => {});

    await mutate("/api/auth/logout-everywhere", "post");

    setUser(null);
  }, []);

  const updateMe = useCallback(
    async (
      newMe: Omit<User, "id" | "created_at" | "deleted_at" | "avatar_url">,
    ) => {
      const response = await mutate(
        "/api/users/me",
        "put",
        newMe,
        "/api/users/me",
      );

      setUser(await getOrFetch<User | null>("/api/users/me"));

      if (response.status !== 202) {
        return { pendingEmail: null };
      }

      const { pending_email }: { pending_email: string } =
        await response.json();

      return { pendingEmail: pending_email };
    },
    [],
  );

  const confirmEmail = useCallback(async (code: string) => {
    const response = await mutate(
      "/api/users/me/email",
      "post",
      { code },
      "/api/users/me",
    );
    const data: User = await response.json();
    setUser(data);
  }, []);

  const updateMeAvatar = useCallback(async (fileOrNull: File | null) => {
    if (fileOrNull == null) {
      await mutate("/api/users/me/avatar", "delete", null, "/api/users/me");
    } else {
      const formData = new FormData();
      formData.append("avatar", fileOrNull);

      await mutate("/api/users/me/avatar", "post", formData, "/api/users/me");
    }

    setUser(await getOrFetch<User | null>("/api/users/me"));
  }, []);

  const deleteMe = useCallback(async () => {
    await mutate("/api/users/me", "delete");

    setUser(null);
  }, []);

  /* ********************************************************************** */
  /* Provider value                                                         */
  /* ********************************************************************** */

  return (
    <MeContext
      value={{
        user,
        isAuthenticated: user != null,
        sendMagicLink,
        verifyMagicLink,
        verifyCode,
        logout,
        logoutEverywhere,
        updateMe,
        confirmEmail,
        updateMeAvatar,
        deleteMe,
      }}
    >
      {children}
    </MeContext>
  );
}

/* ************************************************************************ */
/* Consumer hook                                                            */
/* ************************************************************************ */

export const useMe = () => {
  const value = useContext(MeContext);

  if (value == null) {
    throw new Error("useMe has to be used within <MeProvider />");
  }

  return value;
};
