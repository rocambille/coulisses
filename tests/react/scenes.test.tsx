import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ScenesPage from "../../src/react/components/play/ScenesPage";
import {
  actorUser,
  expectCsrfCookie,
  expectFetch,
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

    await user.type(screen.getByLabelText(/titre/i), "Test");
    await user.click(screen.getByRole("button", { name: /ajouter/i }));

    expectCsrfCookie();
    expectFetch(`/api/plays/${mainPlay.id}/scenes`, "post", {
      title: "Test",
      scene_order: mainScenes.length + 1,
    });
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
      screen.getByLabelText(new RegExp(`envie.*${mainScenes[0].title}`, "i")),
      "HIGH",
    );

    expectCsrfCookie();
    expectFetch(`/api/scenes/${mainScenes[0].id}/preferences`, "post", {
      level: "HIGH",
    });
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
    await user.type(screen.getByLabelText(/^titre$/i), "updated");
    await user.click(
      screen.getByLabelText(
        new RegExp(`enregistrer.*${mainScenes[0].title}`, "i"),
      ),
    );

    expectCsrfCookie();
    expectFetch(`/api/scenes/${mainScenes[0].id}`, "put", {
      title: "updated",
      scene_order: mainScenes[0].scene_order,
    });
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
    expectFetch(`/api/scenes/${mainScenes[0].id}`, "delete");
  });

  it("should select no preference when user has no preference", async () => {
    await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: actorUser },
    );

    const label = new RegExp(`envie.*${mainScenes[2].title}`, "i");
    await waitFor(() => screen.getByLabelText(label));

    expect(screen.getByLabelText<HTMLSelectElement>(label).value).toBe("");
  });
});
