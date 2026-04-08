import { contracts } from "../contracts";
import {
  actorUser,
  api,
  guestUser,
  mainPlay,
  setupApiAuth,
  setupDatabaseMocks,
  teacherUser,
  using,
} from "./mocks";

describe("Castings API", () => {
  beforeEach(() => {
    setupDatabaseMocks();
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
      );

      expect(response.status).toBe(contracts.plays.castings.assign.status);
      expect(response.body).toEqual(contracts.plays.castings.assign.body);
    });

    it("should fail when user is not a teacher of the play", async () => {
      setupApiAuth(actorUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/castings`).send({
          userId: teacherUser.id,
          roleId: 1,
        }),
      );

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });

    it("should fail on invalid request body", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/castings`).send({}),
      );

      expect(response.status).toBe(contracts.errors.badRequest.status);
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
      );

      expect(response.status).toBe(contracts.plays.castings.unassign.status);
      expect(response.body).toEqual(contracts.plays.castings.unassign.body);
    });

    it("should fail when user is not a teacher of the play", async () => {
      setupApiAuth(actorUser);

      const response = await using(
        api.delete(`/api/plays/${mainPlay.id}/castings`).send({
          userId: teacherUser.id,
          roleId: 1,
        }),
      );

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });

    it("should fail on invalid request body", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.delete(`/api/plays/${mainPlay.id}/castings`).send({}),
      );

      expect(response.status).toBe(contracts.errors.badRequest.status);
    });
  });

  describe("GET /api/plays/:playId/castings", () => {
    it("should fetch the full casting matrix successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.get(`/api/plays/${mainPlay.id}/castings`),
      );

      expect(response.status).toBe(contracts.plays.castings.browse.status);
      expect(response.body).toEqual(contracts.plays.castings.browse.body);
    });

    it("should fail when user is not a member of the play", async () => {
      setupApiAuth(guestUser);

      const response = await using(
        api.get(`/api/plays/${mainPlay.id}/castings`),
      );

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });
  });
});
