import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import CalendarPage from "../../../../src/react/components/troupe/CalendarPage";
import {
  actorUser,
  expectContractCall,
  mainPlayPreferences,
  mainRolePreferences,
  mainScenePreferences,
  mainTroupe,
  mainTroupeMembers,
  openingNightEvent,
  renderWithStub,
  requestValue,
  setupMocks,
  setupTroupeLayoutMocks,
  teacherUser,
} from "../../test-utils";

describe("React: CalendarPage", () => {
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
    vi.useRealTimers();
  });

  describe("as member", () => {
    it("should mount successfully", async () => {
      await renderWithStub({
        path: "/troupes/:troupeId/calendar",
        Component: CalendarPage,
        initialEntries: [`/troupes/${mainTroupe.id}/calendar`],
        me: actorUser,
      });

      await screen.findByRole("heading", { level: 2 });
    });

    it("should allow user to navigate previous month", async () => {
      vi.setSystemTime(new Date("2026-05-05T12:00:00Z"));

      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/calendar",
        Component: CalendarPage,
        initialEntries: [`/troupes/${mainTroupe.id}/calendar`],
        me: actorUser,
      });

      await user.click(screen.getByRole("button", { name: /</i }));
      await screen.findByText("Avril 2026");
    });

    it("should allow user to navigate next month", async () => {
      vi.setSystemTime(new Date("2026-05-05T12:00:00Z"));

      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/calendar",
        Component: CalendarPage,
        initialEntries: [`/troupes/${mainTroupe.id}/calendar`],
        me: actorUser,
      });

      await user.click(screen.getByRole("button", { name: />/i }));
      await screen.findByText("Juin 2026");
    });

    it("should open event details", async () => {
      vi.setSystemTime(new Date(openingNightEvent.start_time));

      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/calendar",
        Component: CalendarPage,
        initialEntries: [`/troupes/${mainTroupe.id}/calendar`],
        me: actorUser,
      });

      await user.click(
        screen.getByRole("button", { name: openingNightEvent.title }),
      );

      await screen.findByRole("button", { name: /fermer/i });

      expect(screen.queryByRole("button", { name: /enregistrer/i })).toBeNull();
      expect(screen.queryByRole("button", { name: /supprimer/i })).toBeNull();

      expect(screen.getByText(openingNightEvent.title));
    });

    it("should open and close event details", async () => {
      vi.setSystemTime(new Date(openingNightEvent.start_time));

      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/calendar",
        Component: CalendarPage,
        initialEntries: [`/troupes/${mainTroupe.id}/calendar`],
        me: actorUser,
      });

      await user.click(
        screen.getByRole("button", { name: openingNightEvent.title }),
      );

      await user.click(screen.getByRole("button", { name: /fermer/i }));

      expect(screen.queryByRole("button", { name: /fermer/i })).toBeNull();
    });

    it("should display 'add' button", async () => {
      await renderWithStub({
        path: "/troupes/:troupeId/calendar",
        Component: CalendarPage,
        initialEntries: [`/troupes/${mainTroupe.id}/calendar`],
        me: actorUser,
      });

      await screen.findByLabelText(/ajouter.*28$/i);
    });

    it("should open form to create a new event on a date", async () => {
      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/calendar",
        Component: CalendarPage,
        initialEntries: [`/troupes/${mainTroupe.id}/calendar`],
        me: actorUser,
      });

      await user.click(screen.getByLabelText(/ajouter.*28$/i));

      await screen.findByRole("button", { name: /^ajouter$/i });
      await screen.findByRole("button", { name: /fermer/i });
    });

    it("should open form to create a new event on a date and close it", async () => {
      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/calendar",
        Component: CalendarPage,
        initialEntries: [`/troupes/${mainTroupe.id}/calendar`],
        me: actorUser,
      });

      await user.click(screen.getByLabelText(/ajouter.*28$/i));

      await user.click(await screen.findByRole("button", { name: /fermer/i }));

      await waitFor(() =>
        expect(screen.queryByRole("button", { name: /fermer/i })).toBeNull(),
      );
    });

    it("should open form and create a new event on a date", async () => {
      vi.setSystemTime(
        new Date(
          String(requestValue("events", "add", "as_member", "start_time")),
        ),
      );

      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/calendar",
        Component: CalendarPage,
        initialEntries: [`/troupes/${mainTroupe.id}/calendar`],
        me: actorUser,
      });

      await user.click(
        screen.getByLabelText(
          new RegExp(
            `ajouter.*${String(requestValue("events", "add", "as_member", "start_time")).split("T")[0]}`,
            "i",
          ),
        ),
      );

      await user.type(
        screen.getByLabelText(/titre/i),
        String(requestValue("events", "add", "as_member", "title")),
      );

      await user.click(screen.getByRole("button", { name: /^ajouter$/i }));

      expectContractCall("events", "add", "as_member");
      await waitFor(() => expect(screen.queryByLabelText(/titre/i)).toBeNull());
    });

    it("should alert when submitted data is invalid", async () => {
      vi.spyOn(globalThis, "alert").mockImplementationOnce(() => {});

      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/calendar",
        Component: CalendarPage,
        initialEntries: [`/troupes/${mainTroupe.id}/calendar`],
        me: actorUser,
      });

      await user.click(screen.getByLabelText(/ajouter.*28$/i));

      await act(async () => {
        await fireEvent.submit(screen.getByRole("form"));
      });

      expect(alert).toHaveBeenCalled();
    });
  });

  describe("as event owner", () => {
    it("should open form to edit/delete an event", async () => {
      vi.setSystemTime(new Date(openingNightEvent.start_time));

      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/calendar",
        Component: CalendarPage,
        initialEntries: [`/troupes/${mainTroupe.id}/calendar`],
        me: teacherUser,
      });

      await user.click(
        screen.getByRole("button", {
          name: new RegExp(openingNightEvent.title, "i"),
        }),
      );

      await screen.findByRole("button", { name: /fermer/i });
      await screen.findByRole("button", { name: /enregistrer/i });
      await screen.findByRole("button", { name: /supprimer/i });

      expect(screen.getByLabelText<HTMLInputElement>(/titre/i).value).toEqual(
        openingNightEvent.title,
      );
    });

    it("should open form to edit/delete an event and close it", async () => {
      vi.setSystemTime(new Date(openingNightEvent.start_time));

      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/calendar",
        Component: CalendarPage,
        initialEntries: [`/troupes/${mainTroupe.id}/calendar`],
        me: teacherUser,
      });

      await user.click(
        screen.getByRole("button", { name: openingNightEvent.title }),
      );

      await user.click(screen.getByRole("button", { name: /fermer/i }));

      expect(screen.queryByRole("button", { name: /fermer/i })).toBeNull();
    });

    it("should open form and edit an event", async () => {
      vi.setSystemTime(new Date(openingNightEvent.start_time));

      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/calendar",
        Component: CalendarPage,
        initialEntries: [`/troupes/${mainTroupe.id}/calendar`],
        me: teacherUser,
      });

      await user.click(
        screen.getByRole("button", { name: openingNightEvent.title }),
      );

      const titleInput = await screen.findByLabelText(/titre/i);
      await user.clear(titleInput);
      await user.type(
        titleInput,
        String(requestValue("events", "edit", "owner", "title")),
      );

      await user.click(screen.getByRole("button", { name: /enregistrer/i }));

      expectContractCall("events", "edit", "owner");

      expect(screen.queryByRole("button", { name: /enregistrer/i })).toBeNull();
    });

    it("should open form and delete an event", async () => {
      vi.setSystemTime(new Date(openingNightEvent.start_time));
      vi.spyOn(window, "confirm").mockReturnValue(true);

      const { user } = await renderWithStub({
        path: "/troupes/:troupeId/calendar",
        Component: CalendarPage,
        initialEntries: [`/troupes/${mainTroupe.id}/calendar`],
        me: teacherUser,
      });

      await user.click(
        screen.getByRole("button", { name: openingNightEvent.title }),
      );
      await user.click(screen.getByRole("button", { name: /supprimer/i }));

      expectContractCall("events", "delete", "owner");

      expect(screen.queryByRole("button", { name: /supprimer/i })).toBeNull();
    });
  });
});
