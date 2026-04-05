import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CalendarPage from "../../src/react/components/play/CalendarPage";
import {
  actorUser,
  mainPlay,
  mockedRandomUUID,
  openingNightEvent,
  renderWithStub,
  setupMocks,
  teacherUser,
} from "./mocks";

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

    expect(screen.queryByLabelText(/ajouter.*28T/i)).toBeNull();
  });

  it("should allow user to navigate between months", async () => {
    vi.setSystemTime(new Date("2026-05-05T12:00:00Z"));

    await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /</i }));
    await waitFor(() => screen.getByText("Avril 2026"));

    await user.click(screen.getByRole("button", { name: />/i }));
    await waitFor(() => screen.getByText("Mai 2026"));
  });

  it("should display 'add' button for teachers", async () => {
    await renderWithStub(
      "/plays/:playId/calendar",
      CalendarPage,
      [`/plays/${mainPlay.id}/calendar`],
      { user: teacherUser },
    );

    await waitFor(() => screen.getByLabelText(/ajouter.*28T/i));
  });

  it("should open form to create on a date a new event", async () => {
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

    expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
      expires: expect.any(Number),
      name: "__Host-x-csrf-token",
      path: "/",
      sameSite: "strict",
      value: mockedRandomUUID,
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `/api/plays/${mainPlay.id}/events`,
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": mockedRandomUUID,
        },
        body: JSON.stringify({
          title: "New Rehearsal",
          type: "SHOW",
          start_time: "2026-06-28T17:00:00.000Z",
          end_time: "2026-06-28T19:00:00.000Z",
          location: "",
          description: "",
        }),
      },
    );
    await waitFor(() => expect(screen.queryByLabelText(/titre/i)).toBeNull());
  });

  it("should open form to create a new event on a date and close it", async () => {
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

  it("should open and close event details", async () => {
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

    await waitFor(() =>
      screen.getByText(new RegExp(openingNightEvent.description, "i")),
    );

    await user.click(screen.getByRole("button", { name: /fermer/i }));

    await waitFor(() =>
      expect(
        screen.queryByText(new RegExp(openingNightEvent.description, "i")),
      ).toBeNull(),
    );
  });

  it("should allow teacher to edit an event", async () => {
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
    await user.click(screen.getByRole("button", { name: /modifier/i }));

    const titleInput = screen.getByLabelText(/titre/i);
    await user.clear(titleInput);
    await user.type(titleInput, "Updated Night");

    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `/api/events/${openingNightEvent.id}`,
      {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": mockedRandomUUID,
        },
        body: expect.stringMatching(/"title":"Updated Night"/),
      },
    );

    await waitFor(() => expect(screen.queryByLabelText(/titre/i)).toBeNull());
  });

  it("should allow teacher to delete an event", async () => {
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
      screen.getByRole("button", {
        name: new RegExp(openingNightEvent.title, "i"),
      }),
    );
    await user.click(screen.getByRole("button", { name: /supprimer/i }));

    expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
      expires: expect.any(Number),
      name: "__Host-x-csrf-token",
      path: "/",
      sameSite: "strict",
      value: mockedRandomUUID,
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `/api/events/${openingNightEvent.id}`,
      {
        method: "delete",
        headers: {
          "X-CSRF-Token": mockedRandomUUID,
        },
      },
    );
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /supprimer/i })).toBeNull(),
    );
  });
});
