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

describe("Roles API", () => {
  beforeEach(() => {
    setupDatabaseMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/plays/:id/roles", () => {
    it("should fetch roles successfully for a play member", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get(`/api/plays/${mainPlay.id}/roles`));

      expect(response.status).toBe(contracts.plays.roles.browse.status);
      expect(response.body).toEqual(contracts.plays.roles.browse.body);
    });

    it("should fail when user is not a member of the play", async () => {
      setupApiAuth(guestUser);

      const response = await using(api.get(`/api/plays/${mainPlay.id}/roles`));

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });

    it("should fail when play does not exist", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get(`/api/plays/999/roles`));

      expect(response.status).toBe(contracts.errors.notFound.status);
    });
  });

  describe("POST /api/plays/:id/roles", () => {
    it("should add a new role successfully with scenes", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/roles`).send({
          name: "Hamlet",
          description: "The Prince of Denmark",
          sceneIds: [mainScenes[0].id],
        }),
      );

      expect(response.status).toBe(contracts.plays.roles.create.status);
      expect(response.body).toEqual(contracts.plays.roles.create.body);
    });

    it("should add a new role successfully without scenes", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/roles`).send({
          name: "Hamlet",
          description: "The Prince of Denmark",
          sceneIds: [],
        }),
      );

      expect(response.status).toBe(contracts.plays.roles.create.status);
      expect(response.body).toEqual(contracts.plays.roles.create.body);
    });

    it("should fail when user is not a teacher of the play", async () => {
      setupApiAuth(actorUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/roles`).send({
          name: "Hamlet",
          description: "The Prince of Denmark",
          sceneIds: [mainScenes[0].id],
        }),
      );

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });

    it("should fail on invalid missing payload", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/roles`).send({}),
      );

      expect(response.status).toBe(contracts.errors.badRequest.status);
    });

    it("should fail when play does not exist", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/999/roles`).send({
          name: "Hamlet",
          description: "The Prince of Denmark",
          sceneIds: [mainScenes[0].id],
        }),
      );

      expect(response.status).toBe(contracts.errors.notFound.status);
    });
  });
});
