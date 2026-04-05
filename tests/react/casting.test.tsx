import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CastingPage from "../../src/react/components/play/CastingPage";
import {
  actorUser,
  mainPlay,
  mainRoles,
  mockedRandomUUID,
  renderWithStub,
  setupMocks,
  teacherUser,
} from "./mocks";

describe("React: CastingPage", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should mount successfully", async () => {
    await renderWithStub(
      "/plays/:playId/casting",
      CastingPage,
      [`/plays/${mainPlay.id}/casting`],
      { user: teacherUser },
    );

    await waitFor(() => screen.getByRole("heading", { level: 2 }));
    expect(screen.getByText(/casting/i)).toBeDefined();
  });

  it("should assign a role successfully (teacher)", async () => {
    await renderWithStub(
      "/plays/:playId/casting",
      CastingPage,
      [`/plays/${mainPlay.id}/casting`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    // Specific label matching the first role
    const label = new RegExp(`assigner.*${mainRoles[0].name}`, "i");
    await user.selectOptions(
      screen.getByLabelText(label),
      actorUser.id.toString(),
    );

    expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
      expires: expect.any(Number),
      name: "__Host-x-csrf-token",
      path: "/",
      sameSite: "strict",
      value: mockedRandomUUID,
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `/api/plays/${mainPlay.id}/castings`,
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": mockedRandomUUID,
        },
        body: JSON.stringify({ roleId: mainRoles[0].id, userId: actorUser.id }),
      },
    );
  });

  it("should unassign a role successfully (teacher)", async () => {
    await renderWithStub(
      "/plays/:playId/casting",
      CastingPage,
      [`/plays/${mainPlay.id}/casting`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    const label = new RegExp(`assigner.*${mainRoles[0].name}`, "i");
    await user.selectOptions(screen.getByLabelText(label), "");

    expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
      expires: expect.any(Number),
      name: "__Host-x-csrf-token",
      path: "/",
      sameSite: "strict",
      value: mockedRandomUUID,
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `/api/plays/${mainPlay.id}/castings`,
      {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": mockedRandomUUID,
        },
        body: JSON.stringify({ roleId: mainRoles[0].id, userId: actorUser.id }),
      },
    );
  });
});
