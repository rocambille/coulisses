import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  AuthProvider,
  useAuth,
} from "../../src/react/components/auth/AuthContext";
import LogoutForm from "../../src/react/components/auth/LogoutForm";
import MagicLinkForm from "../../src/react/components/auth/MagicLinkForm";

import {
  mockCsrfToken,
  mockedRandomUUID,
  mockFetch,
  mockUseAuth,
  stubRoute,
} from "./utils";

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

      render(<Stub initialEntries={["/"]} />);

      await waitFor(() => screen.getByText("hello, world!"));
    });
    it("should fetch /api/me on mount", async () => {
      const Stub = stubRoute("/", () => (
        <AuthProvider>hello, world!</AuthProvider>
      ));

      render(<Stub initialEntries={["/"]} />);

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

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow(/\buseAuth\b.*\bwithin\b.*\bAuthProvider\b/i);
    });
    it("should return an auth object", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

      await waitFor(() =>
        expect(globalThis.fetch).toHaveBeenCalledWith("/api/me"),
      );

      const auth = result.current;

      expect(auth).toBeDefined();
    });
    it("should return a check function", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

      await waitFor(() =>
        expect(globalThis.fetch).toHaveBeenCalledWith("/api/me"),
      );

      const auth = result.current;

      expect(typeof auth.check).toBe("function");

      expect(auth.check()).toBe(auth.user != null);
    });
    it("should return a sendMagicLink function", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

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
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

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
    });
    it("should return a logout function", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

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
});
