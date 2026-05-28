import { screen } from "@testing-library/react";
import Layout from "../../../src/react/components/Layout";
import { renderWithStub, setupMocks, teacherUser } from "../test-utils";

describe("<Layout />", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("should mount successfully", async () => {
    await renderWithStub({
      path: "/",
      Component: () => <Layout />,
      initialEntries: ["/"],
      me: null,
    });

    await screen.findByRole("navigation");
  });

  it("should render magic link form when not authenticated", async () => {
    await renderWithStub({
      path: "/",
      Component: () => <Layout />,
      initialEntries: ["/"],
      me: null,
    });

    await screen.findByLabelText(/email/i);
  });

  it("should render account page when authenticated", async () => {
    await renderWithStub({
      path: "/",
      Component: () => <Layout />,
      initialEntries: ["/"],
      me: teacherUser,
    });

    await screen.findByText(/compte/i);
  });
});
