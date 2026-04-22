import { screen, waitFor } from "@testing-library/react";
import CalendarPage from "../../src/react/components/play/CalendarPage";
import {
  actorUser,
  expectContractCall,
  mainPlay,
  openingNightEvent,
  renderWithStub,
  requestValue,
  setupMocks,
  teacherUser,
} from "./test-utils";

describe("React: CalendarPage", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should mount successfully", async () => {
    await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { me: actorUser },
    );

    await screen.findByRole("heading", { level: 2 });

    expect(screen.queryByLabelText(/ajouter.*28$/i)).toBeNull();
  });

  it("should allow user to navigate previous month", async () => {
    vi.setSystemTime(new Date("2026-05-05T12:00:00Z"));

    const { user } = await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { me: actorUser },
    );

    await user.click(screen.getByRole("button", { name: /</i }));
    await screen.findByText("Avril 2026");
  });

  it("should allow user to navigate next month", async () => {
    vi.setSystemTime(new Date("2026-05-05T12:00:00Z"));

    const { user } = await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { me: actorUser },
    );

    await user.click(screen.getByRole("button", { name: />/i }));
    await screen.findByText("Juin 2026");
  });

  it("should display 'add' button (teacher)", async () => {
    await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { me: teacherUser },
    );

    await screen.findByLabelText(/ajouter.*28$/i);
  });

  it("should open event details (actor)", async () => {
    vi.setSystemTime(new Date(openingNightEvent.start_time));

    const { user } = await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { me: actorUser },
    );

    await user.click(
      screen.getByRole("button", { name: openingNightEvent.title }),
    );

    await screen.findByRole("button", { name: /fermer/i });

    expect(screen.queryByRole("button", { name: /enregistrer/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /supprimer/i })).toBeNull();

    expect(screen.getByText(openingNightEvent.title));
  });

  it("should open and close event details (actor)", async () => {
    vi.setSystemTime(new Date(openingNightEvent.start_time));

    const { user } = await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { me: actorUser },
    );

    await user.click(
      screen.getByRole("button", { name: openingNightEvent.title }),
    );

    await user.click(screen.getByRole("button", { name: /fermer/i }));

    expect(screen.queryByRole("button", { name: /fermer/i })).toBeNull();
  });

  it("should open form to edit/delete an event (teacher)", async () => {
    vi.setSystemTime(new Date(openingNightEvent.start_time));

    const { user } = await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { me: teacherUser },
    );

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

  it("should open form to edit/delete an event and close it (teacher)", async () => {
    vi.setSystemTime(new Date(openingNightEvent.start_time));

    const { user } = await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { me: teacherUser },
    );

    await user.click(
      screen.getByRole("button", { name: openingNightEvent.title }),
    );

    await user.click(screen.getByRole("button", { name: /fermer/i }));

    expect(screen.queryByRole("button", { name: /fermer/i })).toBeNull();
  });

  it("should open form and edit an event (teacher)", async () => {
    vi.setSystemTime(new Date(openingNightEvent.start_time));

    const { user } = await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { me: teacherUser },
    );

    await user.click(
      screen.getByRole("button", { name: openingNightEvent.title }),
    );

    const titleInput = await screen.findByLabelText(/titre/i);
    await user.clear(titleInput);
    await user.type(
      titleInput,
      requestValue("events", "update", "opening_night", "title"),
    );

    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    expectContractCall("events", "update", "opening_night");

    expect(screen.queryByRole("button", { name: /enregistrer/i })).toBeNull();
  });

  it("should open form and delete an event (teacher)", async () => {
    vi.setSystemTime(new Date(openingNightEvent.start_time));
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const { user } = await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { me: teacherUser },
    );

    await user.click(
      screen.getByRole("button", { name: openingNightEvent.title }),
    );
    await user.click(screen.getByRole("button", { name: /supprimer/i }));

    expectContractCall("events", "delete", "opening_night");

    expect(screen.queryByRole("button", { name: /supprimer/i })).toBeNull();
  });

  it("should open form to create a new event on a date (teacher)", async () => {
    const { user } = await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { me: teacherUser },
    );

    await user.click(screen.getByLabelText(/ajouter.*28$/i));

    await screen.findByRole("button", { name: /^ajouter$/i });
    await screen.findByRole("button", { name: /fermer/i });
  });

  it("should open form to create a new event on a date and close it (teacher)", async () => {
    const { user } = await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { me: teacherUser },
    );

    await user.click(screen.getByLabelText(/ajouter.*28$/i));

    await user.click(await screen.findByRole("button", { name: /fermer/i }));

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /fermer/i })).toBeNull(),
    );
  });

  it("should open form and create a new event on a date (teacher)", async () => {
    vi.setSystemTime(
      new Date(requestValue("events", "create", "opening_night", "start_time")),
    );

    const { user } = await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { me: teacherUser },
    );

    await user.click(
      screen.getByLabelText(
        new RegExp(
          `ajouter.*${requestValue("events", "create", "opening_night", "start_time").split("T")[0]}`,
          "i",
        ),
      ),
    );

    await user.type(
      await screen.findByLabelText(/titre/i),
      requestValue("events", "create", "opening_night", "title"),
    );

    await user.click(screen.getByRole("button", { name: /^ajouter$/i }));

    expectContractCall("events", "create", "opening_night");
    await waitFor(() => expect(screen.queryByLabelText(/titre/i)).toBeNull());
  });
});
