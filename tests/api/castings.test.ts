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

describe("POST /api/plays/:playId/castings", () => {
  it("should assign a role successfully when user is a teacher of the play", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.post(`/api/plays/${mockedData.play[0].id}/castings`).send({
        userId: 1,
        roleId: 1,
      }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(201);
  });

  it("should fail when user is not a teacher of the play", async () => {
    mockJwtVerify(mockedData.user[1].id.toString());

    const response = await using(
      api.post(`/api/plays/${mockedData.play[0].id}/castings`).send({
        userId: 1,
        roleId: 1,
      }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(403);
  });

  it("should fail on invalid request body", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.post(`/api/plays/${mockedData.play[0].id}/castings`).send({}),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/plays/:playId/castings", () => {
  it("should unassign a role successfully when user is a teacher of the play", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.delete(`/api/plays/${mockedData.play[0].id}/castings`).send({
        userId: 1,
        roleId: 1,
      }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(204);
  });

  it("should fail when user is not a teacher of the play", async () => {
    mockJwtVerify(mockedData.user[1].id.toString());

    const response = await using(
      api.delete(`/api/plays/${mockedData.play[0].id}/castings`).send({
        userId: 1,
        roleId: 1,
      }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(403);
  });

  it("should fail on invalid request body", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.delete(`/api/plays/${mockedData.play[0].id}/castings`).send({}),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(400);
  });
});

describe("GET /api/plays/:playId/castings", () => {
  it("should fetch the full casting matrix successfully", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.get(`/api/plays/${mockedData.play[0].id}/castings`),
      { withCsrf: false, withAuth: true },
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("scenes");
    expect(response.body).toHaveProperty("roles");
    expect(response.body).toHaveProperty("preferences");
  });

  it("should fail when user is not a member of the play", async () => {
    mockJwtVerify("not-a-member");

    const response = await using(
      api.get(`/api/plays/${mockedData.play[0].id}/castings`),
      { withCsrf: false, withAuth: true },
    );

    expect(response.status).toBe(403);
  });
});
