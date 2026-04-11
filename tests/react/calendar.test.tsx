import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CalendarPage from "../../src/react/components/play/CalendarPage";
import {
  actorUser,
  expectFetchTo,
  mainPlay,
  openingNightEvent,
  renderWithStub,
  requestValue,
  setupMocks,
  teacherUser,
} from ".";

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
      { user: actorUser },
    );

    await waitFor(() => screen.getByRole("heading", { level: 2 }));

    expect(screen.queryByLabelText(/ajouter.*28$/i)).toBeNull();
  });

  it("should allow user to navigate previous month", async () => {
    vi.setSystemTime(new Date("2026-05-05T12:00:00Z"));

    await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { user: actorUser },
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /</i }));
    await waitFor(() => screen.getByText("Avril 2026"));
  });

  it("should allow user to navigate next month", async () => {
    vi.setSystemTime(new Date("2026-05-05T12:00:00Z"));

    await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { user: actorUser },
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: />/i }));
    await waitFor(() => screen.getByText("Juin 2026"));
  });

  it("should display 'add' button (teacher)", async () => {
    await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { user: teacherUser },
    );

    await waitFor(() => screen.getByLabelText(/ajouter.*28$/i));
  });

  it("should open event details (actor)", async () => {
    vi.setSystemTime(new Date(openingNightEvent.start_time));

    await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { user: actorUser },
    );

    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: openingNightEvent.title }),
    );

    await waitFor(() => screen.getByRole("button", { name: /fermer/i }));

    expect(screen.queryByRole("button", { name: /enregistrer/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /supprimer/i })).toBeNull();

    expect(screen.getByText(openingNightEvent.title));
  });

  it("should open and close event details (actor)", async () => {
    vi.setSystemTime(new Date(openingNightEvent.start_time));

    await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { user: actorUser },
    );

    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: openingNightEvent.title }),
    );

    await user.click(screen.getByRole("button", { name: /fermer/i }));

    expect(screen.queryByRole("button", { name: /fermer/i })).toBeNull();
  });

  it("should open form to edit/delete an event (teacher)", async () => {
    vi.setSystemTime(new Date(openingNightEvent.start_time));

    await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(openingNightEvent.title, "i"),
      }),
    );

    await waitFor(() => screen.getByRole("button", { name: /fermer/i }));
    await waitFor(() => screen.getByRole("button", { name: /enregistrer/i }));
    await waitFor(() => screen.getByRole("button", { name: /supprimer/i }));

    expect(screen.getByLabelText<HTMLInputElement>(/titre/i).value).toEqual(
      openingNightEvent.title,
    );
  });

  it("should open form to edit/delete an event and close it (teacher)", async () => {
    vi.setSystemTime(new Date(openingNightEvent.start_time));

    await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: openingNightEvent.title }),
    );

    await user.click(screen.getByRole("button", { name: /fermer/i }));

    expect(screen.queryByRole("button", { name: /fermer/i })).toBeNull();
  });

  it("should open form and edit an event (teacher)", async () => {
    vi.setSystemTime(new Date(openingNightEvent.start_time));

    await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: openingNightEvent.title }),
    );

    const titleInput = screen.getByLabelText(/titre/i);
    await user.clear(titleInput);
    await user.type(
      titleInput,
      requestValue("events", "update", "opening_night", "title"),
    );

    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    expectFetchTo("events", "update", "opening_night");

    expect(screen.queryByRole("button", { name: /enregistrer/i })).toBeNull();
  });

  it("should open form and delete an event (teacher)", async () => {
    vi.setSystemTime(new Date(openingNightEvent.start_time));
    vi.spyOn(window, "confirm").mockReturnValue(true);

    await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: openingNightEvent.title }),
    );
    await user.click(screen.getByRole("button", { name: /supprimer/i }));

    expectFetchTo("events", "delete", "opening_night");

    expect(screen.queryByRole("button", { name: /supprimer/i })).toBeNull();
  });

  it("should open form to create a new event on a date (teacher)", async () => {
    await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    await user.click(screen.getByLabelText(/ajouter.*28$/i));

    await waitFor(() => screen.getByRole("button", { name: /^ajouter$/i }));
    await waitFor(() => screen.getByRole("button", { name: /fermer/i }));
  });

  it("should open form to create a new event on a date and close it (teacher)", async () => {
    await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    await user.click(screen.getByLabelText(/ajouter.*28$/i));

    await user.click(screen.getByRole("button", { name: /fermer/i }));

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /fermer/i })).toBeNull(),
    );
  });

  it("should open form and create a new event on a date (teacher)", async () => {
    vi.setSystemTime(
      new Date(requestValue("events", "create", "opening_night", "start_time")),
    );

    await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    await user.click(
      screen.getByLabelText(
        new RegExp(
          `ajouter.*${requestValue("events", "create", "opening_night", "start_time").split("T")[0]}`,
          "i",
        ),
      ),
    );

    await user.type(
      screen.getByLabelText(/titre/i),
      requestValue("events", "create", "opening_night", "title"),
    );

    await user.click(screen.getByRole("button", { name: /^ajouter$/i }));

    expectFetchTo("events", "create", "opening_night");
    await waitFor(() => expect(screen.queryByLabelText(/titre/i)).toBeNull());
  });
});
