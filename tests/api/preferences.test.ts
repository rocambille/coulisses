import { contracts } from "../contracts";
import {
  api,
  guestUser,
  mainPlay,
  mainScenes,
  setupApiAuth,
  setupDatabaseMocks,
  teacherUser,
  using,
} from "./mocks";

describe("Preferences API", () => {
  beforeEach(() => {
    setupDatabaseMocks();
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

      expect(response.status).toBe(contracts.scenes.preferences.upsert.status);
      expect(response.body).toEqual(contracts.scenes.preferences.upsert.body);
    });

    it("should fail when user is not a member of the play", async () => {
      setupApiAuth(guestUser);

      const response = await using(
        api.post(`/api/scenes/${mainScenes[0].id}/preferences`).send({
          level: "HIGH",
        }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });

    it("should fail when sceneId is not found", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/scenes/not-a-number/preferences`).send({
          level: "HIGH",
        }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(contracts.errors.notFound.status);
    });

    it("should fail when payload level is invalid", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/scenes/${mainScenes[0].id}/preferences`).send({
          level: "UNKNOWN_LEVEL",
        }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(contracts.errors.badRequest.status);
    });
  });

  describe("GET /api/plays/:playId/preferences", () => {
    it("should fetch all preferences for the play successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.get(`/api/plays/${mainPlay.id}/preferences`),
        { withAuth: true, withCsrf: false },
      );

      expect(response.status).toBe(contracts.plays.preferences.browse.status);
      expect(response.body).toEqual(contracts.plays.preferences.browse.body);
    });

    it("should fail when user is not a member of the play", async () => {
      setupApiAuth(guestUser);

      const response = await using(
        api.get(`/api/plays/${mainPlay.id}/preferences`),
        { withAuth: true, withCsrf: false },
      );

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });
  });
});
