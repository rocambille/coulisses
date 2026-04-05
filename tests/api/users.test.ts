import {
  actorUser,
  api,
  mockedData,
  setupApiAuth,
  setupApiMocks,
  teacherUser,
  using,
} from "./mocks";

describe("Users API", () => {
  beforeEach(() => {
    setupApiMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/users", () => {
    it("should fetch users successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get("/api/users"), {
        withCsrf: false,
        withAuth: true,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockedData.user);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should fetch a single user successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get(`/api/users/${teacherUser.id}`), {
        withCsrf: false,
        withAuth: true,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(teacherUser);
    });

    it("should fail on invalid id", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get("/api/users/not-a-number"), {
        withCsrf: false,
        withAuth: true,
      });

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update an existing user successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api
          .put(`/api/users/${teacherUser.id}`)
          .send({ email: "updated@mail.com", name: "Updated" }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(204);
    });

    it("should fail on invalid id", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api
          .put("/api/users/not-a-number")
          .send({ email: "updated@mail.com", name: "Updated" }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(404);
    });

    it("should fail on invalid authorization", async () => {
      setupApiAuth(actorUser); // Not the same user id

      const response = await using(
        api
          .put(`/api/users/${teacherUser.id}`)
          .send({ email: "updated@mail.com", name: "Updated" }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(403);
    });

    it("should fail on invalid request body", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.put(`/api/users/${teacherUser.id}`).send({}),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete an existing user successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.delete(`/api/users/${teacherUser.id}`), {
        withCsrf: true,
        withAuth: true,
      });

      expect(response.status).toBe(204);
    });

    it("should not fail on invalid id", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.delete("/api/users/not-a-number"), {
        withCsrf: true,
        withAuth: true,
      });

      expect(response.status).toBe(204);
    });

    it("should fail on invalid authorization", async () => {
      setupApiAuth(actorUser);

      const response = await using(api.delete(`/api/users/${teacherUser.id}`), {
        withCsrf: true,
        withAuth: true,
      });

      expect(response.status).toBe(403);
    });
  });
});
