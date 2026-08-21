import { screen } from "@testing-library/react";
import DocumentsPage from "../../../../src/react/components/play/DocumentsPage";
import { allDocuments, mainDocument } from "../../../fixtures/documents";
import { emptyPlay, mainPlay } from "../../../fixtures/plays";
import {
  mainPlayPreferences,
  mainRolePreferences,
  mainScenePreferences,
} from "../../../fixtures/preferences";
import { mainTroupeMembers } from "../../../fixtures/troupeMembers";
import { mainTroupe } from "../../../fixtures/troupes";
import { actorUser, teacherUser } from "../../../fixtures/users";
import {
  expectContractCall,
  renderWithStub,
  setupMocks,
  setupTroupeLayoutMocks,
} from "../../test-utils";

describe("React: DocumentsPage", () => {
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

    it("should mount successfully and display documents and photos", async () => {
      await renderWithStub({
        path: "/plays/:playId/documents",
        Component: DocumentsPage,
        initialEntries: [`/plays/${mainPlay.id}/documents`],
        me: actorUser,
      });

      await screen.findByRole("heading", {
        level: 3,
        name: /documents.*photos/i,
      });
      expect(screen.getByText(allDocuments[0].original_name)).toBeTruthy();
      expect(
        screen.getByText(new RegExp(allDocuments[1].original_name, "i")),
      ).toBeTruthy();
    });

    it("should display a message when the play has no documents", async () => {
      await renderWithStub({
        path: "/plays/:playId/documents",
        Component: DocumentsPage,
        initialEntries: [`/plays/${emptyPlay.id}/documents`],
        me: actorUser,
      });

      await screen.findByText(/aucun document/i);
    });

    it("should open and close lightbox modal on photo click", async () => {
      const { user } = await renderWithStub({
        path: "/plays/:playId/documents",
        Component: DocumentsPage,
        initialEntries: [`/plays/${mainPlay.id}/documents`],
        me: actorUser,
      });

      const photo = await screen.findByAltText(allDocuments[0].original_name);
      await user.click(photo);

      expect(
        screen.getByRole("dialog", { name: /aperçu.*photo/i }),
      ).toBeTruthy();

      await user.click(screen.getByRole("button", { name: /fermer/i }));
      expect(
        screen.queryByRole("dialog", { name: /aperçu.*photo/i }),
      ).toBeNull();
    });

    it("should not show upload or delete buttons for non-admin", async () => {
      await renderWithStub({
        path: "/plays/:playId/documents",
        Component: DocumentsPage,
        initialEntries: [`/plays/${mainPlay.id}/documents`],
        me: actorUser,
      });

      await screen.findByRole("heading", {
        level: 3,
        name: /documents.*photos/i,
      });
      expect(
        screen.queryByRole("button", { name: /prendre.*photo/i }),
      ).toBeNull();
      expect(screen.queryByRole("button", { name: /importer/i })).toBeNull();
      expect(screen.queryByRole("button", { name: /supprimer/i })).toBeNull();
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

    it("should upload a document file", async () => {
      const { user } = await renderWithStub({
        path: "/plays/:playId/documents",
        Component: DocumentsPage,
        initialEntries: [`/plays/${mainPlay.id}/documents`],
        me: teacherUser,
      });

      const file = new File(["dummy content"], "page1.webp", {
        type: "image/webp",
      });

      const fileInput = document.querySelector(
        'input[type="file"][multiple]',
      ) as HTMLInputElement;
      expect(fileInput).toBeTruthy();

      await user.upload(fileInput, file);

      expectContractCall("documents", "upload", "as_admin");
    });

    it("should delete a document", async () => {
      vi.spyOn(window, "confirm").mockReturnValueOnce(true);

      const { user } = await renderWithStub({
        path: "/plays/:playId/documents",
        Component: DocumentsPage,
        initialEntries: [`/plays/${mainPlay.id}/documents`],
        me: teacherUser,
      });

      await user.click(
        screen.getByRole("button", {
          name: new RegExp(`supprimer.*document.*${mainDocument.id}`, "i"),
        }),
      );

      expectContractCall("documents", "delete", "as_admin");
    });

    it("should not delete a document when user cancels", async () => {
      vi.spyOn(window, "confirm").mockReturnValueOnce(false);

      const { user } = await renderWithStub({
        path: "/plays/:playId/documents",
        Component: DocumentsPage,
        initialEntries: [`/plays/${mainPlay.id}/documents`],
        me: teacherUser,
      });

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockClear();

      await user.click(
        screen.getByRole("button", {
          name: new RegExp(`supprimer.*document.*${mainDocument.id}`, "i"),
        }),
      );

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});
