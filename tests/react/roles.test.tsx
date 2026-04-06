import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RolesPage from "../../src/react/components/play/RolesPage";
import { invalidateCache } from "../../src/react/components/utils";
import {
  mainPlay,
  mockedRandomUUID,
  renderWithStub,
  setupApiMocks,
  teacherUser,
} from "./mocks";

describe("React: RolesPage", () => {
  beforeEach(() => {
    setupApiMocks();
    invalidateCache(`/api/plays/${mainPlay.id}/roles`);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should mount successfully", async () => {
    await renderWithStub(
      "/plays/:playId/roles",
      RolesPage,
      [`/plays/${mainPlay.id}/roles`],
      { user: teacherUser },
    );

    await waitFor(() => screen.getByRole("heading", { level: 2 }));
    expect(screen.getByText(/rôles/i)).toBeDefined();
  });

  it("should display a message when the play has no roles", async () => {
    setupApiMocks((path, method) => {
      if (path === `/api/plays/${mainPlay.id}/roles` && method === "get") {
        return Promise.resolve().then(
          () =>
            new Response(JSON.stringify([]), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
        );
      }
    });

    await renderWithStub(
      "/plays/:playId/roles",
      RolesPage,
      [`/plays/${mainPlay.id}/roles`],
      { user: teacherUser },
    );

    await waitFor(() => screen.getByText(/aucun rôle/i));
  });

  it("should add a new role successfully", async () => {
    await renderWithStub(
      "/plays/:playId/roles",
      RolesPage,
      [`/plays/${mainPlay.id}/roles`],
      { user: teacherUser },
    );

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
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `/api/plays/${mainPlay.id}/roles`,
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": mockedRandomUUID,
        },
        body: JSON.stringify({ name: "Test", description: null, sceneIds: [] }),
      },
    );
  });
});
