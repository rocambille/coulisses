import { screen, waitFor } from "@testing-library/react";
import Layout from "../../src/react/components/Layout";
import {
  mockCsrfToken,
  mockedUsers,
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
  describe("<Layout />", () => {
    it("should mount successfully", async () => {
      mockUseAuth(mockedUsers[0]);

      const Stub = stubRoute("/", () => <Layout />);

      await renderAsync(<Stub initialEntries={["/"]} />);

      await waitFor(() => screen.getByRole("navigation"));
    });
    it("should render its children when authenticated", async () => {
      mockUseAuth(mockedUsers[0]);

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
