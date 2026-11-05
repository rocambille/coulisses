import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import ScenesPage from "../../../../src/react/components/play/ScenesPage";
import { isPushConfigured } from "../../../../src/react/helpers/push";
import { emptyPlay, mainPlay } from "../../../fixtures/plays";
import {
  mainPlayPreferences,
  mainRolePreferences,
  mainScenePreferences,
} from "../../../fixtures/preferences";
import { mainRoles } from "../../../fixtures/roles";
import { mainScenes } from "../../../fixtures/scenes";
import { mainTroupeMembers } from "../../../fixtures/troupeMembers";
import { mainTroupe } from "../../../fixtures/troupes";
import { actorUser, teacherUser } from "../../../fixtures/users";
import {
  expectContractCall,
  renderWithStub,
  requestValue,
  setupMocks,
  setupTroupeLayoutMocks,
} from "../../test-utils";

vi.mock("../../../../src/react/helpers/push", { spy: true });

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

      await user.click(
        screen.getByRole("button", { name: /ajouter une scène/i }),
      );

      await user.type(
        screen.getByLabelText(/titre/i),
        String(requestValue("scenes", "add", "as_admin", "title")),
      );
      await user.click(screen.getByRole("button", { name: /enregistrer/i }));

      expectContractCall("scenes", "add", "as_admin");
    });

    it("should display inline errors when submitted data is invalid", async () => {
      const { user } = await renderWithStub({
        path: "/plays/:playId/scenes",
        Component: ScenesPage,
        initialEntries: [`/plays/${mainPlay.id}/scenes`],
        me: teacherUser,
      });

      await user.click(
        screen.getByRole("button", { name: /ajouter une scène/i }),
      );

      await act(async () => {
        await fireEvent.submit(screen.getByRole("form"));
      });

      await screen.findByText(/le titre est requis/i);
    });

    it("should display edit modal when clicking on edit button", async () => {
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

      await screen.findByRole("button", { name: /enregistrer/i });
      await screen.findByRole("button", { name: /annuler/i });
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

      await user.click(screen.getByRole("button", { name: /annuler/i }));

      expect(screen.queryByRole("dialog")).toBeNull();
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

      await screen.findByRole("button", { name: /enregistrer/i });

      await user.clear(screen.getByLabelText(/titre/i));
      await user.type(
        screen.getByLabelText(/titre/i),
        String(requestValue("scenes", "edit", "as_admin", "title")),
      );
      await user.click(screen.getByRole("button", { name: /enregistrer/i }));

      expectContractCall("scenes", "edit", "as_admin");
    });

    it("should display inline errors when submitted data for editing a scene is invalid", async () => {
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

      await user.clear(screen.getByLabelText(/titre/i));

      await act(async () => {
        await fireEvent.submit(screen.getByRole("form"));
      });

      await screen.findByText(/le titre est requis/i);
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

    const renderPage = () =>
      renderWithStub({
        path: "/plays/:playId/scenes",
        Component: ScenesPage,
        initialEntries: [`/plays/${mainPlay.id}/scenes`],
        me: teacherUser,
      });

    // Wrapping the click in act() because React's use() is suspending
    const openVotes = (user: UserEvent, name: RegExp) =>
      act(async () => {
        await user.click(screen.getByRole("button", { name }));
      });

    const section = (title: RegExp) =>
      screen.getByRole("heading", { level: 4, name: title }).parentElement;

    it("should show partial votes across all active scenes", async () => {
      const { user } = await renderPage();

      await openVotes(user, /suivi des votes/i);

      const inProgress = await screen.findByRole("heading", {
        level: 4,
        name: /vote en cours \(2\)/i,
      });

      expect(inProgress.parentElement?.textContent).toContain(actorUser.name);
      expect(inProgress.parentElement?.textContent).toContain("1/2 scènes");
      expectContractCall("preferences", "voting_status", "as_admin");
    });

    it("should remind actors from the global view", async () => {
      vi.mocked(isPushConfigured).mockReturnValue(true);

      const { user } = await renderPage();

      await openVotes(user, /suivi des votes/i);
      await user.click(
        await screen.findByRole("button", { name: /relancer/i }),
      );

      await screen.findByText(/n'a activé les notifications/i);
      expectContractCall("notifications", "notify", "vote_reminder");
    });

    it("should not offer a reminder on the view of a single scene", async () => {
      vi.mocked(isPushConfigured).mockReturnValue(true);

      const { user } = await renderPage();

      await openVotes(
        user,
        new RegExp(`votes de la scène ${mainScenes[2].id}`, "i"),
      );

      await screen.findByRole("heading", { level: 4 });
      expect(screen.queryByRole("button", { name: /relancer/i })).toBeNull();
    });

    it("should list who voted on a single scene", async () => {
      const { user } = await renderPage();

      await openVotes(
        user,
        new RegExp(`votes de la scène ${mainScenes[0].id}`, "i"),
      );

      await screen.findByRole("heading", {
        level: 4,
        name: /ont voté \(2\)/i,
      });
      expect(screen.queryByText(/n'ont pas encore voté/i)).toBeNull();
    });

    it("should show each vote after the name on a single scene", async () => {
      const { user } = await renderPage();

      await openVotes(
        user,
        new RegExp(`votes de la scène ${mainScenes[0].id}`, "i"),
      );

      await screen.findByRole("heading", { level: 4 });
      const items = within(section(/ont voté/i) as HTMLElement).getAllByRole(
        "listitem",
      );

      expect(items.map((item) => item.textContent)).toEqual([
        `${actorUser.name} 👍`,
        `${teacherUser.name} 🔥`,
      ]);
      expect(within(items[0]).getByTitle("Pourquoi pas")).toBeDefined();
    });

    it("should count votes by level across the play", async () => {
      const { user } = await renderPage();

      await openVotes(user, /suivi des votes/i);

      await screen.findByRole("heading", { level: 4 });
      const items = within(
        section(/vote en cours/i) as HTMLElement,
      ).getAllByRole("listitem");

      expect(items.map((item) => item.textContent)).toEqual([
        `${actorUser.name} 👍1 (1/2 scènes)`,
        `${teacherUser.name} 🔥1 (1/2 scènes)`,
      ]);
    });

    it("should list actors who did not vote, but not admins", async () => {
      const { user } = await renderPage();

      await openVotes(
        user,
        new RegExp(`votes de la scène ${mainScenes[2].id}`, "i"),
      );

      await screen.findByRole("heading", {
        level: 4,
        name: /n'ont pas encore voté \(1\)/i,
      });
      expect(section(/n'ont pas encore voté/i)?.textContent).toContain(
        actorUser.name,
      );
      expect(section(/n'ont pas encore voté/i)?.textContent).not.toContain(
        teacherUser.name,
      );
    });

    it("should not offer votes on an inactive scene", async () => {
      await renderPage();

      expect(
        screen.queryByRole("button", {
          name: new RegExp(`votes de la scène ${mainScenes[1].id}`, "i"),
        }),
      ).toBeNull();
    });

    it("should show a role vote only on the scene it was cast on", async () => {
      setupTroupeLayoutMocks({
        troupe: mainTroupe,
        members: mainTroupeMembers,
        isAdmin: true,
        playPreferences: mainPlayPreferences,
        rolePreferences: [
          {
            user_id: actorUser.id,
            scene_id: mainScenes[1].id,
            role_id: mainRoles[0].id,
            level: "NOT_INTERESTED",
            created_at: "2026-01-01T00:00:00.000Z",
          },
        ],
        scenePreferences: mainScenePreferences,
      });

      await renderWithStub({
        path: "/plays/:playId/scenes",
        Component: ScenesPage,
        initialEntries: [`/plays/${mainPlay.id}/scenes`],
        me: actorUser,
      });

      const select = (sceneId: number) =>
        screen.getByLabelText<HTMLSelectElement>(
          `Niveau d'envie pour le rôle ${mainRoles[0].id} dans la scène ${sceneId}`,
        );

      expect(select(mainScenes[1].id).value).toBe("NOT_INTERESTED");
      expect(select(mainScenes[0].id).value).toBe("");
    });
  });
});
