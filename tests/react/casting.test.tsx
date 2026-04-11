import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CastingPage from "../../src/react/components/play/CastingPage";
import {
  expectCsrfCookie,
  expectFetchFrom,
  fromRequestBody,
  mainPlay,
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
    const label = new RegExp(
      `assigner.*${fromRequestBody("castings", "assign", "first_play", "roleId")}`,
      "i",
    );
    await user.selectOptions(
      screen.getByLabelText(label),
      fromRequestBody("castings", "assign", "first_play", "userId"),
    );

    expectCsrfCookie();
    expectFetchFrom("castings", "assign", "first_play");
  });

  it("should unassign a role successfully (teacher)", async () => {
    await renderWithStub(
      "/plays/:playId/casting",
      CastingPage,
      [`/plays/${mainPlay.id}/casting`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    const label = new RegExp(
      `assigner.*${fromRequestBody("castings", "unassign", "first_play", "roleId")}`,
      "i",
    );
    await user.selectOptions(screen.getByLabelText(label), "");

    expectCsrfCookie();
    expectFetchFrom("castings", "unassign", "first_play");
  });
});
