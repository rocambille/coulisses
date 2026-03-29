import {
  api,
  members,
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

describe("GET /api/plays", () => {
  it("should fetch plays successfully for an authenticated member", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

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
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.post("/api/plays").send({ title: "New Play" }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ insertId: mockedInsertId });
  });

  it("should fail on invalid request body", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(api.post("/api/plays").send({}), {
      withCsrf: true,
      withAuth: true,
    });

    expect(response.status).toBe(400);
  });

  it("should fail without CSRF token", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(api.post("/api/plays").send({}), {
      withCsrf: false,
      withAuth: true,
    });

    expect(response.status).toBe(401);
  });
});

describe("GET /api/plays/:id", () => {
  it("should fetch a single play successfully", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.get(`/api/plays/${mockedData.play[0].id}`),
      { withCsrf: false, withAuth: true },
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockedData.play[0]);
  });

  it("should fail when user is not a member of the play", async () => {
    mockJwtVerify("not-a-member");

    const response = await using(
      api.get(`/api/plays/${mockedData.play[0].id}`),
      { withCsrf: false, withAuth: true },
    );

    expect(response.status).toBe(403);
  });

  it("should fail on invalid playId", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(api.get("/api/plays/not-a-number"), {
      withCsrf: false,
      withAuth: true,
    });

    expect(response.status).toBe(404);
  });
});

describe("PUT /api/plays/:id", () => {
  it("should update a play successfully", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.put(`/api/plays/${mockedData.play[0].id}`).send({
        title: "Updated Play",
        description: "Updated Description",
      }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(204);
  });

  it("should fail when user is not a teacher of the play", async () => {
    mockJwtVerify(mockedData.user[1].id.toString());

    const response = await using(
      api.put(`/api/plays/${mockedData.play[0].id}`).send({
        title: "Updated Play",
        description: "Updated Description",
      }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(403);
  });

  it("should fail on invalid request body", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.put(`/api/plays/${mockedData.play[0].id}`).send({}),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/plays/:id", () => {
  it("should delete a play successfully", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.delete(`/api/plays/${mockedData.play[0].id}`),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(204);
  });

  it("should fail when user is not a teacher of the play", async () => {
    mockJwtVerify(mockedData.user[1].id.toString());

    const response = await using(
      api.delete(`/api/plays/${mockedData.play[0].id}`),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(403);
  });

  it("should not fail on invalid playId", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(api.delete("/api/plays/not-a-number"), {
      withCsrf: true,
      withAuth: true,
    });

    expect(response.status).toBe(204);
  });
});

describe("GET /api/plays/:id/members", () => {
  it("should fetch members successfully", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.get(`/api/plays/${mockedData.play[0].id}/members`),
      { withCsrf: false, withAuth: true },
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(members(mockedData.play[0]));
  });

  it("should fail when user is not a member of the play", async () => {
    mockJwtVerify("not-a-member");

    const response = await using(
      api.get(`/api/plays/${mockedData.play[0].id}/members`),
      { withCsrf: false, withAuth: true },
    );

    expect(response.status).toBe(403);
  });

  it("should fail on invalid playId", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(api.get("/api/plays/not-a-number/members"), {
      withCsrf: false,
      withAuth: true,
    });

    expect(response.status).toBe(404);
  });
});

describe("POST /api/plays/:id/members", () => {
  it("should allow a teacher to invite a member", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.post(`/api/plays/${mockedData.play[0].id}/members`).send({
        userId: mockedData.user[1].id,
        role: "ACTOR",
      }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(204);
  });

  it("should fail on invalid request body", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.post(`/api/plays/${mockedData.play[0].id}/members`).send({}),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(400);
  });
});
