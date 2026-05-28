import { screen } from "@testing-library/react";
import CastingPage from "../../../../src/react/components/play/CastingPage";
import {
  actorUser,
  expectContractCall,
  mainPlay,
  mainPlayPreferences,
  mainRolePreferences,
  mainScenePreferences,
  mainTroupe,
  mainTroupeMembers,
  renderWithStub,
  requestValue,
  setupMocks,
  setupTroupeLayoutMocks,
  teacherUser,
} from "../../test-utils";

describe("React: CastingPage", () => {
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
        path: "/plays/:playId/casting",
        Component: CastingPage,
        initialEntries: [`/plays/${mainPlay.id}/casting`],
        me: actorUser,
      });

      await screen.findByRole("heading", { level: 3 });
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

    it("should assign a role successfully", async () => {
      const { user } = await renderWithStub({
        path: "/plays/:playId/casting",
        Component: CastingPage,
        initialEntries: [`/plays/${mainPlay.id}/casting`],
        me: teacherUser,
      });

      const label = new RegExp(
        `assigner.*rôle.*${requestValue("castings", "assign", "admin", "role_id")}.*scène.*${requestValue("castings", "assign", "admin", "scene_id")}.*à.*${requestValue("castings", "assign", "admin", "user_id")}`,
        "i",
      );
      await user.click(await screen.getByRole("button", { name: label }));

      expectContractCall("castings", "assign", "admin");
    });

    it("should unassign a role successfully", async () => {
      const { user } = await renderWithStub({
        path: "/plays/:playId/casting",
        Component: CastingPage,
        initialEntries: [`/plays/${mainPlay.id}/casting`],
        me: teacherUser,
      });

      const label = new RegExp(
        `désassigner.*rôle.*${requestValue("castings", "unassign", "admin", "role_id")}.*scène.*${requestValue("castings", "unassign", "admin", "scene_id")}.*à.*${requestValue("castings", "unassign", "admin", "user_id")}`,
        "i",
      );
      await user.click(await screen.getByRole("button", { name: label }));

      expectContractCall("castings", "unassign", "admin");
    });
  });
});
