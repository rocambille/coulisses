import { screen } from "@testing-library/react";
import CastingPage from "../../src/react/components/play/CastingPage";
import {
  expectContractCall,
  mainPlay,
  renderWithStub,
  requestValue,
  setupMocks,
  teacherUser,
} from "./test-utils";

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
      { me: teacherUser },
    );

    await screen.findByRole("heading", { level: 2 });
    expect(screen.getByText(/casting/i)).toBeDefined();
  });

  it("should assign a role successfully (teacher)", async () => {
    const { user } = await renderWithStub(
      "/plays/:playId/casting",
      CastingPage,
      [`/plays/${mainPlay.id}/casting`],
      { me: teacherUser },
    );

    // Specific label matching the first role
    const label = new RegExp(
      `assigner.*\\b${requestValue("castings", "assign", "main", "roleId")}\\b`,
      "i",
    );
    await user.selectOptions(
      await screen.findByLabelText(label),
      requestValue("castings", "assign", "main", "userId"),
    );

    expectContractCall("castings", "assign", "main");
  });

  it("should update a role successfully (teacher)", async () => {
    const { user } = await renderWithStub(
      "/plays/:playId/casting",
      CastingPage,
      [`/plays/${mainPlay.id}/casting`],
      { me: teacherUser },
    );

    // Specific label matching the first role
    const label = new RegExp(
      `assigner.*\\b${requestValue("castings", "update", "main", "roleId")}\\b`,
      "i",
    );
    await user.selectOptions(
      await screen.findByLabelText(label),
      requestValue("castings", "update", "main", "userId"),
    );

    expectContractCall("castings", "update", "main");
  });

  it("should unassign a role successfully (teacher)", async () => {
    const { user } = await renderWithStub(
      "/plays/:playId/casting",
      CastingPage,
      [`/plays/${mainPlay.id}/casting`],
      { me: teacherUser },
    );

    const label = new RegExp(
      `assigner.*${requestValue("castings", "unassign", "main", "roleId")}`,
      "i",
    );
    await user.selectOptions(await screen.findByLabelText(label), "");

    expectContractCall("castings", "unassign", "main");
  });
});
