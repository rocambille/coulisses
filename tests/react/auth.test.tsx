import { act, screen } from "@testing-library/react";
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
  expectContractCall,
  renderHookAsync,
  renderWithStub,
  requestValue,
  respond,
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
      await screen.findByText("hello, world!");
    });
    it("should fetch /api/me on mount", async () => {
      await renderWithStub(
        "/",
        () => <AuthProvider>hello, world!</AuthProvider>,
        ["/"],
      );
      await expectContractCall("auth", "me", "teacher");
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

      expect(auth.check()).toBe(auth.me != null);
    });
    it("should return a sendMagicLink function", async () => {
      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      const auth = result.current;

      await act(async () => await auth.sendMagicLink(teacherUser.email));

      expectContractCall("auth", "magic_link", "teacher");
    });
    it("should return a verifyMagicLink function", async () => {
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

      expectContractCall("auth", "verify", "new_user");
    });
    it("should return a logout function", async () => {
      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      const auth = result.current;

      await act(async () => await auth.logout());

      expectContractCall("auth", "logout", "anyone");
    });
    it("should throw when logout fails", async () => {
      setupMocks({
        forceFetch: () => respond(null, 500),
      });

      const { result } = await renderHookAsync(() => useAuth(), {
        wrapper: AuthProvider,
      });

      const auth = result.current;

      await expect(auth.logout()).rejects.toThrow(/logout/i);

      expectContractCall("auth", "logout", "anyone");
    });
  });
  describe("<MagicLinkForm />", () => {
    it("should mount successfully", async () => {
      await renderWithStub("/", MagicLinkForm, ["/"]);
      await screen.findByRole("button");
    });
    it("should submit email and show confirmation", async () => {
      const { user } = await renderWithStub("/", MagicLinkForm, ["/"]);
      await screen.findByRole("button");

      await user.type(screen.getByLabelText(/^email$/i), teacherUser.email);
      await user.click(screen.getByRole("button"));

      expectContractCall("auth", "magic_link", "teacher");
    });
  });
  describe("<LogoutForm />", () => {
    it("should mount successfully", async () => {
      await renderWithStub("/", LogoutForm, ["/"], {
        user: { id: 1, email: "foo@mail.com", name: "foo" },
      });
      await screen.findByRole("button");
    });
    it("should submit form logout", async () => {
      const { user } = await renderWithStub("/", LogoutForm, ["/"], {
        user: { id: 1, email: "foo@mail.com", name: "foo" },
      });
      await screen.findByRole("button");

      await user.click(screen.getByRole("button"));

      expectContractCall("auth", "logout", "anyone");
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

      await screen.findByText(/en cours/i);
    });
    it("should verify token and redirect to dashboard when valid", async () => {
      const mockedNavigate = vi.fn().mockImplementation((_to: string) => {});
      vi.spyOn(ReactRouter, "useNavigate").mockImplementation(
        () => mockedNavigate,
      );

      await renderWithStub("/verify", VerifyPage, [
        "/verify?token=fake_jwt_token",
      ]);

      expectContractCall("auth", "verify", "new_user");

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

      await screen.findByText(/invalide/i);

      expectContractCall("auth", "verify", "unauthorized");
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
    it("should display error when token is missing", async () => {
      const mockedNavigate = vi.fn().mockImplementation((_to: string) => {});
      vi.spyOn(ReactRouter, "useNavigate").mockImplementation(
        () => mockedNavigate,
      );

      await renderWithStub("/verify", VerifyPage, ["/verify"]);

      await screen.findByText(/invalide/i);

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
