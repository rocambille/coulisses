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
  expectCsrfCookie,
  expectFetch,
  expectNoFetch,
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
      await waitFor(() => expectFetch("/api/me", "get"));
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

      await waitFor(() => expectFetch("/api/me", "get"));

      const auth = result.current;

      expect(auth).toBeDefined();
    });
    it("should return a check function", async () => {
      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => expectFetch("/api/me", "get"));

      const auth = result.current;

      expect(typeof auth.check).toBe("function");

      expect(auth.check()).toBe(auth.me != null);
    });
    it("should return a sendMagicLink function", async () => {
      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => expectFetch("/api/me", "get"));

      const auth = result.current;

      expect(typeof auth.sendMagicLink).toBe("function");

      await act(async () => await auth.sendMagicLink("foo@mail.com"));

      expectCsrfCookie();
      expectFetch("/api/auth/magic-link", "post", { email: "foo@mail.com" });
    });
    it("should return a verifyMagicLink function", async () => {
      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => expectFetch("/api/me", "get"));

      const auth = result.current;

      expect(typeof auth.verifyMagicLink).toBe("function");

      await act(async () => await auth.verifyMagicLink("token"));

      expectCsrfCookie();
      expectFetch("/api/auth/verify", "post", { token: "token" });

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

      expectCsrfCookie();
      expectFetch("/api/auth/verify", "post", { token: "invalid-token" });
    });
    it("should return a logout function", async () => {
      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => expectFetch("/api/me", "get"));

      const auth = result.current;

      expect(typeof auth.logout).toBe("function");

      await act(async () => await auth.logout());

      expectCsrfCookie();
      expectFetch("/api/auth/logout", "post");
    });
    it("should return a logout function", async () => {
      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => expectFetch("/api/me", "get"));

      const auth = result.current;

      expect(typeof auth.logout).toBe("function");

      await act(async () => await auth.logout());

      expectCsrfCookie();
      expectFetch("/api/auth/logout", "post");

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

      expectCsrfCookie();
      expectFetch("/api/auth/logout", "post");
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

      expectFetch("/api/auth/magic-link", "post", { email: "foo@mail.com" });
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

      expectFetch("/api/auth/logout", "post");
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
        expectFetch("/api/auth/verify", "post", { token: "foo" }),
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

      expectFetch("/api/auth/verify", "post", { token: "foo" });
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
    it("should display error when token is missing", async () => {
      const mockedNavigate = vi.fn().mockImplementation((_to: string) => {});
      vi.spyOn(ReactRouter, "useNavigate").mockImplementation(
        () => mockedNavigate,
      );

      await renderWithStub("/verify", VerifyPage, ["/verify"]);

      await waitFor(() => screen.getByText(/invalide/i));

      expectNoFetch("/api/auth/verify", "post");
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });
});
