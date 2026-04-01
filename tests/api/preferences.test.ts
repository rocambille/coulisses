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
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/scenes/:sceneId/preferences", () => {
  it("should create/update a preference successfully", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.post(`/api/scenes/${mockedData.scene[0].id}/preferences`).send({
        level: "HIGH",
      }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(204);
  });

  it("should fail when user is not a member of the play", async () => {
    mockJwtVerify(mockedData.user[2].id.toString());

    const response = await using(
      api.post(`/api/scenes/${mockedData.scene[0].id}/preferences`).send({
        level: "HIGH",
      }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(403);
  });

  it("should fail when sceneId is not found", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.post(`/api/scenes/not-a-number/preferences`).send({
        level: "HIGH",
      }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(404);
  });

  it("should fail when payload level is invalid", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.post(`/api/scenes/${mockedData.scene[0].id}/preferences`).send({
        level: "UNKNOWN_LEVEL",
      }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(400);
  });
});

describe("GET /api/plays/:playId/preferences", () => {
  it("should fetch all preferences for the play successfully", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.get(`/api/plays/${mockedData.play[0].id}/preferences`),
      { withAuth: true, withCsrf: false },
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty("level");
  });

  it("should fail when user is not a member of the play", async () => {
    mockJwtVerify(mockedData.user[2].id.toString());

    const response = await using(
      api.get(`/api/plays/${mockedData.play[0].id}/preferences`),
      { withAuth: true, withCsrf: false },
    );

    expect(response.status).toBe(403);
  });
});
