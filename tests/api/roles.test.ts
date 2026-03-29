import {
  api,
  mockDatabaseClient,
  mockedData,
  mockedInsertId,
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

describe("GET /api/plays/:id/roles", () => {
  it("should fetch roles successfully for a play member", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.get(`/api/plays/${mockedData.play[0].id}/roles`),
      { withCsrf: false, withAuth: true },
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: mockedData.role[0].id,
        name: mockedData.role[0].name,
        description: mockedData.role[0].description,
        play_id: mockedData.role[0].play_id,
        sceneIds: [1],
      },
      {
        id: mockedData.role[1].id,
        name: mockedData.role[1].name,
        description: mockedData.role[1].description,
        play_id: mockedData.role[1].play_id,
        sceneIds: [],
      },
    ]);
  });

  it("should fail when user is not a member of the play", async () => {
    mockJwtVerify("not-a-member");

    const response = await using(
      api.get(`/api/plays/${mockedData.play[0].id}/roles`),
      { withCsrf: false, withAuth: true },
    );

    expect(response.status).toBe(403);
  });
});

describe("POST /api/plays/:id/roles", () => {
  it("should add a new role successfully given valid data", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.post(`/api/plays/${mockedData.play[0].id}/roles`).send({
        name: "Hamlet",
        description: "The Prince of Denmark",
        sceneIds: [1],
      }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ insertId: mockedInsertId });
  });

  it("should fail when user is not a teacher of the play", async () => {
    mockJwtVerify(mockedData.user[1].id.toString());

    const response = await using(
      api.post(`/api/plays/${mockedData.play[0].id}/roles`).send({
        name: "Hamlet",
        description: "The Prince of Denmark",
        sceneIds: [1],
      }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(403);
  });

  it("should fail on invalid missing payload", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.post(`/api/plays/${mockedData.play[0].id}/roles`).send({}),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(400);
  });
});
