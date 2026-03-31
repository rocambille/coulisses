import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "../../src/react/components/DashboardPage";
import Layout from "../../src/react/components/Layout";
import { mockedData } from "../api/utils";
import {
  mockCsrfToken,
  mockedRandomUUID,
  mockFetch,
  mockUseAuth,
  renderAsync,
  stubRoute,
} from "./utils";

beforeEach(() => {
  mockCsrfToken();
  mockFetch();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("React base components", () => {
  describe("<DashboardPage />", () => {
    it("should mount successfully", async () => {
      mockUseAuth(mockedData.user[0]);

      const Stub = stubRoute("/", DashboardPage);

      await renderAsync(<Stub initialEntries={["/"]} />);

      await waitFor(() =>
        screen.getByRole("heading", { level: 1, name: /mes pièces/i }),
      );
    });

    it("should add a play", async () => {
      mockUseAuth(mockedData.user[0]);

      const Stub = stubRoute("/", DashboardPage);

      await renderAsync(<Stub initialEntries={["/"]} />);

      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/titre/i), "Test");
      await user.click(screen.getByRole("button", { name: /ajouter/i }));

      expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
        expires: expect.any(Number),
        name: "__Host-x-csrf-token",
        path: "/",
        sameSite: "strict",
        value: mockedRandomUUID,
      });
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/plays", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": mockedRandomUUID,
        },
        body: JSON.stringify({
          title: "Test",
        }),
      });
    });
  });
  describe("<Layout />", () => {
    it("should mount successfully", async () => {
      mockUseAuth(mockedData.user[0]);

      const Stub = stubRoute("/", () => <Layout />);

      await renderAsync(<Stub initialEntries={["/"]} />);

      await waitFor(() => screen.getByRole("navigation"));
    });
    it("should render its children when authenticated", async () => {
      mockUseAuth(mockedData.user[0]);

      const Stub = stubRoute("/", () => <Layout>hello, world!</Layout>);

      await renderAsync(<Stub initialEntries={["/"]} />);

      await waitFor(() => screen.getByText("hello, world!"));
    });
    it("should render magic link form when not authenticated", async () => {
      mockUseAuth(null);

      const Stub = stubRoute("/", () => <Layout>hello, world!</Layout>);

      await renderAsync(<Stub initialEntries={["/"]} />);

      await waitFor(() => screen.getByLabelText(/email/i));
    });
  });
});
