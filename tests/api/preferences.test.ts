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
    mockJwtVerify("not-a-member");

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
