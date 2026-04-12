import { screen } from "@testing-library/react";
import ScenesPage from "../../src/react/components/play/ScenesPage";
import {
  actorUser,
  expectContractCall,
  mainPlay,
  mainScenes,
  renderWithStub,
  requestValue,
  setupMocks,
  teacherUser,
} from "./test-utils";

describe("React: ScenesPage", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should mount successfully and render scenes list", async () => {
    await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: teacherUser },
    );

    await screen.findByText(new RegExp(mainScenes[0].title, "i"));
    expect(
      screen.getByText(new RegExp(mainScenes[1].title, "i")),
    ).toBeDefined();
  });

  it("should add a new scene successfully (teacher)", async () => {
    const { user } = await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: teacherUser },
    );

    await user.type(
      screen.getByLabelText(/titre/i),
      requestValue("scenes", "create", "teacher", "title"),
    );
    await user.click(screen.getByRole("button", { name: /ajouter/i }));

    expectContractCall("scenes", "create", "teacher");
  });

  it("should update preference successfully (actor)", async () => {
    const { user } = await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: actorUser },
    );

    await user.selectOptions(
      screen.getByLabelText(
        new RegExp(`envie.*scène.*${mainScenes[0].id}`, "i"),
      ),
      "HIGH",
    );

    expectContractCall("preferences", "upsert", "update");
  });

  it("should add a new preference successfully (actor)", async () => {
    const { user } = await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: actorUser },
    );

    await user.selectOptions(
      screen.getByLabelText(
        new RegExp(`envie.*scène.*${mainScenes[2].id}`, "i"),
      ),
      "HIGH",
    );

    expectContractCall("preferences", "upsert", "insert");
  });

  it("should display edit form when clicking on edit button", async () => {
    const { user } = await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: teacherUser },
    );

    await user.click(
      screen.getByLabelText(
        new RegExp(`modifier.*${mainScenes[0].title}`, "i"),
      ),
    );

    await screen.findByLabelText(
      new RegExp(`enregistrer.*${mainScenes[0].title}`, "i"),
    );
    await screen.findByLabelText(
      new RegExp(`annuler.*${mainScenes[0].title}`, "i"),
    );
  });

  it("should cancel editing a scene when clicking on cancel button", async () => {
    const { user } = await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: teacherUser },
    );

    await user.click(
      screen.getByLabelText(
        new RegExp(`modifier.*${mainScenes[0].title}`, "i"),
      ),
    );

    await screen.findByLabelText(
      new RegExp(`enregistrer.*${mainScenes[0].title}`, "i"),
    );
    await screen.findByLabelText(
      new RegExp(`annuler.*${mainScenes[0].title}`, "i"),
    );

    await user.click(
      screen.getByLabelText(new RegExp(`annuler.*${mainScenes[0].title}`, "i")),
    );

    await screen.findByLabelText(
      new RegExp(`modifier.*${mainScenes[0].title}`, "i"),
    );
  });

  it("should edit a scene successfully (teacher)", async () => {
    const { user } = await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: teacherUser },
    );

    await user.click(
      screen.getByLabelText(
        new RegExp(`modifier.*${mainScenes[0].title}`, "i"),
      ),
    );

    await screen.findByLabelText(
      new RegExp(`enregistrer.*${mainScenes[0].title}`, "i"),
    );

    await user.clear(screen.getByLabelText(/^titre$/i));
    await user.type(
      screen.getByLabelText(/^titre$/i),
      requestValue("scenes", "update", "first_scene", "title"),
    );
    await user.click(
      screen.getByLabelText(
        new RegExp(`enregistrer.*${mainScenes[0].title}`, "i"),
      ),
    );

    expectContractCall("scenes", "update", "first_scene");
  });

  it("should delete a scene successfully (teacher)", async () => {
    const { user } = await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: teacherUser },
    );

    await user.click(
      screen.getByLabelText(
        new RegExp(`supprimer.*${mainScenes[0].title}`, "i"),
      ),
    );

    expectContractCall("scenes", "delete", "first_scene");
  });

  it("should select no preference when user has no preference", async () => {
    await renderWithStub(
      "/plays/:playId/scenes",
      ScenesPage,
      [`/plays/${mainPlay.id}/scenes`],
      { user: actorUser },
    );

    const label = new RegExp(`envie.*scène.*${mainScenes[2].id}`, "i");
    await screen.findByLabelText(label);

    expect(screen.getByLabelText<HTMLSelectElement>(label).value).toBe("");
  });
});
