import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import ScenesPage from "../../../../src/react/components/play/ScenesPage";
import {
  actorUser,
  emptyPlay,
  expectContractCall,
  mainPlay,
  mainPlayPreferences,
  mainRolePreferences,
  mainRoles,
  mainScenePreferences,
  mainScenes,
  mainTroupe,
  mainTroupeMembers,
  renderWithStub,
  requestValue,
  setupMocks,
  setupTroupeLayoutMocks,
  teacherUser,
} from "../../test-utils";

describe("React: ScenesPage", () => {
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
      vi.unstubAllGlobals();
    });

    it("should mount successfully", async () => {
      await renderWithStub({
        path: "/plays/:playId/scenes",
        Component: ScenesPage,
        initialEntries: [`/plays/${mainPlay.id}/scenes`],
        me: actorUser,
      });

      await waitFor(() => screen.getByRole("heading", { level: 3 }));
    });

    it("should display a message when the play has no scenes", async () => {
      await renderWithStub({
        path: "/plays/:playId/scenes",
        Component: ScenesPage,
        initialEntries: [`/plays/${emptyPlay.id}/scenes`],
        me: actorUser,
      });

      await screen.findByText(/aucune scène/i);
    });

    it("should update scene preference successfully", async () => {
      const { user } = await renderWithStub({
        path: "/plays/:playId/scenes",
        Component: ScenesPage,
        initialEntries: [`/plays/${mainPlay.id}/scenes`],
        me: actorUser,
      });

      await user.selectOptions(
        screen.getByLabelText(
          new RegExp(
            `envie(?!.*rôle).*scène.*${mainScenePreferences[1].scene_id}`,
            "i",
          ),
        ),
        "HIGH",
      );

      expectContractCall("preferences", "set_scene", "as_member");
    });

    it("should select no preference when user has no scene preference", async () => {
      await renderWithStub({
        path: "/plays/:playId/scenes",
        Component: ScenesPage,
        initialEntries: [`/plays/${mainPlay.id}/scenes`],
        me: actorUser,
      });

      expect(
        screen.getByLabelText<HTMLSelectElement>(
          new RegExp(`envie.*scène.*${mainScenes[2].id}`, "i"),
        ).value,
      ).toBe("");
    });

    it("should update role preference successfully", async () => {
      const { user } = await renderWithStub({
        path: "/plays/:playId/scenes",
        Component: ScenesPage,
        initialEntries: [`/plays/${mainPlay.id}/scenes`],
        me: actorUser,
      });

      await user.selectOptions(
        screen.getByLabelText(
          new RegExp(
            `envie.*rôle.*${mainRolePreferences[0].role_id}.*${mainRolePreferences[0].scene_id}`,
            "i",
          ),
        ),
        "HIGH",
      );

      expectContractCall("preferences", "set_role", "as_member");
    });

    it("should select no preference when user has no role preference", async () => {
      await renderWithStub({
        path: "/plays/:playId/scenes",
        Component: ScenesPage,
        initialEntries: [`/plays/${mainPlay.id}/scenes`],
        me: actorUser,
      });

      expect(
        screen.getByLabelText<HTMLSelectElement>(
          new RegExp(
            `envie.*rôle.*${mainRoles[1].id}.*${mainScenes[1].id}`,
            "i",
          ),
        ).value,
      ).toBe("");
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
      vi.unstubAllGlobals();
    });

    it("should add a new scene", async () => {
      const { user } = await renderWithStub({
        path: "/plays/:playId/scenes",
        Component: ScenesPage,
        initialEntries: [`/plays/${mainPlay.id}/scenes`],
        me: teacherUser,
      });

      await user.type(
        screen.getByLabelText(/titre/i),
        String(requestValue("scenes", "add", "as_admin", "title")),
      );
      await user.click(screen.getByRole("button", { name: /ajouter/i }));

      expectContractCall("scenes", "add", "as_admin");
    });

    it("should alert when submitted data is invalid", async () => {
      vi.spyOn(window, "alert").mockImplementationOnce(() => {});

      await renderWithStub({
        path: "/plays/:playId/scenes",
        Component: ScenesPage,
        initialEntries: [`/plays/${mainPlay.id}/scenes`],
        me: teacherUser,
      });

      await act(async () => {
        await fireEvent.submit(screen.getByRole("form"));
      });

      expect(alert).toHaveBeenCalled();
    });

    it("should display edit form when clicking on edit button", async () => {
      const { user } = await renderWithStub({
        path: "/plays/:playId/scenes",
        Component: ScenesPage,
        initialEntries: [`/plays/${mainPlay.id}/scenes`],
        me: teacherUser,
      });

      await user.click(
        screen.getByLabelText(
          new RegExp(`modifier.*scène.*${mainScenes[0].id}`, "i"),
        ),
      );

      await screen.findByLabelText(
        new RegExp(
          `enregistrer.*modification.*scène.*${mainScenes[0].id}`,
          "i",
        ),
      );
      await screen.findByLabelText(
        new RegExp(`annuler.*modification.*scène.*${mainScenes[0].id}`, "i"),
      );
    });

    it("should cancel editing a scene when clicking on cancel button", async () => {
      const { user } = await renderWithStub({
        path: "/plays/:playId/scenes",
        Component: ScenesPage,
        initialEntries: [`/plays/${mainPlay.id}/scenes`],
        me: teacherUser,
      });

      await user.click(
        screen.getByLabelText(
          new RegExp(`modifier.*scène.*${mainScenes[0].id}`, "i"),
        ),
      );

      await user.click(
        screen.getByLabelText(
          new RegExp(`annuler.*modification.*scène.*${mainScenes[0].id}`, "i"),
        ),
      );

      await screen.findByLabelText(
        new RegExp(`modifier.*scène.*${mainScenes[0].id}`, "i"),
      );
    });

    it("should edit a scene", async () => {
      const { user } = await renderWithStub({
        path: "/plays/:playId/scenes",
        Component: ScenesPage,
        initialEntries: [`/plays/${mainPlay.id}/scenes`],
        me: teacherUser,
      });

      await user.click(
        screen.getByLabelText(
          new RegExp(`modifier.*scène.*${mainScenes[0].id}`, "i"),
        ),
      );

      await screen.findByLabelText(
        new RegExp(
          `enregistrer.*modification.*scène.*${mainScenes[0].id}`,
          "i",
        ),
      );

      await user.clear(
        screen.getByLabelText(
          new RegExp(`titre.*scène.*${mainScenes[0].id}`, "i"),
        ),
      );
      await user.type(
        screen.getByLabelText(
          new RegExp(`titre.*scène.*${mainScenes[0].id}`, "i"),
        ),
        String(requestValue("scenes", "edit", "as_admin", "title")),
      );
      await user.click(
        screen.getByLabelText(
          new RegExp(
            `enregistrer.*modification.*scène.*${mainScenes[0].id}`,
            "i",
          ),
        ),
      );

      expectContractCall("scenes", "edit", "as_admin");
    });

    it("should alert when submitted data for editing a scene is invalid", async () => {
      vi.spyOn(window, "alert").mockImplementationOnce(() => {});

      const { user } = await renderWithStub({
        path: "/plays/:playId/scenes",
        Component: ScenesPage,
        initialEntries: [`/plays/${mainPlay.id}/scenes`],
        me: teacherUser,
      });

      await user.click(
        screen.getByLabelText(
          new RegExp(`modifier.*scène.*${mainScenes[0].id}`, "i"),
        ),
      );

      await user.clear(
        screen.getByLabelText(
          new RegExp(`titre.*scène.*${mainScenes[0].id}`, "i"),
        ),
      );

      await act(async () => {
        await fireEvent.submit(
          screen.getByRole("form", {
            name: new RegExp(`édition.*scène.*${mainScenes[0].id}`, "i"),
          }),
        );
      });

      expect(alert).toHaveBeenCalled();
    });

    it("should delete a scene", async () => {
      vi.spyOn(window, "confirm").mockReturnValueOnce(true);

      const { user } = await renderWithStub({
        path: "/plays/:playId/scenes",
        Component: ScenesPage,
        initialEntries: [`/plays/${mainPlay.id}/scenes`],
        me: teacherUser,
      });

      await user.click(
        screen.getByLabelText(
          new RegExp(`supprimer.*scène.*${mainScenes[0].id}`, "i"),
        ),
      );

      expectContractCall("scenes", "delete", "as_admin");
    });

    it("should not delete a scene when user cancels", async () => {
      vi.spyOn(window, "confirm").mockReturnValueOnce(false);

      const { user } = await renderWithStub({
        path: "/plays/:playId/scenes",
        Component: ScenesPage,
        initialEntries: [`/plays/${mainPlay.id}/scenes`],
        me: teacherUser,
      });

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockClear();

      await user.click(
        screen.getByLabelText(
          new RegExp(`supprimer.*scène.*${mainScenes[0].id}`, "i"),
        ),
      );

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});
