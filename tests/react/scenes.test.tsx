import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ScenesPage from "../../src/react/components/play/ScenesPage";
import {
  actorUser,
  expectCsrfCookie,
  expectFetchFrom,
  fromRequestBody,
  mainPlay,
  mainScenes,
  renderWithStub,
  setupApiMocks,
  teacherUser,
} from "./mocks";

describe("React: ScenesPage", () => {
  beforeEach(() => {
    setupApiMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render scenes list", async () => {
    await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: teacherUser },
    );

    await waitFor(() => screen.getByText(new RegExp(mainScenes[0].title, "i")));
    expect(
      screen.getByText(new RegExp(mainScenes[1].title, "i")),
    ).toBeDefined();
  });

  it("should add a new scene successfully (teacher)", async () => {
    await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    await user.type(
      screen.getByLabelText(/titre/i),
      fromRequestBody("scenes", "create", "teacher", "title"),
    );
    await user.click(screen.getByRole("button", { name: /ajouter/i }));

    expectCsrfCookie();
    expectFetchFrom("scenes", "create", "teacher");
  });

  it("should update preference successfully (actor)", async () => {
    await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: actorUser },
    );

    const user = userEvent.setup();

    await user.selectOptions(
      screen.getByLabelText(
        new RegExp(`envie.*scène.*${mainScenes[0].id}`, "i"),
      ),
      "HIGH",
    );

    expectCsrfCookie();
    expectFetchFrom("preferences", "upsert", "update");
  });

  it("should add a new preference successfully (actor)", async () => {
    await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: actorUser },
    );

    const user = userEvent.setup();

    await user.selectOptions(
      screen.getByLabelText(
        new RegExp(`envie.*scène.*${mainScenes[2].id}`, "i"),
      ),
      "HIGH",
    );

    expectCsrfCookie();
    expectFetchFrom("preferences", "upsert", "insert");
  });

  it("should display edit form when clicking on edit button", async () => {
    await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    await user.click(
      screen.getByLabelText(
        new RegExp(`modifier.*${mainScenes[0].title}`, "i"),
      ),
    );

    await waitFor(() =>
      screen.getByLabelText(
        new RegExp(`enregistrer.*${mainScenes[0].title}`, "i"),
      ),
    );
    await waitFor(() =>
      screen.getByLabelText(new RegExp(`annuler.*${mainScenes[0].title}`, "i")),
    );
  });

  it("should cancel editing a scene when clicking on cancel button", async () => {
    await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    await user.click(
      screen.getByLabelText(
        new RegExp(`modifier.*${mainScenes[0].title}`, "i"),
      ),
    );

    await waitFor(() =>
      screen.getByLabelText(
        new RegExp(`enregistrer.*${mainScenes[0].title}`, "i"),
      ),
    );
    await waitFor(() =>
      screen.getByLabelText(new RegExp(`annuler.*${mainScenes[0].title}`, "i")),
    );

    await user.click(
      screen.getByLabelText(new RegExp(`annuler.*${mainScenes[0].title}`, "i")),
    );

    await waitFor(() =>
      screen.getByLabelText(
        new RegExp(`modifier.*${mainScenes[0].title}`, "i"),
      ),
    );
  });

  it("should edit a scene successfully (teacher)", async () => {
    await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    await user.click(
      screen.getByLabelText(
        new RegExp(`modifier.*${mainScenes[0].title}`, "i"),
      ),
    );

    await waitFor(() =>
      screen.getByLabelText(
        new RegExp(`enregistrer.*${mainScenes[0].title}`, "i"),
      ),
    );

    await user.clear(screen.getByLabelText(/^titre$/i));
    await user.type(
      screen.getByLabelText(/^titre$/i),
      fromRequestBody("scenes", "update", "first_scene", "title"),
    );
    await user.click(
      screen.getByLabelText(
        new RegExp(`enregistrer.*${mainScenes[0].title}`, "i"),
      ),
    );

    expectCsrfCookie();
    expectFetchFrom("scenes", "update", "first_scene");
  });

  it("should delete a scene successfully (teacher)", async () => {
    await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: teacherUser },
    );

    const user = userEvent.setup();

    await user.click(
      screen.getByLabelText(
        new RegExp(`supprimer.*${mainScenes[0].title}`, "i"),
      ),
    );

    expectCsrfCookie();
    expectFetchFrom("scenes", "delete", "first_scene");
  });

  it("should select no preference when user has no preference", async () => {
    await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: actorUser },
    );

    const label = new RegExp(`envie.*scène.*${mainScenes[2].id}`, "i");
    await waitFor(() => screen.getByLabelText(label));

    expect(screen.getByLabelText<HTMLSelectElement>(label).value).toBe("");
  });
});
