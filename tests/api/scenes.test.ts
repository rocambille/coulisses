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

describe("GET /api/plays/:id/scenes", () => {
  it("should fetch scenes successfully", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.get(`/api/plays/${mockedData.play[0].id}/scenes`),
      {
        withCsrf: false,
        withAuth: true,
      },
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockedData.scene);
  });

  it("should fail when user is not a member of the play", async () => {
    mockJwtVerify("not-a-member");

    const response = await using(
      api.get(`/api/plays/${mockedData.play[0].id}/scenes`),
      {
        withCsrf: false,
        withAuth: true,
      },
    );

    expect(response.status).toBe(403);
  });
});

describe("POST /api/plays/:id/scenes", () => {
  it("should add a new scene successfully", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.post(`/api/plays/${mockedData.play[0].id}/scenes`).send({
        title: "New Scene",
        scene_order: 2,
      }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ insertId: mockedInsertId });
  });

  it("should fail when user is not a teacher of the play", async () => {
    mockJwtVerify(mockedData.user[1].id.toString());

    const response = await using(
      api.post(`/api/plays/${mockedData.play[0].id}/scenes`).send({
        title: "New Scene",
        scene_order: 2,
      }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(403);
  });

  it("should fail on invalid request body", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.post(`/api/plays/${mockedData.play[0].id}/scenes`).send({}),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(400);
  });
});

describe("GET /api/scenes/:id", () => {
  it("should fetch a scene successfully", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.get(`/api/scenes/${mockedData.scene[0].id}`),
      {
        withCsrf: false,
        withAuth: true,
      },
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockedData.scene[0]);
  });

  it("should fail when user is not a member of the play", async () => {
    mockJwtVerify("not-a-member");

    const response = await using(
      api.get(`/api/scenes/${mockedData.scene[0].id}`),
      {
        withCsrf: false,
        withAuth: true,
      },
    );

    expect(response.status).toBe(403);
  });
});

describe("PUT /api/scenes/:id", () => {
  it("should update a scene successfully", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.put(`/api/scenes/${mockedData.scene[0].id}`).send({
        title: "Updated Scene",
        scene_order: 1,
      }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(204);
  });

  it("should fail when user is not a teacher of the play", async () => {
    mockJwtVerify(mockedData.user[1].id.toString());

    const response = await using(
      api.put(`/api/scenes/${mockedData.scene[0].id}`).send({
        title: "Updated Scene",
        scene_order: 1,
      }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(403);
  });
});

describe("DELETE /api/scenes/:id", () => {
  it("should delete a scene successfully", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.delete(`/api/scenes/${mockedData.scene[0].id}`),
      { withCsrf: true, withAuth: true },
    );

    // Assuming the soft/hard delete mechanism in Repository returns affected rows natively
    expect(response.status).toBe(204);
  });

  it("should not fail when sceneId is not found", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(api.delete(`/api/scenes/not-a-number`), {
      withCsrf: true,
      withAuth: true,
    });

    // Assuming the soft/hard delete mechanism in Repository returns affected rows natively
    expect(response.status).toBe(204);
  });

  it("should fail when user is not a teacher of the play", async () => {
    mockJwtVerify(mockedData.user[1].id.toString());

    const response = await using(
      api.delete(`/api/scenes/${mockedData.scene[0].id}`),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(403);
  });
});
