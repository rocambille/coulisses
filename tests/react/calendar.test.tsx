import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CalendarPage from "../../src/react/components/play/CalendarPage";
import {
  actorUser,
  expectCsrfCookie,
  expectFetch,
  mainPlay,
  openingNightEvent,
  renderWithStub,
  setupApiMocks,
  teacherUser,
} from "./mocks";

describe("React: CalendarPage", () => {
  beforeEach(() => {
    setupApiMocks();
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

    expect(screen.queryByLabelText(/ajouter.*28T/i)).toBeNull();
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

    await waitFor(() => screen.getByLabelText(/ajouter.*28T/i));
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
    await user.type(titleInput, "Updated Night");

    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    expectCsrfCookie();
    expectFetch(`/api/events/${openingNightEvent.id}`, "put", {
      ...openingNightEvent,
      id: undefined,
      play_id: undefined,
      title: "Updated Night",
    });

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

    expectCsrfCookie();
    expectFetch(`/api/events/${openingNightEvent.id}`, "delete");

    expect(screen.queryByRole("button", { name: /supprimer/i })).toBeNull();
  });

  it("should open form to create a new event on a date (teacher)", async () => {
    vi.setSystemTime(new Date("2026-06-05T12:00:00Z"));

    await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    await user.click(screen.getByLabelText(/ajouter.*28T/i));

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

    await user.click(screen.getByLabelText(/ajouter.*28T/i));

    await user.click(screen.getByRole("button", { name: /fermer/i }));

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /fermer/i })).toBeNull(),
    );
  });

  it("should open form and create a new event on a date (teacher)", async () => {
    vi.setSystemTime(new Date("2026-06-05T12:00:00Z"));

    await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    await user.click(screen.getByLabelText(/ajouter.*28T/i));

    await user.type(screen.getByLabelText(/titre/i), "New Rehearsal");

    await user.click(screen.getByRole("button", { name: /^ajouter$/i }));

    expectCsrfCookie();
    expectFetch(`/api/plays/${mainPlay.id}/events`, "post", {
      title: "New Rehearsal",
      type: "SHOW",
      start_time: "2026-06-28T17:00:00.000Z",
      end_time: "2026-06-28T19:00:00.000Z",
      location: "",
      description: "",
    });
    await waitFor(() => expect(screen.queryByLabelText(/titre/i)).toBeNull());
  });
});
