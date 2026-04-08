import { contracts } from "../contracts";
import {
  actorUser,
  api,
  setupApiAuth,
  setupDatabaseMocks,
  teacherUser,
  using,
} from "./mocks";

describe("Users API", () => {
  beforeEach(() => {
    setupDatabaseMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/users", () => {
    it("should fetch users successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get("/api/users"));

      expect(response.status).toBe(contracts.users.browse.status);
      expect(response.body).toEqual(contracts.users.browse.body);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should fetch a single user successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get(`/api/users/${teacherUser.id}`));

      expect(response.status).toBe(contracts.users.get.status);
      expect(response.body).toEqual(contracts.users.get.body);
    });

    it("should fail on invalid id", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get("/api/users/not-a-number"));

      expect(response.status).toBe(contracts.errors.notFound.status);
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update an existing user successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api
          .put(`/api/users/${teacherUser.id}`)
          .send({ email: "updated@mail.com", name: "Updated" }),
      );

      expect(response.status).toBe(contracts.users.update.status);
      expect(response.body).toEqual(contracts.users.update.body);
    });

    it("should fail on invalid id", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api
          .put("/api/users/not-a-number")
          .send({ email: "updated@mail.com", name: "Updated" }),
      );

      expect(response.status).toBe(contracts.errors.notFound.status);
    });

    it("should fail on invalid authorization", async () => {
      setupApiAuth(actorUser); // Not the same user id

      const response = await using(
        api
          .put(`/api/users/${teacherUser.id}`)
          .send({ email: "updated@mail.com", name: "Updated" }),
      );

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });

    it("should fail on invalid request body", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.put(`/api/users/${teacherUser.id}`).send({}),
      );

      expect(response.status).toBe(contracts.errors.badRequest.status);
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete an existing user successfully", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.delete(`/api/users/${teacherUser.id}`));

      expect(response.status).toBe(contracts.users.delete.status);
      expect(response.body).toEqual(contracts.users.delete.body);
    });

    it("should not fail on invalid id", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.delete("/api/users/not-a-number"));

      expect(response.status).toBe(contracts.users.delete.status);
      expect(response.body).toEqual(contracts.users.delete.body);
    });

    it("should fail on invalid authorization", async () => {
      setupApiAuth(actorUser);

      const response = await using(api.delete(`/api/users/${teacherUser.id}`));

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });
  });
});
