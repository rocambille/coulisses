import {
  api,
  guestUser,
  mainPlay,
  mainScenes,
  setupApiAuth,
  setupApiMocks,
  teacherUser,
  using,
} from "./mocks";

describe("Preferences API", () => {
  beforeEach(() => {
    setupApiMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/scenes/:sceneId/preferences", () => {
    it("should create/update a preference successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/scenes/${mainScenes[0].id}/preferences`).send({
          level: "HIGH",
        }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(204);
    });

    it("should fail when user is not a member of the play", async () => {
      setupApiAuth(guestUser);

      const response = await using(
        api.post(`/api/scenes/${mainScenes[0].id}/preferences`).send({
          level: "HIGH",
        }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(403);
    });

    it("should fail when sceneId is not found", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/scenes/not-a-number/preferences`).send({
          level: "HIGH",
        }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(404);
    });

    it("should fail when payload level is invalid", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/scenes/${mainScenes[0].id}/preferences`).send({
          level: "UNKNOWN_LEVEL",
        }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/plays/:playId/preferences", () => {
    it("should fetch all preferences for the play successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.get(`/api/plays/${mainPlay.id}/preferences`),
        { withAuth: true, withCsrf: false },
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty("level");
      }
    });

    it("should fail when user is not a member of the play", async () => {
      setupApiAuth(guestUser);

      const response = await using(
        api.get(`/api/plays/${mainPlay.id}/preferences`),
        { withAuth: true, withCsrf: false },
      );

      expect(response.status).toBe(403);
    });
  });
});
