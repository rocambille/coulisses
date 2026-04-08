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

describe("Plays API", () => {
  beforeEach(() => {
    setupDatabaseMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/plays", () => {
    it("should fetch plays successfully for an authenticated member", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get("/api/plays"));

      expect(response.status).toBe(contracts.plays.browse.status);
      expect(response.body).toEqual(contracts.plays.browse.body);
    });

    it("should fail without access token", async () => {
      const response = await using(api.get("/api/plays"), {
        withAuth: false,
      });

      expect(response.status).toBe(contracts.errors.unauthorized.status);
    });
  });

  describe("POST /api/plays", () => {
    it("should add a new play successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post("/api/plays").send({ title: "New Play" }),
      );

      expect(response.status).toBe(contracts.plays.create.status);
      expect(response.body).toEqual(contracts.plays.create.body);
    });

    it("should fail on invalid request body", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.post("/api/plays").send({}));

      expect(response.status).toBe(contracts.errors.badRequest.status);
    });
  });

  describe("GET /api/plays/:id", () => {
    it("should fetch a single play successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get(`/api/plays/${mainPlay.id}`));

      expect(response.status).toBe(contracts.plays.get.status);
      expect(response.body).toEqual(contracts.plays.get.body);
    });

    it("should fail when user is not a member of the play", async () => {
      setupApiAuth(guestUser);

      const response = await using(api.get(`/api/plays/${mainPlay.id}`));

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });

    it("should fail on invalid playId", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get("/api/plays/not-a-number"));

      expect(response.status).toBe(contracts.errors.notFound.status);
    });
  });

  describe("PUT /api/plays/:id", () => {
    it("should update a play successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.put(`/api/plays/${mainPlay.id}`).send({
          title: "Updated Play",
          description: "Updated Description",
        }),
      );

      expect(response.status).toBe(contracts.plays.update.status);
      expect(response.body).toEqual(contracts.plays.update.body);
    });

    it("should fail when user is not a teacher of the play", async () => {
      setupApiAuth(actorUser);

      const response = await using(
        api.put(`/api/plays/${mainPlay.id}`).send({
          title: "Updated Play",
          description: "Updated Description",
        }),
      );

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });

    it("should fail on invalid request body", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.put(`/api/plays/${mainPlay.id}`).send({}),
      );

      expect(response.status).toBe(contracts.errors.badRequest.status);
    });
  });

  describe("DELETE /api/plays/:id", () => {
    it("should delete a play successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.delete(`/api/plays/${mainPlay.id}`));

      expect(response.status).toBe(contracts.plays.delete.status);
      expect(response.body).toEqual(contracts.plays.delete.body);
    });

    it("should fail when user is not a teacher of the play", async () => {
      setupApiAuth(actorUser);

      const response = await using(api.delete(`/api/plays/${mainPlay.id}`));

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });

    it("should not fail on invalid playId", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.delete("/api/plays/not-a-number"));

      expect(response.status).toBe(contracts.plays.delete.status);
      expect(response.body).toEqual(contracts.plays.delete.body);
    });
  });

  describe("GET /api/plays/:id/members", () => {
    it("should fetch members successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.get(`/api/plays/${mainPlay.id}/members`),
      );

      expect(response.status).toBe(contracts.plays.members.browse.status);
      expect(response.body).toEqual(contracts.plays.members.browse.body);
    });

    it("should fail when user is not a member of the play", async () => {
      setupApiAuth(guestUser);

      const response = await using(
        api.get(`/api/plays/${mainPlay.id}/members`),
      );

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });

    it("should fail on invalid playId", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get("/api/plays/not-a-number/members"));

      expect(response.status).toBe(contracts.errors.notFound.status);
    });
  });

  describe("POST /api/plays/:id/members", () => {
    it("should allow a teacher to invite a member", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/members`).send({
          email: actorUser.email,
          role: "ACTOR",
        }),
      );

      expect(response.status).toBe(contracts.plays.members.invite.status);
      expect(response.body).toEqual(contracts.plays.members.invite.body);
    });

    it("should fail on invalid request body", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/members`).send({}),
      );

      expect(response.status).toBe(contracts.errors.badRequest.status);
    });
  });
});
