import { screen } from "@testing-library/react";
import MembersPage from "../../src/react/components/play/MembersPage";
import { invalidateCache } from "../../src/react/components/utils";
import {
  expectContractCall,
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

    await screen.findByRole("heading", { level: 2 });
    expect(screen.getByText(/membres/i)).toBeDefined();
  });

  it("should add a new member successfully", async () => {
    const { user } = await renderWithStub(
      "/plays/:playId/members",
      MembersPage,
      [`/plays/${mainPlay.id}/members`],
      { user: teacherUser },
    );

    await user.type(
      screen.getByLabelText(/email/i),
      requestValue("members", "invite", "teacher", "email"),
    );
    await user.click(screen.getByRole("button", { name: /inviter/i }));

    expectContractCall("members", "invite", "teacher");
  });
});
