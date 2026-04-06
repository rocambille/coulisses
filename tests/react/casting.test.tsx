import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CastingPage from "../../src/react/components/play/CastingPage";
import {
  actorUser,
  expectCsrfCookie,
  expectFetch,
  mainPlay,
  mainRoles,
  renderWithStub,
  setupApiMocks,
  teacherUser,
} from "./mocks";

describe("React: CastingPage", () => {
  beforeEach(() => {
    setupApiMocks();
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

    expectCsrfCookie();
    expectFetch(`/api/plays/${mainPlay.id}/castings`, "post", {
      roleId: mainRoles[0].id,
      userId: actorUser.id,
    });
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

    expectCsrfCookie();
    expectFetch(`/api/plays/${mainPlay.id}/castings`, "delete", {
      roleId: mainRoles[0].id,
      userId: actorUser.id,
    });
  });
});
