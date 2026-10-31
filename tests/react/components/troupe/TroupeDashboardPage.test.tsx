import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
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

      await screen.findByText(/la scène est vide pour l'instant/i);
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

    const openFilledForm = async (user: UserEvent) => {
      await user.click(
        screen.getByRole("button", { name: /ajouter une pièce/i }),
      );

      await user.type(
        screen.getByLabelText(/titre/i),
        String(requestValue("plays", "add", "as_admin", "title")),
      );
    };

    const renderPage = () =>
      renderWithStub({
        path: "/troupes/:troupeId",
        Component: TroupeDashboardPage,
        initialEntries: [`/troupes/${mainTroupe.id}`],
        me: teacherUser,
      });

    const webpFile = new window.File(
      [new TextEncoder().encode("dummy content")],
      "page1.webp",
      { type: "image/webp" },
    );

    const postedBodies = () =>
      vi
        .mocked(globalThis.fetch)
        .mock.calls.filter(([, init]) => init?.method === "post")
        .map(([, init]) => init?.body);

    it("should add a new play with an attached document in one request", async () => {
      const { user } = await renderPage();

      await openFilledForm(user);
      await user.upload(
        screen.getByLabelText(/texte ou document initial/i),
        webpFile,
      );
      await user.click(screen.getByRole("button", { name: /^ajouter$/i }));

      await waitFor(() =>
        expectContractCall("plays", "add", "as_admin_with_document"),
      );

      const bodies = postedBodies();
      expect(bodies).toHaveLength(1);

      const formData = bodies[0] as FormData;
      expect(formData.get("title")).toBe(
        requestValue("plays", "add", "as_admin", "title"),
      );
      expect((formData.get("document") as File).name).toBe(webpFile.name);
    });

    it("should refuse an oversized document without calling the API", async () => {
      const { user } = await renderPage();

      await openFilledForm(user);
      await user.upload(
        screen.getByLabelText(/texte ou document initial/i),
        new window.File([new Uint8Array(10 * 1024 * 1024 + 1)], "too-big.pdf", {
          type: "application/pdf",
        }),
      );
      await user.click(screen.getByRole("button", { name: /^ajouter$/i }));

      await screen.findByText(/ne doit pas dépasser 10 mo/i);
      expect(postedBodies()).toHaveLength(0);
    });

    it("should refuse an unsupported file type without calling the API", async () => {
      await renderPage();
      const user = userEvent.setup({ applyAccept: false });

      await openFilledForm(user);
      await user.upload(
        screen.getByLabelText(/texte ou document initial/i),
        new window.File(["plain text"], "doc.txt", { type: "text/plain" }),
      );
      await user.click(screen.getByRole("button", { name: /^ajouter$/i }));

      await screen.findByText(/format accepté/i);
      expect(postedBodies()).toHaveLength(0);
    });

    it("should keep the form open and filled when the server rejects the play", async () => {
      setupMocks({ forceCases: { "plays.add": "invalid_file_type" } });

      const { user } = await renderPage();

      await openFilledForm(user);
      const fileInput = screen.getByLabelText<HTMLInputElement>(
        /texte ou document initial/i,
      );
      await user.upload(fileInput, webpFile);
      await user.click(screen.getByRole("button", { name: /^ajouter$/i }));

      expect(await screen.findByRole("alert")).toHaveProperty(
        "textContent",
        expect.stringMatching(/a échoué/i),
      );
      expect(screen.getByLabelText<HTMLInputElement>(/titre/i).value).toBe(
        requestValue("plays", "add", "as_admin", "title"),
      );
      expect(fileInput.files?.[0]).toBe(webpFile);
    });

    it("should disable the submit button while the play is being sent", async () => {
      const { user } = await renderPage();

      await openFilledForm(user);

      vi.mocked(globalThis.fetch).mockImplementationOnce(
        () => new Promise(() => {}),
      );
      await user.click(screen.getByRole("button", { name: /^ajouter$/i }));

      await waitFor(() =>
        expect(
          screen.getByRole<HTMLButtonElement>("button", { name: /^ajouter$/i })
            .disabled,
        ).toBe(true),
      );
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

    it("should delete a play successfully", async () => {
      vi.spyOn(window, "confirm").mockReturnValueOnce(true);

      const { user } = await renderWithStub({
        path: "/troupes/:troupeId",
        Component: TroupeDashboardPage,
        initialEntries: [`/troupes/${mainTroupe.id}`],
        me: teacherUser,
      });

      await user.click(
        screen.getByRole("button", {
          name: new RegExp(`supprimer la pièce ${mainPlay.id}`, "i"),
        }),
      );

      expectContractCall("plays", "delete", "as_admin");
    });
  });
});
