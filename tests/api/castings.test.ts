import {
  actorUser,
  api,
  guestUser,
  mainPlay,
  setupApiAuth,
  setupApiMocks,
  teacherUser,
  using,
} from "./mocks";

describe("Castings API", () => {
  beforeEach(() => {
    setupApiMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/plays/:playId/castings", () => {
    it("should assign a role successfully when user is a teacher of the play", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/castings`).send({
          userId: teacherUser.id,
          roleId: 1,
        }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(201);
    });

    it("should fail when user is not a teacher of the play", async () => {
      setupApiAuth(actorUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/castings`).send({
          userId: teacherUser.id,
          roleId: 1,
        }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(403);
    });

    it("should fail on invalid request body", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/castings`).send({}),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/plays/:playId/castings", () => {
    it("should unassign a role successfully when user is a teacher of the play", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.delete(`/api/plays/${mainPlay.id}/castings`).send({
          userId: teacherUser.id,
          roleId: 1,
        }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(204);
    });

    it("should fail when user is not a teacher of the play", async () => {
      setupApiAuth(actorUser);

      const response = await using(
        api.delete(`/api/plays/${mainPlay.id}/castings`).send({
          userId: teacherUser.id,
          roleId: 1,
        }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(403);
    });

    it("should fail on invalid request body", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.delete(`/api/plays/${mainPlay.id}/castings`).send({}),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/plays/:playId/castings", () => {
    it("should fetch the full casting matrix successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.get(`/api/plays/${mainPlay.id}/castings`),
        { withCsrf: false, withAuth: true },
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("scenes");
      expect(response.body).toHaveProperty("roles");
      expect(response.body).toHaveProperty("preferences");
    });

    it("should fail when user is not a member of the play", async () => {
      setupApiAuth(guestUser);

      const response = await using(
        api.get(`/api/plays/${mainPlay.id}/castings`),
        { withCsrf: false, withAuth: true },
      );

      expect(response.status).toBe(403);
    });
  });
});
