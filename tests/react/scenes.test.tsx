import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ScenesPage from "../../src/react/components/play/ScenesPage";
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

beforeEach(() => {
  mockCsrfToken();
  mockFetch();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("<ScenesPage />", () => {
  it("should mount successfully", async () => {
    mockUseAuth(mockedUsers[0]);

    const Stub = stubRoute("/plays/:playId/scenes", ScenesPage);

    await renderAsync(<Stub initialEntries={["/plays/1/scenes"]} />);

    await waitFor(() => screen.getByRole("heading", { level: 2 }));
  });

  it("should add a new scene successfully (teacher)", async () => {
    const [location] = mockWindowLocation();

    mockUseAuth(mockedUsers[0]);

    const Stub = stubRoute("/plays/:playId/scenes", ScenesPage);

    await renderAsync(<Stub initialEntries={["/plays/1/scenes"]} />);

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/titre/i), "Test");
    await user.click(screen.getByRole("button", { name: /ajouter/i }));

    expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
      expires: expect.any(Number),
      name: "__Host-x-csrf-token",
      path: "/",
      sameSite: "strict",
      value: mockedRandomUUID,
    });
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/plays/1/scenes", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": mockedRandomUUID,
      },
      body: JSON.stringify({
        title: "Test",
        scene_order: mockedPlays[0].scenes.length + 1,
      }),
    });
    expect(location.reload).toHaveBeenCalled();
  });

  it("should add a new preference successfully (actor)", async () => {
    mockUseAuth(mockedUsers[1]);
    const [location] = mockWindowLocation();

    const Stub = stubRoute("/plays/:playId/scenes", ScenesPage);

    await renderAsync(<Stub initialEntries={["/plays/1/scenes"]} />);

    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText(/envie.*scène 1/i), "HIGH");

    expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
      expires: expect.any(Number),
      name: "__Host-x-csrf-token",
      path: "/",
      sameSite: "strict",
      value: mockedRandomUUID,
    });
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/scenes/1/preferences", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": mockedRandomUUID,
      },
      body: JSON.stringify({ level: "HIGH" }),
    });
    expect(location.reload).toHaveBeenCalled();
  });

  it("should display edit form when clicking on edit button", async () => {
    mockUseAuth(mockedUsers[0]);

    const Stub = stubRoute("/plays/:playId/scenes", ScenesPage);

    await renderAsync(<Stub initialEntries={["/plays/1/scenes"]} />);

    const user = userEvent.setup();

    await user.click(screen.getByLabelText(/modifier.*foo.1/i));

    await waitFor(() => screen.getByLabelText(/enregistrer.*foo.1/i));
    await waitFor(() => screen.getByLabelText(/annuler.*foo.1/i));
  });

  it("should cancel editing a scene when clicking on cancel button", async () => {
    mockUseAuth(mockedUsers[0]);

    const Stub = stubRoute("/plays/:playId/scenes", ScenesPage);

    await renderAsync(<Stub initialEntries={["/plays/1/scenes"]} />);

    const user = userEvent.setup();

    await user.click(screen.getByLabelText(/modifier.*foo.1/i));

    await waitFor(() => screen.getByLabelText(/enregistrer.*foo.1/i));
    await waitFor(() => screen.getByLabelText(/annuler.*foo.1/i));

    await user.click(screen.getByLabelText(/annuler.*foo.1/i));

    await waitFor(() => screen.getByLabelText(/modifier.*foo.1/i));
  });

  it("should edit a scene successfully (teacher)", async () => {
    const [location] = mockWindowLocation();

    mockUseAuth(mockedUsers[0]);

    const Stub = stubRoute("/plays/:playId/scenes", ScenesPage);

    await renderAsync(<Stub initialEntries={["/plays/1/scenes"]} />);

    const user = userEvent.setup();

    await user.click(screen.getByLabelText(/modifier.*foo.1/i));

    await waitFor(() => screen.getByLabelText(/enregistrer.*foo.1/i));

    await user.clear(screen.getByLabelText(/^titre$/i));
    await user.type(screen.getByLabelText(/^titre$/i), "updated");
    await user.click(screen.getByLabelText(/enregistrer.*foo.1/i));

    expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
      expires: expect.any(Number),
      name: "__Host-x-csrf-token",
      path: "/",
      sameSite: "strict",
      value: mockedRandomUUID,
    });
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/scenes/1", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": mockedRandomUUID,
      },
      body: JSON.stringify({
        title: "updated",
        scene_order: mockedPlays[0].scenes[0].scene_order,
      }),
    });
    expect(location.reload).toHaveBeenCalled();
  });

  it("should delete a scene successfully (teacher)", async () => {
    const [location] = mockWindowLocation();

    mockUseAuth(mockedUsers[0]);

    const Stub = stubRoute("/plays/:playId/scenes", ScenesPage);

    await renderAsync(<Stub initialEntries={["/plays/1/scenes"]} />);

    const user = userEvent.setup();

    await user.click(screen.getByLabelText(/supprimer.*foo.1/i));

    expect(globalThis.cookieStore.set).toHaveBeenCalledWith({
      expires: expect.any(Number),
      name: "__Host-x-csrf-token",
      path: "/",
      sameSite: "strict",
      value: mockedRandomUUID,
    });
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/scenes/1", {
      method: "delete",
      headers: {
        "X-CSRF-Token": mockedRandomUUID,
      },
    });
    expect(location.reload).toHaveBeenCalled();
  });

  it("should select no preference when user has no preference", async () => {
    mockUseAuth(mockedUsers[1]);

    const Stub = stubRoute("/plays/:playId/scenes", ScenesPage);

    await renderAsync(<Stub initialEntries={["/plays/1/scenes"]} />);

    await waitFor(() => screen.getByLabelText(/envie.*scène 3/i));

    expect(
      screen.getByLabelText<HTMLSelectElement>(/envie.*scène 3/i).value,
    ).toBe("");
  });
});
