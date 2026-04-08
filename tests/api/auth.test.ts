import jwt from "jsonwebtoken";
import { contracts } from "../contracts";
import {
  api,
  setupApiAuth,
  setupDatabaseMocks,
  teacherUser,
  using,
} from "./mocks";

describe("Auth API", () => {
  beforeEach(() => {
    setupDatabaseMocks();
    vi.spyOn(jwt, "sign").mockImplementation(() => "fake_jwt_token");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/auth/magic-link", () => {
    it("should send a magic link successfully", async () => {
      const response = await using(
        api.post("/api/auth/magic-link").send({ email: teacherUser.email }),
        { withAuth: false },
      );

      expect(response.status).toBe(contracts.auth.magicLink.status);
      expect(response.body).toEqual(contracts.auth.magicLink.body);
    });

    it("should fail without email", async () => {
      const response = await using(api.post("/api/auth/magic-link").send({}), {
        withAuth: false,
      });

      expect(response.status).toBe(contracts.errors.badRequest.status);
    });
  });

  describe("POST /api/auth/verify", () => {
    it("should verify magic link and return cookie", async () => {
      setupApiAuth({ email: teacherUser.email });

      const response = await using(
        api.post("/api/auth/verify").send({ token: "magic_token" }),
        { withAuth: false },
      );

      expect(response.status).toBe(contracts.auth.verifySuccess.status);
      expect(response.body).toEqual(contracts.auth.verifySuccess.body);
      const cookies = response.headers["set-cookie"]?.toString();
      expect(cookies).toBeDefined();
      expect(cookies.includes("__Host-auth=")).toBe(true);
    });

    it("should create a new user if not exists", async () => {
      setupApiAuth({ email: "new_user@mail.com" });

      const response = await using(
        api.post("/api/auth/verify").send({ token: "magic_token" }),
        { withAuth: false },
      );

      expect(response.status).toBe(contracts.auth.verifySuccess.status);
      expect(response.body).toEqual({
        id: expect.any(Number),
        email: "new_user@mail.com",
        name: "new_user",
      });
      const cookies = response.headers["set-cookie"]?.toString();
      expect(cookies).toBeDefined();
      expect(cookies.includes("__Host-auth=")).toBe(true);
    });

    it("should fail on missing token", async () => {
      const response = await using(api.post("/api/auth/verify").send({}), {
        withAuth: false,
      });

      expect(response.status).toBe(contracts.errors.badRequest.status);
    });

    it("should fail on invalid token", async () => {
      setupApiAuth(null);

      const response = await using(
        api.post("/api/auth/verify").send({ token: "invalid_token" }),
      );

      expect(response.status).toBe(contracts.errors.unauthorized.status);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should clear the cookie", async () => {
      const response = await using(api.post("/api/auth/logout"), {
        withAuth: false,
      });

      expect(response.status).toBe(contracts.auth.logout.status);
      const cookies = response.headers["set-cookie"]?.toString();
      expect(cookies).toBeDefined();
      expect(cookies.includes("__Host-auth=;")).toBe(true);
    });
  });

  describe("GET /api/me", () => {
    it("should return the logged user", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get("/api/me"));

      expect(response.status).toBe(contracts.auth.me.status);
      expect(response.body).toEqual(contracts.auth.me.body);
    });

    it("should fail without access token", async () => {
      const response = await using(api.get("/api/me"), {
        withAuth: false,
      });

      expect(response.status).toBe(contracts.errors.unauthorized.status);
    });

    it("should fail when user does not exist", async () => {
      setupApiAuth({ id: 999 });

      const response = await using(api.get("/api/me"));

      expect(response.status).toBe(contracts.errors.unauthorized.status);
    });
  });
});
