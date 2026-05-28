import { screen } from "@testing-library/react";
import RolesPage from "../../../../src/react/components/play/RolesPage";
import {
  actorUser,
  emptyPlay,
  expectContractCall,
  mainPlay,
  mainPlayPreferences,
  mainRolePreferences,
  mainRoles,
  mainScenePreferences,
  mainTroupe,
  mainTroupeMembers,
  renderWithStub,
  requestValue,
  setupMocks,
  setupTroupeLayoutMocks,
  teacherUser,
} from "../../test-utils";

describe("React: RolesPage", () => {
  describe("as actor", () => {
    beforeEach(() => {
      setupMocks();
      setupTroupeLayoutMocks({
        troupe: mainTroupe,
        members: mainTroupeMembers,
        isAdmin: false,
        playPreferences: mainPlayPreferences,
        rolePreferences: mainRolePreferences,
        scenePreferences: mainScenePreferences,
      });
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should mount successfully", async () => {
      await renderWithStub({
        path: "/plays/:playId/roles",
        Component: RolesPage,
        initialEntries: [`/plays/${mainPlay.id}/roles`],
        me: actorUser,
      });

      await screen.findByRole("heading", { level: 3 });
    });

    it("should display a message when the play has no roles", async () => {
      await renderWithStub({
        path: "/plays/:playId/roles",
        Component: RolesPage,
        initialEntries: [`/plays/${emptyPlay.id}/roles`],
        me: actorUser,
      });

      await screen.findByText(/aucun rôle/i);
    });
  });

  describe("as admin", () => {
    beforeEach(() => {
      setupMocks();
      setupTroupeLayoutMocks({
        troupe: mainTroupe,
        members: mainTroupeMembers,
        isAdmin: true,
        playPreferences: mainPlayPreferences,
        rolePreferences: mainRolePreferences,
        scenePreferences: mainScenePreferences,
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should add a new role", async () => {
      const { user } = await renderWithStub({
        path: "/plays/:playId/roles",
        Component: RolesPage,
        initialEntries: [`/plays/${mainPlay.id}/roles`],
        me: teacherUser,
      });

      await user.type(
        screen.getByLabelText(/nom/i),
        String(requestValue("roles", "create", "admin", "name")),
      );
      await user.click(screen.getByRole("button", { name: /ajouter/i }));

      expectContractCall("roles", "create", "admin");
    });

    it("should delete a role", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(true);

      const { user } = await renderWithStub({
        path: "/plays/:playId/roles",
        Component: RolesPage,
        initialEntries: [`/plays/${mainPlay.id}/roles`],
        me: teacherUser,
      });

      await user.click(
        screen.getByRole("button", {
          name: new RegExp(`supprimer.*rôle.*${mainRoles[0].id}`, "i"),
        }),
      );

      expectContractCall("roles", "delete", "admin");
    });

    it("should not delete a role when user cancels", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(false);

      const { user } = await renderWithStub({
        path: "/plays/:playId/roles",
        Component: RolesPage,
        initialEntries: [`/plays/${mainPlay.id}/roles`],
        me: teacherUser,
      });

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockClear();

      await user.click(
        screen.getByRole("button", {
          name: new RegExp(`supprimer.*rôle.*${mainRoles[0].id}`, "i"),
        }),
      );

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});
