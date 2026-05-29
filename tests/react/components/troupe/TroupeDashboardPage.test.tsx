import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import TroupeDashboardPage from "../../../../src/react/components/troupe/TroupeDashboardPage";
import {
  actorUser,
  emptyTroupe,
  emptyTroupeMembers,
  expectContractCall,
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

      await user.type(
        screen.getByLabelText(/titre/i),
        String(requestValue("plays", "add", "as_admin", "title")),
      );
      await user.click(screen.getByRole("button", { name: /ajouter/i }));

      expectContractCall("plays", "add", "as_admin");
    });

    it("should alert when submitted data is invalid", async () => {
      vi.spyOn(globalThis, "alert").mockImplementationOnce(() => {});

      await renderWithStub({
        path: "/troupes/:troupeId",
        Component: TroupeDashboardPage,
        initialEntries: [`/troupes/${mainTroupe.id}`],
        me: teacherUser,
      });

      await act(async () => {
        await fireEvent.submit(screen.getByRole("form"));
      });

      expect(alert).toHaveBeenCalled();
    });
  });
});
