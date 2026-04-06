import { act, screen, waitFor } from "@testing-library/react";
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
  mockedRandomUUID,
  mockFetch,
  renderHookAsync,
  renderWithStub,
  setupApiMocks,
} from "./mocks";

describe("React auth components", () => {
  beforeEach(() => {
    invalidateCache("/api/me");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  describe("<AuthProvider />", () => {
    beforeEach(() => {
      setupApiMocks();
    });
    it("should render its children", async () => {
      await renderWithStub(
        "/",
        () => <AuthProvider>hello, world!</AuthProvider>,
        ["/"],
      );
      await waitFor(() => screen.getByText("hello, world!"));
    });
    it("should fetch /api/me on mount", async () => {
      await renderWithStub(
        "/",
        () => <AuthProvider>hello, world!</AuthProvider>,
        ["/"],
      );
      await waitFor(() =>
        expect(globalThis.fetch).toHaveBeenCalledWith("/api/me"),
      );
    });
  });
  describe("useAuth()", () => {
    beforeEach(() => {
      setupApiMocks();
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
    beforeEach(() => {
      setupApiMocks();
    });
    it("should mount successfully", async () => {
      await renderWithStub("/", MagicLinkForm, ["/"]);
      await waitFor(() => screen.getByRole("button"));
    });
    it("should submit email and show confirmation", async () => {
      await renderWithStub("/", MagicLinkForm, ["/"]);
      await waitFor(() => screen.getByRole("button"));

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/^email$/i), "foo@mail.com");
      await user.click(screen.getByRole("button"));

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/auth/magic-link",
        expect.objectContaining({
          method: "post",
          body: JSON.stringify({ email: "foo@mail.com" }),
        }),
      );
    });
  });
  describe("<LogoutForm />", () => {
    beforeEach(() => {
      setupApiMocks();
    });
    it("should mount successfully", async () => {
      await renderWithStub("/", LogoutForm, ["/"], {
        user: { id: 1, email: "foo@mail.com", name: "foo" },
      });
      await waitFor(() => screen.getByRole("button"));
    });
    it("should submit form logout", async () => {
      await renderWithStub("/", LogoutForm, ["/"], {
        user: { id: 1, email: "foo@mail.com", name: "foo" },
      });
      await waitFor(() => screen.getByRole("button"));

      const user = userEvent.setup();

      await user.click(screen.getByRole("button"));

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
  describe("<VerifyPage />", () => {
    beforeEach(() => {
      setupApiMocks();
    });
    it("should mount successfully", async () => {
      const mockedNavigate = vi.fn().mockImplementation((_to: string) => {});
      vi.spyOn(ReactRouter, "useNavigate").mockImplementation(
        () => mockedNavigate,
      );

      await renderWithStub("/verify", VerifyPage, ["/verify?token=foo"]);

      await waitFor(() => screen.getByText(/en cours/i));
    });
    it("should verify token and redirect to dashboard when valid", async () => {
      const mockedNavigate = vi.fn().mockImplementation((_to: string) => {});
      vi.spyOn(ReactRouter, "useNavigate").mockImplementation(
        () => mockedNavigate,
      );

      await renderWithStub("/verify", VerifyPage, ["/verify?token=foo"]);

      await waitFor(() =>
        expect(globalThis.fetch).toHaveBeenCalledWith(
          "/api/auth/verify",
          expect.objectContaining({
            method: "post",
            body: JSON.stringify({ token: "foo" }),
          }),
        ),
      );

      expect(mockedNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
    it("should display error when token is invalid", async () => {
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
      const mockedNavigate = vi.fn().mockImplementation((_to: string) => {});
      vi.spyOn(ReactRouter, "useNavigate").mockImplementation(
        () => mockedNavigate,
      );

      await renderWithStub("/verify", VerifyPage, ["/verify?token=foo"]);

      await waitFor(() => screen.getByText(/invalide/i));

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/auth/verify",
        expect.objectContaining({
          method: "post",
          body: JSON.stringify({ token: "foo" }),
        }),
      );
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
    it("should display error when token is missing", async () => {
      const mockedNavigate = vi.fn().mockImplementation((_to: string) => {});
      vi.spyOn(ReactRouter, "useNavigate").mockImplementation(
        () => mockedNavigate,
      );

      await renderWithStub("/verify", VerifyPage, ["/verify"]);

      await waitFor(() => screen.getByText(/invalide/i));

      expect(globalThis.fetch).not.toHaveBeenCalledWith(
        "/api/auth/verify",
        expect.anything(),
      );
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });
});
