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
  expectFetchTo,
  mockFetch,
  renderHookAsync,
  renderWithStub,
  requestValue,
  setupMocks,
  teacherUser,
} from "./test-utils";

describe("React auth components", () => {
  beforeEach(() => {
    setupMocks();
    invalidateCache("/api/me");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  describe("<AuthProvider />", () => {
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
      await waitFor(() => expectFetchTo("auth", "me", "teacher"));
    });
  });
  describe("useAuth()", () => {
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

      const auth = result.current;

      expect(auth).toBeDefined();
    });
    it("should return a check function", async () => {
      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      const auth = result.current;

      expect(typeof auth.check).toBe("function");

      expect(auth.check()).toBe(auth.me != null);
    });
    it("should return a sendMagicLink function", async () => {
      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      const auth = result.current;

      expect(typeof auth.sendMagicLink).toBe("function");

      await act(async () => await auth.sendMagicLink(teacherUser.email));

      expectFetchTo("auth", "magic_link", "teacher");
    });
    it("should return a verifyMagicLink function", async () => {
      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      const auth = result.current;

      expect(typeof auth.verifyMagicLink).toBe("function");
    });
    it("should verify a magic link", async () => {
      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      const auth = result.current;

      await act(
        async () =>
          await auth.verifyMagicLink(
            requestValue("auth", "verify", "new_user", "token"),
          ),
      );

      expectFetchTo("auth", "verify", "new_user");
    });
    it("should return a logout function", async () => {
      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      const auth = result.current;

      expect(typeof auth.logout).toBe("function");

      await act(async () => await auth.logout());

      expectFetchTo("auth", "logout", "anyone");
    });
    it("should throw when logout fails", async () => {
      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      const auth = result.current;

      expect(typeof auth.logout).toBe("function");

      mockFetch((path, method) => {
        if (path === "/api/auth/logout" && method === "post") {
          return Promise.resolve().then(
            () =>
              new Response(null, {
                status: 500,
              }),
          );
        }
      });

      await expect(auth.logout()).rejects.toThrow(/logout/i);

      expectFetchTo("auth", "logout", "anyone");
    });
  });
  describe("<MagicLinkForm />", () => {
    it("should mount successfully", async () => {
      await renderWithStub("/", MagicLinkForm, ["/"]);
      await waitFor(() => screen.getByRole("button"));
    });
    it("should submit email and show confirmation", async () => {
      await renderWithStub("/", MagicLinkForm, ["/"]);
      await waitFor(() => screen.getByRole("button"));

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/^email$/i), teacherUser.email);
      await user.click(screen.getByRole("button"));

      expectFetchTo("auth", "magic_link", "teacher");
    });
  });
  describe("<LogoutForm />", () => {
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

      expectFetchTo("auth", "logout", "anyone");
    });
  });
  describe("<VerifyPage />", () => {
    it("should mount successfully", async () => {
      const mockedNavigate = vi.fn().mockImplementation((_to: string) => {});
      vi.spyOn(ReactRouter, "useNavigate").mockImplementation(
        () => mockedNavigate,
      );

      await renderWithStub("/verify", VerifyPage, [
        "/verify?token=fake_jwt_token",
      ]);

      await waitFor(() => screen.getByText(/en cours/i));
    });
    it("should verify token and redirect to dashboard when valid", async () => {
      const mockedNavigate = vi.fn().mockImplementation((_to: string) => {});
      vi.spyOn(ReactRouter, "useNavigate").mockImplementation(
        () => mockedNavigate,
      );

      await renderWithStub("/verify", VerifyPage, [
        "/verify?token=fake_jwt_token",
      ]);

      await waitFor(() => expectFetchTo("auth", "verify", "new_user"));

      expect(mockedNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
    it("should display error when token is invalid", async () => {
      const mockedNavigate = vi.fn().mockImplementation((_to: string) => {});
      vi.spyOn(ReactRouter, "useNavigate").mockImplementation(
        () => mockedNavigate,
      );

      await renderWithStub("/verify", VerifyPage, [
        "/verify?token=invalid_jwt_token",
      ]);

      await waitFor(() => screen.getByText(/invalide/i));

      expectFetchTo("auth", "verify", "unauthorized");
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
        expect.objectContaining({
          method: "post",
        }),
      );
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });
});
