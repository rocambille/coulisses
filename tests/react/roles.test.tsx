import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RolesPage from "../../src/react/components/play/RolesPage";
import { invalidateCache } from "../../src/react/components/utils";
import {
  mockCsrfToken,
  mockedRandomUUID,
  mockFetch,
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

describe("<RolesPage />", () => {
  beforeEach(() => {
    invalidateCache("/api/plays/1/roles");
  });

  it("should mount successfully", async () => {
    const Stub = stubRoute("/plays/:playId/roles", RolesPage);

    await renderAsync(<Stub initialEntries={["/plays/1/roles"]} />);

    await waitFor(() => screen.getByRole("heading", { level: 2 }));
  });

  it("should display a message when the play has no roles", async () => {
    mockFetch((path, method) => {
      if (path === "/api/plays/1/roles" && method === "get") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify([]), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
        );
      }
    });

    const Stub = stubRoute("/plays/:playId/roles", RolesPage);

    await renderAsync(<Stub initialEntries={["/plays/1/roles"]} />);

    await waitFor(() => screen.getByText(/aucun rôle/i));
  });

  it("should add a new role successfully", async () => {
    const [location] = mockWindowLocation();

    const Stub = stubRoute("/plays/:playId/roles", RolesPage);

    await renderAsync(<Stub initialEntries={["/plays/1/roles"]} />);

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/nom/i), "Test");
    await user.click(screen.getByRole("button", { name: /ajouter/i }));

    expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
      expires: expect.any(Number),
      name: "__Host-x-csrf-token",
      path: "/",
      sameSite: "strict",
      value: mockedRandomUUID,
    });
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/plays/1/roles", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": mockedRandomUUID,
      },
      body: JSON.stringify({ name: "Test", description: null, sceneIds: [] }),
    });
    expect(location.reload).toHaveBeenCalled();
  });
});
