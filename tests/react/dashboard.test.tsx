import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "../../src/react/components/DashboardPage";
import { invalidateCache } from "../../src/react/components/utils";
import {
  expectFetchTo,
  renderWithStub,
  requestValue,
  setupMocks,
  teacherUser,
  thirdUser,
} from ".";

describe("<DashboardPage />", () => {
  beforeEach(() => {
    setupMocks();
    invalidateCache("/api/plays");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("should throw when not authenticated", async () => {
    await expect(
      renderWithStub("/", DashboardPage, ["/"], { user: null }),
    ).rejects.toThrow("User not authenticated");
  });
  it("should mount successfully", async () => {
    await renderWithStub("/", DashboardPage, ["/"], { user: teacherUser });

    await waitFor(() =>
      screen.getByRole("heading", { level: 1, name: /mes pièces/i }),
    );
  });

  it("should display a message when the user has no plays", async () => {
    setupMocks((path, method) => {
      if (path === "/api/plays" && method === "get") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify([]), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
        );
      }
    });

    await renderWithStub("/", DashboardPage, ["/"], { user: thirdUser });

    await waitFor(() => screen.getByText(/aucune pièce/i));
  });

  it("should add a play", async () => {
    await renderWithStub("/", DashboardPage, ["/"], { user: teacherUser });

    const user = userEvent.setup();

    await user.type(
      screen.getByLabelText(/titre/i),
      requestValue("plays", "create", "teacher", "title"),
    );
    await user.click(screen.getByRole("button", { name: /ajouter/i }));

    expectFetchTo("plays", "create", "teacher");
  });
});
