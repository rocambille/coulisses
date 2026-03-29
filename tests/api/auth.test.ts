import jwt from "jsonwebtoken";
import {
  api,
  mockDatabaseClient,
  mockedData,
  mockJwtVerify,
  resetMockData,
  using,
} from "./utils";

beforeEach(() => {
  resetMockData();
  mockDatabaseClient();
  vi.spyOn(jwt, "sign").mockImplementation(() => "fake_jwt_token");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/auth/magic-link", () => {
  it("should send a magic link successfully", async () => {
    const response = await using(
      api.post("/api/auth/magic-link").send({ email: "foo@mail.com" }),
      { withCsrf: true, withAuth: false },
    );

    expect(response.status).toBe(200);
  });

  it("should fail without email", async () => {
    const response = await using(api.post("/api/auth/magic-link").send({}), {
      withCsrf: true,
      withAuth: false,
    });

    // Assuming validator exists and fails on 400 or just error
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});

describe("POST /api/auth/verify", () => {
  it("should verify magic link and return cookie", async () => {
    mockJwtVerify(mockedData.user[0].email);

    const response = await using(
      api.post("/api/auth/verify").send({ token: "magic_token" }),
      { withCsrf: true, withAuth: false },
    );

    expect(response.status).toBe(200);
    const cookies = response.headers["set-cookie"]?.toString();
    expect(cookies).toBeDefined();
    expect(cookies.includes("__Host-auth=")).toBe(true);
  });

  it("should create a new user if not exists", async () => {
    mockJwtVerify("new@mail.com");

    const response = await using(
      api.post("/api/auth/verify").send({ token: "magic_token" }),
      { withCsrf: true, withAuth: false },
    );

    expect(response.status).toBe(201);
    const cookies = response.headers["set-cookie"]?.toString();
    expect(cookies).toBeDefined();
    expect(cookies.includes("__Host-auth=")).toBe(true);
  });

  it("should fail on missing token", async () => {
    const response = await using(api.post("/api/auth/verify").send({}), {
      withCsrf: true,
      withAuth: false,
    });

    expect(response.status).toBe(400);
  });

  it("should fail on invalid token", async () => {
    mockJwtVerify(null);

    const response = await using(
      api.post("/api/auth/verify").send({ token: "invalid_token" }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("should clear the cookie", async () => {
    const response = await using(api.post("/api/auth/logout"), {
      withCsrf: true,
      withAuth: false,
    });

    expect(response.status).toBe(204);
    const cookies = response.headers["set-cookie"]?.toString();
    expect(cookies).toBeDefined();
    expect(cookies.includes("__Host-auth=;")).toBe(true);
  });
});

describe("GET /api/me", () => {
  it("should return the logged user", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(api.get("/api/me"), {
      withCsrf: false,
      withAuth: true,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockedData.user[0]);
  });

  it("should fail without access token", async () => {
    const response = await using(api.get("/api/me"), {
      withCsrf: false,
      withAuth: false,
    });

    expect(response.status).toBe(401);
  });
});
