import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "../../src/react/components/DashboardPage";
import { invalidateCache } from "../../src/react/components/utils";
import {
  mockCsrfToken,
  mockedRandomUUID,
  mockedUsers,
  mockFetch,
  mockUseAuth,
  mockWindowLocation,
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

describe("<DashboardPage />", () => {
  beforeEach(() => {
    invalidateCache("/api/plays");
  });
  it("should throw when not authenticated", async () => {
    mockUseAuth(null);

    const Stub = stubRoute("/", DashboardPage);

    await expect(renderAsync(<Stub initialEntries={["/"]} />)).rejects.toThrow(
      "User not authenticated",
    );
  });
  it("should mount successfully", async () => {
    mockUseAuth(mockedUsers[0]);

    const Stub = stubRoute("/", DashboardPage);

    await renderAsync(<Stub initialEntries={["/"]} />);

    await waitFor(() =>
      screen.getByRole("heading", { level: 1, name: /mes pièces/i }),
    );
  });

  it("should display a message when the user has no plays", async () => {
    mockUseAuth(mockedUsers[2]);
    mockFetch((path, method) => {
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

    const Stub = stubRoute("/", DashboardPage);

    await renderAsync(<Stub initialEntries={["/"]} />);

    await waitFor(() => screen.getByText(/aucune pièce/i));
  });

  it("should add a play", async () => {
    mockUseAuth(mockedUsers[0]);
    const [location] = mockWindowLocation();

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
    expect(location.reload).toHaveBeenCalled();
  });
});
