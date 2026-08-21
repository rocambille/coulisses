import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import TroupeDashboardPage from "../../../../src/react/components/troupe/TroupeDashboardPage";
import { emptyPlay, mainPlay } from "../../../fixtures/plays";
import {
  mainPlayPreferences,
  mainRolePreferences,
  mainScenePreferences,
} from "../../../fixtures/preferences";
import {
  emptyTroupeMembers,
  mainTroupeMembers,
} from "../../../fixtures/troupeMembers";
import { emptyTroupe, mainTroupe } from "../../../fixtures/troupes";
import { actorUser, teacherUser } from "../../../fixtures/users";
import {
  expectContractCall,
  renderWithStub,
  requestValue,
  setupMocks,
  setupTroupeLayoutMocks,
} from "../../test-utils";

describe("React: TroupeDashboardPage", () => {
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
        path: "/troupes/:troupeId",
        Component: TroupeDashboardPage,
        initialEntries: [`/troupes/${mainTroupe.id}`],
        me: actorUser,
      });

      await waitFor(() => screen.getByRole("heading", { level: 2 }));
    });

    it("should display a message when the troupe has no plays", async () => {
      setupMocks();
      setupTroupeLayoutMocks({
        troupe: emptyTroupe,
        members: emptyTroupeMembers,
        isAdmin: false,
        playPreferences: mainPlayPreferences,
        rolePreferences: mainRolePreferences,
        scenePreferences: mainScenePreferences,
      });

      await renderWithStub({
        path: "/troupes/:troupeId",
        Component: TroupeDashboardPage,
        initialEntries: [`/troupes/${emptyTroupe.id}`],
        me: actorUser,
      });

      await screen.findByText(/aucune pièce/i);
    });

    it("should update preference successfully", async () => {
      const { user } = await renderWithStub({
        path: "/troupes/:troupeId",
        Component: TroupeDashboardPage,
        initialEntries: [`/troupes/${mainTroupe.id}`],
        me: actorUser,
      });

      await user.selectOptions(
        screen.getByLabelText(new RegExp(`envie.*pièce.*${mainPlay.id}`, "i")),
        "HIGH",
      );

      expectContractCall("preferences", "set_play", "as_member");
    });

    it("should select no preference when user has no preference", async () => {
      await renderWithStub({
        path: "/troupes/:troupeId",
        Component: TroupeDashboardPage,
        initialEntries: [`/troupes/${mainTroupe.id}`],
        me: actorUser,
      });

      expect(
        screen.getByLabelText<HTMLSelectElement>(
          new RegExp(`envie.*pièce.*${emptyPlay.id}`, "i"),
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

    it("should add a new play", async () => {
      const { user } = await renderWithStub({
        path: "/troupes/:troupeId",
        Component: TroupeDashboardPage,
        initialEntries: [`/troupes/${mainTroupe.id}`],
        me: teacherUser,
      });

      await user.click(
        screen.getByRole("button", { name: /ajouter une pièce/i }),
      );

      await user.type(
        screen.getByLabelText(/titre/i),
        String(requestValue("plays", "add", "as_admin", "title")),
      );
      await user.click(screen.getByRole("button", { name: /^ajouter$/i }));

      expectContractCall("plays", "add", "as_admin");
    });

    it("should display inline errors when submitted data is invalid", async () => {
      const { user } = await renderWithStub({
        path: "/troupes/:troupeId",
        Component: TroupeDashboardPage,
        initialEntries: [`/troupes/${mainTroupe.id}`],
        me: teacherUser,
      });

      await user.click(
        screen.getByRole("button", { name: /ajouter une pièce/i }),
      );

      await act(async () => {
        await fireEvent.submit(screen.getByRole("form"));
      });

      await screen.findByText(/le titre est requis/i);
    });
  });
});
