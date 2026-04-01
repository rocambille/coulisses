import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as ReactRouter from "react-router";

import {
  AuthProvider,
  useAuth,
} from "../../src/react/components/auth/AuthContext";
import LogoutForm from "../../src/react/components/auth/LogoutForm";
import MagicLinkForm from "../../src/react/components/auth/MagicLinkForm";
import VerifyPage from "../../src/react/components/auth/VerifyPage";
import { invalidateCache } from "../../src/react/components/utils";
import {
  mockCsrfToken,
  mockedRandomUUID,
  mockFetch,
  mockUseAuth,
  renderAsync,
  renderHookAsync,
  stubRoute,
} from "./utils";

beforeEach(() => {
  invalidateCache("/api/me");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("React auth components", () => {
  describe("<AuthProvider />", () => {
    beforeEach(() => {
      mockCsrfToken();
      mockFetch();
    });
    it("should render its children", async () => {
      const Stub = stubRoute("/", () => (
        <AuthProvider>hello, world!</AuthProvider>
      ));

      await renderAsync(<Stub initialEntries={["/"]} />);

      await waitFor(() => screen.getByText("hello, world!"));
    });
    it("should fetch /api/me on mount", async () => {
      const Stub = stubRoute("/", () => (
        <AuthProvider>hello, world!</AuthProvider>
      ));

      await renderAsync(<Stub initialEntries={["/"]} />);

      await waitFor(() =>
        expect(globalThis.fetch).toHaveBeenCalledWith("/api/me"),
      );
    });
  });
  describe("useAuth()", () => {
    beforeEach(() => {
      mockCsrfToken();
      mockFetch();
    });
    it("should be used within <AuthProvider>", async () => {
      // Avoid exception noise in console
      vi.spyOn(console, "error").mockImplementationOnce(() => {});

      await expect(renderHookAsync(() => useAuth())).rejects.toThrow(
        /\buseAuth\b.*\bwithin\b.*\bAuthProvider\b/i,
      );
    });
    it("should return an auth object", async () => {
      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() =>
        expect(globalThis.fetch).toHaveBeenCalledWith("/api/me"),
      );

      const auth = result.current;

      expect(auth).toBeDefined();
    });
    it("should return a check function", async () => {
      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() =>
        expect(globalThis.fetch).toHaveBeenCalledWith("/api/me"),
      );

      const auth = result.current;

      expect(typeof auth.check).toBe("function");

      expect(auth.check()).toBe(auth.me != null);
    });
    it("should return a sendMagicLink function", async () => {
      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() =>
        expect(globalThis.fetch).toHaveBeenCalledWith("/api/me"),
      );

      const auth = result.current;

      expect(typeof auth.sendMagicLink).toBe("function");

      await act(async () => await auth.sendMagicLink("foo@mail.com"));

      expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
        expires: expect.any(Number),
        name: "__Host-x-csrf-token",
        path: "/",
        sameSite: "strict",
        value: mockedRandomUUID,
      });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/auth/magic-link",
        expect.objectContaining({
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": mockedRandomUUID,
          },
          body: JSON.stringify({ email: "foo@mail.com" }),
        }),
      );
    });
    it("should return a verifyMagicLink function", async () => {
      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() =>
        expect(globalThis.fetch).toHaveBeenCalledWith("/api/me"),
      );

      const auth = result.current;

      expect(typeof auth.verifyMagicLink).toBe("function");

      await act(async () => await auth.verifyMagicLink("token"));

      expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
        expires: expect.any(Number),
        name: "__Host-x-csrf-token",
        path: "/",
        sameSite: "strict",
        value: mockedRandomUUID,
      });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/auth/verify",
        expect.objectContaining({
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": mockedRandomUUID,
          },
          body: JSON.stringify({ token: "token" }),
        }),
      );

      /* test behaviour when sending an invalid token */
      mockFetch((path, method) => {
        if (path === "/api/auth/verify" && method === "post") {
          return Promise.resolve().then(
            () =>
              new Response(null, {
                status: 401,
              }),
          );
        }
      });

      await expect(auth.verifyMagicLink("invalid-token")).rejects.toThrow(
        /invalid/i,
      );

      expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
        expires: expect.any(Number),
        name: "__Host-x-csrf-token",
        path: "/",
        sameSite: "strict",
        value: mockedRandomUUID,
      });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/auth/verify",
        expect.objectContaining({
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": mockedRandomUUID,
          },
          body: JSON.stringify({ token: "invalid-token" }),
        }),
      );
    });
    it("should return a logout function", async () => {
      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() =>
        expect(globalThis.fetch).toHaveBeenCalledWith("/api/me"),
      );

      const auth = result.current;

      expect(typeof auth.logout).toBe("function");

      await act(async () => await auth.logout());

      expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
        expires: expect.any(Number),
        name: "__Host-x-csrf-token",
        path: "/",
        sameSite: "strict",
        value: mockedRandomUUID,
      });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/auth/logout",
        expect.objectContaining({
          method: "post",
          headers: {
            "X-CSRF-Token": mockedRandomUUID,
          },
        }),
      );

      mockFetch((path, method) => {
        if (path === "/api/auth/logout" && method === "post") {
          return Promise.resolve().then(
            () =>
              new Response(null, {
                status: 401,
              }),
          );
        }
      });

      await expect(auth.logout()).rejects.toThrow(/logout/i);

      expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
        expires: expect.any(Number),
        name: "__Host-x-csrf-token",
        path: "/",
        sameSite: "strict",
        value: mockedRandomUUID,
      });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/auth/logout",
        expect.objectContaining({
          method: "post",
          headers: {
            "X-CSRF-Token": mockedRandomUUID,
          },
        }),
      );
    });
  });
  describe("<MagicLinkForm />", () => {
    it("should mount successfully", async () => {
      mockUseAuth(null);

      const Stub = stubRoute("/", MagicLinkForm);

      render(<Stub initialEntries={["/"]} />);

      await waitFor(() => screen.getByRole("button"));
    });
    it("should submit email and show confirmation", async () => {
      const [auth] = mockUseAuth(null);

      const Stub = stubRoute("/", MagicLinkForm);

      render(<Stub initialEntries={["/"]} />);

      await waitFor(() => screen.getByRole("button"));

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/^email$/i), "foo@mail.com");
      await user.click(screen.getByRole("button"));

      expect(auth.sendMagicLink).toHaveBeenCalledWith("foo@mail.com");
    });
  });
  describe("<LogoutForm />", () => {
    it("should mount successfully", async () => {
      mockUseAuth({ id: 1, email: "foo@mail.com", name: "foo" });

      const Stub = stubRoute("/", LogoutForm);

      render(<Stub initialEntries={["/"]} />);

      await waitFor(() => screen.getByRole("button"));
    });
    it("should submit form logout", async () => {
      const [auth] = mockUseAuth({ id: 1, email: "foo@mail.com", name: "foo" });

      const Stub = stubRoute("/", LogoutForm);

      render(<Stub initialEntries={["/"]} />);

      await waitFor(() => screen.getByRole("button"));

      const user = userEvent.setup();

      await user.click(screen.getByRole("button"));

      expect(auth.logout).toHaveBeenCalled();
    });
  });
  describe("<VerifyPage />", () => {
    it("should mount successfully", async () => {
      mockUseAuth(null);

      const mockedNavigate = vi.fn().mockImplementation((_to: string) => {});

      vi.spyOn(ReactRouter, "useNavigate").mockImplementation(
        () => mockedNavigate,
      );

      const Stub = stubRoute("/verify", VerifyPage);

      await renderAsync(<Stub initialEntries={["/verify?token=foo"]} />);

      await waitFor(() => screen.getByText(/en cours/i));
    });
    it("should verify token and redirect to dashboard when valid", async () => {
      const [auth] = mockUseAuth(null);

      vi.spyOn(auth, "verifyMagicLink").mockImplementation(async () => {});

      const mockedNavigate = vi.fn().mockImplementation((_to: string) => {});

      vi.spyOn(ReactRouter, "useNavigate").mockImplementation(
        () => mockedNavigate,
      );

      const Stub = stubRoute("/verify", VerifyPage);

      await renderAsync(<Stub initialEntries={["/verify?token=foo"]} />);

      await waitFor(() =>
        expect(auth.verifyMagicLink).toHaveBeenCalledWith("foo"),
      );

      expect(mockedNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
    it("should display error when token is invalid", async () => {
      const [auth] = mockUseAuth(null);

      vi.spyOn(auth, "verifyMagicLink").mockImplementation(async () => {
        throw new Error("Invalid or expired magic link");
      });

      const mockedNavigate = vi.fn().mockImplementation((_to: string) => {});

      vi.spyOn(ReactRouter, "useNavigate").mockImplementation(
        () => mockedNavigate,
      );

      const Stub = stubRoute("/verify", VerifyPage);

      await renderAsync(<Stub initialEntries={["/verify?token=foo"]} />);

      await waitFor(() => screen.getByText(/invalide/i));

      expect(auth.verifyMagicLink).toHaveBeenCalledWith("foo");
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
    it("should display error when token is missing", async () => {
      const [auth] = mockUseAuth(null);

      vi.spyOn(auth, "verifyMagicLink").mockImplementation(async () => {});

      const mockedNavigate = vi.fn().mockImplementation((_to: string) => {});

      vi.spyOn(ReactRouter, "useNavigate").mockImplementation(
        () => mockedNavigate,
      );

      const Stub = stubRoute("/verify", VerifyPage);

      await renderAsync(<Stub initialEntries={["/verify"]} />);

      await waitFor(() => screen.getByText(/invalide/i));

      expect(auth.verifyMagicLink).not.toHaveBeenCalled();
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });
});
