import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MembersPage from "../../src/react/components/play/MembersPage";
import { invalidateCache } from "../../src/react/components/utils";
import {
  expectFetchTo,
  mainPlay,
  renderWithStub,
  requestValue,
  setupMocks,
  teacherUser,
} from "./test-utils";

describe("React: MembersPage", () => {
  beforeEach(() => {
    setupMocks();
    invalidateCache(`/api/plays/${mainPlay.id}/members`);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should mount successfully", async () => {
    await renderWithStub(
      "/plays/:playId/members",
      MembersPage,
      [`/plays/${mainPlay.id}/members`],
      { user: teacherUser },
    );

    await waitFor(() => screen.getByRole("heading", { level: 2 }));
    expect(screen.getByText(/membres/i)).toBeDefined();
  });

  it("should display a message when the play has no members", async () => {
    setupMocks((path, method) => {
      if (path === `/api/plays/${mainPlay.id}/members` && method === "get") {
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
      "/plays/:playId/members",
      MembersPage,
      [`/plays/${mainPlay.id}/members`],
      { user: teacherUser },
    );

    await waitFor(() => screen.getByText(/aucun membre/i));
  });

  it("should add a new member successfully", async () => {
    await renderWithStub(
      "/plays/:playId/members",
      MembersPage,
      [`/plays/${mainPlay.id}/members`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    await user.type(
      screen.getByLabelText(/email/i),
      requestValue("members", "invite", "teacher", "email"),
    );
    await user.click(screen.getByRole("button", { name: /inviter/i }));

    expectFetchTo("members", "invite", "teacher");
  });
});
