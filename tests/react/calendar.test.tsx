import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CalendarPage from "../../src/react/components/play/CalendarPage";
import {
  mockCsrfToken,
  mockedPlays,
  mockedRandomUUID,
  mockedUsers,
  mockFetch,
  mockUseAuth,
  mockWindowLocation,
  renderAsync,
  stubRoute,
} from "./utils";

describe("CalendarPage", () => {
  beforeEach(() => {
    mockCsrfToken();
    mockFetch();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should mount successfully", async () => {
    mockUseAuth(mockedUsers[1]);

    const Stub = stubRoute("/plays/:playId/calendar", CalendarPage);

    await renderAsync(
      <Stub initialEntries={[`/plays/${mockedPlays[0].id}/calendar`]} />,
    );

    await waitFor(() => expect(screen.getByRole("heading", { level: 2 })));

    expect(screen.queryByLabelText(/ajouter.*28T/i)).toBeNull();
  });

  it("should allow user to navigate between months", async () => {
    vi.setSystemTime(new Date("2026-05-05T12:00:00Z"));

    mockUseAuth(mockedUsers[0]);

    const Stub = stubRoute("/plays/:playId/calendar", CalendarPage);

    await renderAsync(
      <Stub initialEntries={[`/plays/${mockedPlays[0].id}/calendar`]} />,
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /</i }));
    await waitFor(() => expect(screen.getByText("Avril 2026")));

    await user.click(screen.getByRole("button", { name: />/i }));
    await waitFor(() => expect(screen.getByText("Mai 2026")));

    vi.useRealTimers();
  });

  it("should display 'add' button for teachers", async () => {
    mockUseAuth(mockedUsers[0]);

    const Stub = stubRoute("/plays/:playId/calendar", CalendarPage);

    await renderAsync(
      <Stub initialEntries={[`/plays/${mockedPlays[0].id}/calendar`]} />,
    );

    await waitFor(() => expect(screen.getByLabelText(/ajouter.*28T/i)));
  });

  it("should open form to create on a date a new event", async () => {
    vi.setSystemTime(new Date("2026-06-05T12:00:00Z"));

    mockUseAuth(mockedUsers[0]);
    mockWindowLocation();

    const Stub = stubRoute("/plays/:playId/calendar", CalendarPage);

    await renderAsync(
      <Stub initialEntries={[`/plays/${mockedPlays[0].id}/calendar`]} />,
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
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/plays/1/events", {
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
    });
    expect(location.reload).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("should open form to create a new event on a date and close it", async () => {
    mockUseAuth(mockedUsers[0]);

    const Stub = stubRoute("/plays/:playId/calendar", CalendarPage);

    await renderAsync(
      <Stub initialEntries={[`/plays/${mockedPlays[0].id}/calendar`]} />,
    );

    const user = userEvent.setup();

    await user.click(screen.getByLabelText(/ajouter.*28T/i));

    await user.click(screen.getByRole("button", { name: /fermer/i }));

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /fermer/i })).toBeNull(),
    );
  });

  it("should open and close event details", async () => {
    vi.setSystemTime(new Date(mockedPlays[0].events[0].start_time));

    mockUseAuth(mockedUsers[0]);

    const Stub = stubRoute("/plays/:playId/calendar", CalendarPage);

    await renderAsync(
      <Stub initialEntries={[`/plays/${mockedPlays[0].id}/calendar`]} />,
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /opening night/i }));

    await waitFor(() => expect(screen.getByText(/opening night description/i)));

    await user.click(screen.getByRole("button", { name: /fermer/i }));

    await waitFor(() =>
      expect(screen.queryByText(/opening night description/i)).toBeNull(),
    );

    vi.useRealTimers();
  });

  it("should allow teacher to delete an event", async () => {
    const [location] = mockWindowLocation();

    vi.setSystemTime(new Date(mockedPlays[0].events[0].start_time));
    vi.spyOn(window, "confirm").mockReturnValue(true);

    mockUseAuth(mockedUsers[0]);

    const Stub = stubRoute("/plays/:playId/calendar", CalendarPage);

    await renderAsync(
      <Stub initialEntries={[`/plays/${mockedPlays[0].id}/calendar`]} />,
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /opening night/i }));
    await user.click(screen.getByRole("button", { name: /supprimer/i }));

    expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
      expires: expect.any(Number),
      name: "__Host-x-csrf-token",
      path: "/",
      sameSite: "strict",
      value: mockedRandomUUID,
    });
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/events/1", {
      method: "delete",
      headers: {
        "X-CSRF-Token": mockedRandomUUID,
      },
    });
    expect(location.reload).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
