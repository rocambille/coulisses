import { act, fireEvent, screen } from "@testing-library/react";
import MembersPage from "../../../../src/react/components/troupe/MembersPage";
import {
  actorUser,
  emptyTroupe,
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

describe("React: MembersPage", () => {
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
        path: "/plays/:playId/members",
        Component: MembersPage,
        initialEntries: [`/plays/${mainPlay.id}/members`],
        me: teacherUser,
      });

      await screen.findByRole("heading", { level: 2 });
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

    it("should add a new member successfully", async () => {
      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/members",
        Component: MembersPage,
        initialEntries: [`/troupes/${mainTroupe.id}/members`],
        me: teacherUser,
      });

      await user.type(
        screen.getByLabelText(/email/i),
        String(requestValue("members", "add", "as_admin", "email")),
      );
      await user.click(screen.getByRole("button", { name: /inviter/i }));

      expectContractCall("members", "add", "as_admin");
    });

    it("should alert when submitted data is invalid", async () => {
      vi.spyOn(window, "alert").mockImplementationOnce(() => {});

      await renderWithStub({
        path: "/troupes/:troupeId/members",
        Component: MembersPage,
        initialEntries: [`/troupes/${mainTroupe.id}/members`],
        me: teacherUser,
      });

      await act(async () => {
        await fireEvent.submit(screen.getByRole("form"));
      });

      expect(alert).toHaveBeenCalled();
    });

    it("should update a member successfully", async () => {
      vi.spyOn(window, "confirm").mockReturnValueOnce(true);

      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/members",
        Component: MembersPage,
        initialEntries: [`/troupes/${mainTroupe.id}/members`],
        me: teacherUser,
      });

      await user.selectOptions(
        screen.getByRole("combobox", {
          name: new RegExp(`modifier.*${actorUser.id}`, "i"),
        }),
        "ADMIN",
      );

      expectContractCall("members", "edit", "as_admin");
    });

    it("should cancel updating a member", async () => {
      vi.spyOn(window, "confirm").mockReturnValueOnce(false);

      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/members",
        Component: MembersPage,
        initialEntries: [`/troupes/${mainTroupe.id}/members`],
        me: teacherUser,
      });

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockClear();

      await user.selectOptions(
        screen.getByRole("combobox", {
          name: new RegExp(`modifier.*${actorUser.id}`, "i"),
        }),
        "ADMIN",
      );

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("should alert when updating last admin into an actor", async () => {
      vi.spyOn(window, "confirm").mockReturnValueOnce(true);
      vi.spyOn(window, "alert").mockImplementationOnce(() => {});

      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/members",
        Component: MembersPage,
        initialEntries: [`/troupes/${emptyTroupe.id}/members`],
        me: teacherUser,
      });

      await user.selectOptions(
        screen.getByRole("combobox", {
          name: new RegExp(`modifier.*${teacherUser.id}`, "i"),
        }),
        "ACTOR",
      );

      expectContractCall("members", "edit", "conflict");
      expect(alert).toHaveBeenCalled();
    });

    it("should remove a member successfully", async () => {
      vi.spyOn(window, "confirm").mockReturnValueOnce(true);

      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/members",
        Component: MembersPage,
        initialEntries: [`/troupes/${mainTroupe.id}/members`],
        me: teacherUser,
      });

      await user.click(
        screen.getByRole("button", {
          name: new RegExp(`retirer.*${actorUser.id}`, "i"),
        }),
      );

      expectContractCall("members", "delete", "as_admin");
    });

    it("should cancel removing a member", async () => {
      vi.spyOn(window, "confirm").mockReturnValueOnce(false);

      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/members",
        Component: MembersPage,
        initialEntries: [`/troupes/${mainTroupe.id}/members`],
        me: teacherUser,
      });

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockClear();

      await user.click(
        screen.getByRole("button", {
          name: new RegExp(`retirer.*${actorUser.id}`, "i"),
        }),
      );

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("should alert when removing last admin", async () => {
      vi.spyOn(window, "confirm").mockReturnValueOnce(true);
      vi.spyOn(window, "alert").mockImplementationOnce(() => {});

      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/members",
        Component: MembersPage,
        initialEntries: [`/troupes/${emptyTroupe.id}/members`],
        me: teacherUser,
      });

      await user.click(
        screen.getByRole("button", {
          name: new RegExp(`retirer.*${teacherUser.id}`, "i"),
        }),
      );

      expectContractCall("members", "delete", "conflict");
      expect(alert).toHaveBeenCalled();
    });
  });
});
