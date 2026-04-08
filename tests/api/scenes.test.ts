import { contracts } from "../contracts";
import {
  actorUser,
  api,
  guestUser,
  mainPlay,
  mainScenes,
  setupApiAuth,
  setupDatabaseMocks,
  teacherUser,
  using,
} from "./mocks";

describe("Scenes API", () => {
  beforeEach(() => {
    setupDatabaseMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/plays/:id/scenes", () => {
    it("should fetch scenes successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get(`/api/plays/${mainPlay.id}/scenes`));

      expect(response.status).toBe(contracts.plays.scenes.browse.status);
      expect(response.body).toEqual(contracts.plays.scenes.browse.body);
    });

    it("should fail when user is not a member of the play", async () => {
      setupApiAuth(guestUser);

      const response = await using(api.get(`/api/plays/${mainPlay.id}/scenes`));

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });
  });

  describe("POST /api/plays/:id/scenes", () => {
    it("should add a new scene successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/scenes`).send({
          title: "New Scene",
          scene_order: 2,
        }),
      );

      expect(response.status).toBe(contracts.plays.scenes.create.status);
      expect(response.body).toEqual(contracts.plays.scenes.create.body);
    });

    it("should fail when user is not a teacher of the play", async () => {
      setupApiAuth(actorUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/scenes`).send({
          title: "New Scene",
          scene_order: 2,
        }),
      );

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });

    it("should fail on invalid request body", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/scenes`).send({}),
      );

      expect(response.status).toBe(contracts.errors.badRequest.status);
    });
  });

  describe("GET /api/scenes/:id", () => {
    it("should fetch a scene successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get(`/api/scenes/${mainScenes[0].id}`));

      expect(response.status).toBe(contracts.scenes.get.status);
      expect(response.body).toEqual(contracts.scenes.get.body);
    });

    it("should fail when user is not a member of the play", async () => {
      setupApiAuth(guestUser);

      const response = await using(api.get(`/api/scenes/${mainScenes[0].id}`));

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });
  });

  describe("PUT /api/scenes/:id", () => {
    it("should update a scene successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.put(`/api/scenes/${mainScenes[0].id}`).send({
          title: "Updated Scene",
          scene_order: 1,
        }),
      );

      expect(response.status).toBe(contracts.scenes.update.status);
      expect(response.body).toEqual(contracts.scenes.update.body);
    });

    it("should fail when user is not a teacher of the play", async () => {
      setupApiAuth(actorUser);

      const response = await using(
        api.put(`/api/scenes/${mainScenes[0].id}`).send({
          title: "Updated Scene",
          scene_order: 1,
        }),
      );

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });
  });

  describe("DELETE /api/scenes/:id", () => {
    it("should delete a scene successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.delete(`/api/scenes/${mainScenes[0].id}`),
      );

      expect(response.status).toBe(contracts.scenes.delete.status);
      expect(response.body).toEqual(contracts.scenes.delete.body);
    });

    it("should not fail when sceneId is not found", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.delete(`/api/scenes/not-a-number`));

      expect(response.status).toBe(contracts.scenes.delete.status);
      expect(response.body).toEqual(contracts.scenes.delete.body);
    });

    it("should fail when user is not a teacher of the play", async () => {
      setupApiAuth(actorUser);

      const response = await using(
        api.delete(`/api/scenes/${mainScenes[0].id}`),
      );

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });
  });
});
