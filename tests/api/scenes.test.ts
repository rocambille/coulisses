import {
  actorUser,
  api,
  guestUser,
  insertId,
  mainPlay,
  mainScenes,
  mockedData,
  setupApiAuth,
  setupApiMocks,
  teacherUser,
  using,
} from "./mocks";

describe("Scenes API", () => {
  beforeEach(() => {
    setupApiMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/plays/:id/scenes", () => {
    it("should fetch scenes successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.get(`/api/plays/${mainPlay.id}/scenes`),
        {
          withCsrf: false,
          withAuth: true,
        },
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockedData.scene);
    });

    it("should fail when user is not a member of the play", async () => {
      setupApiAuth(guestUser);

      const response = await using(
        api.get(`/api/plays/${mainPlay.id}/scenes`),
        {
          withCsrf: false,
          withAuth: true,
        },
      );

      expect(response.status).toBe(403);
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
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ insertId });
    });

    it("should fail when user is not a teacher of the play", async () => {
      setupApiAuth(actorUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/scenes`).send({
          title: "New Scene",
          scene_order: 2,
        }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(403);
    });

    it("should fail on invalid request body", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/scenes`).send({}),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/scenes/:id", () => {
    it("should fetch a scene successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get(`/api/scenes/${mainScenes[0].id}`), {
        withCsrf: false,
        withAuth: true,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mainScenes[0]);
    });

    it("should fail when user is not a member of the play", async () => {
      setupApiAuth(guestUser);

      const response = await using(api.get(`/api/scenes/${mainScenes[0].id}`), {
        withCsrf: false,
        withAuth: true,
      });

      expect(response.status).toBe(403);
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
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(204);
    });

    it("should fail when user is not a teacher of the play", async () => {
      setupApiAuth(actorUser);

      const response = await using(
        api.put(`/api/scenes/${mainScenes[0].id}`).send({
          title: "Updated Scene",
          scene_order: 1,
        }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /api/scenes/:id", () => {
    it("should delete a scene successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.delete(`/api/scenes/${mainScenes[0].id}`),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(204);
    });

    it("should not fail when sceneId is not found", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.delete(`/api/scenes/not-a-number`), {
        withCsrf: true,
        withAuth: true,
      });

      expect(response.status).toBe(204);
    });

    it("should fail when user is not a teacher of the play", async () => {
      setupApiAuth(actorUser);

      const response = await using(
        api.delete(`/api/scenes/${mainScenes[0].id}`),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(403);
    });
  });
});
