import {
  actorUser,
  api,
  guestUser,
  insertId,
  mainPlay,
  members,
  mockedData,
  setupApiAuth,
  setupApiMocks,
  teacherUser,
  using,
} from "./mocks";

describe("Plays API", () => {
  beforeEach(() => {
    setupApiMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/plays", () => {
    it("should fetch plays successfully for an authenticated member", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get("/api/plays"), {
        withCsrf: false,
        withAuth: true,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockedData.play);
    });

    it("should fail without access token", async () => {
      const response = await using(api.get("/api/plays"), {
        withCsrf: false,
        withAuth: false,
      });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/plays", () => {
    it("should add a new play successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post("/api/plays").send({ title: "New Play" }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ insertId });
    });

    it("should fail on invalid request body", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.post("/api/plays").send({}), {
        withCsrf: true,
        withAuth: true,
      });

      expect(response.status).toBe(400);
    });

    it("should fail without CSRF token", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.post("/api/plays").send({}), {
        withCsrf: false,
        withAuth: true,
      });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/plays/:id", () => {
    it("should fetch a single play successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get(`/api/plays/${mainPlay.id}`), {
        withCsrf: false,
        withAuth: true,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mainPlay);
    });

    it("should fail when user is not a member of the play", async () => {
      setupApiAuth(guestUser);

      const response = await using(api.get(`/api/plays/${mainPlay.id}`), {
        withCsrf: false,
        withAuth: true,
      });

      expect(response.status).toBe(403);
    });

    it("should fail on invalid playId", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get("/api/plays/not-a-number"), {
        withCsrf: false,
        withAuth: true,
      });

      expect(response.status).toBe(404);
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
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(204);
    });

    it("should fail when user is not a teacher of the play", async () => {
      setupApiAuth(actorUser);

      const response = await using(
        api.put(`/api/plays/${mainPlay.id}`).send({
          title: "Updated Play",
          description: "Updated Description",
        }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(403);
    });

    it("should fail on invalid request body", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.put(`/api/plays/${mainPlay.id}`).send({}),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/plays/:id", () => {
    it("should delete a play successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.delete(`/api/plays/${mainPlay.id}`), {
        withCsrf: true,
        withAuth: true,
      });

      expect(response.status).toBe(204);
    });

    it("should fail when user is not a teacher of the play", async () => {
      setupApiAuth(actorUser);

      const response = await using(api.delete(`/api/plays/${mainPlay.id}`), {
        withCsrf: true,
        withAuth: true,
      });

      expect(response.status).toBe(403);
    });

    it("should not fail on invalid playId", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.delete("/api/plays/not-a-number"), {
        withCsrf: true,
        withAuth: true,
      });

      expect(response.status).toBe(204);
    });
  });

  describe("GET /api/plays/:id/members", () => {
    it("should fetch members successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.get(`/api/plays/${mainPlay.id}/members`),
        { withCsrf: false, withAuth: true },
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(members(mainPlay));
    });

    it("should fail when user is not a member of the play", async () => {
      setupApiAuth(guestUser);

      const response = await using(
        api.get(`/api/plays/${mainPlay.id}/members`),
        { withCsrf: false, withAuth: true },
      );

      expect(response.status).toBe(403);
    });

    it("should fail on invalid playId", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get("/api/plays/not-a-number/members"), {
        withCsrf: false,
        withAuth: true,
      });

      expect(response.status).toBe(404);
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
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(204);
    });

    it("should fail on invalid request body", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/members`).send({}),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(400);
    });
  });
});
