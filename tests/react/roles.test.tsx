import { screen } from "@testing-library/react";
import RolesPage from "../../src/react/components/play/RolesPage";
import {
  emptyPlay,
  expectContractCall,
  mainPlay,
  renderWithStub,
  requestValue,
  setupMocks,
  teacherUser,
} from "./test-utils";

describe("React: RolesPage", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should mount successfully", async () => {
    await renderWithStub(
      "/plays/:playId/roles",
      RolesPage,
      [`/plays/${mainPlay.id}/roles`],
      { me: teacherUser },
    );

    await screen.findByRole("heading", { level: 2 });
    expect(screen.getByText(/rôles/i)).toBeDefined();
  });

  it("should display a message when the play has no roles", async () => {
    await renderWithStub(
      "/plays/:playId/roles",
      RolesPage,
      [`/plays/${emptyPlay.id}/roles`],
      { me: teacherUser },
    );

    await screen.findByText(/aucun rôle/i);
    expectContractCall("roles", "browse", "empty");
  });

  it("should add a new role successfully", async () => {
    const { user } = await renderWithStub(
      "/plays/:playId/roles",
      RolesPage,
      [`/plays/${mainPlay.id}/roles`],
      { me: teacherUser },
    );

    await user.type(
      screen.getByLabelText(/nom/i),
      requestValue("roles", "create", "no_scene", "name"),
    );
    await user.click(screen.getByRole("button", { name: /ajouter/i }));

    expectContractCall("roles", "create", "no_scene");
  });
});
