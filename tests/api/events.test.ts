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

describe("GET /api/plays/:playId/events", () => {
  it("should fetch all events for the play successfully when user is member", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.get(`/api/plays/${mockedData.play[0].id}/events`),
      { withAuth: true, withCsrf: false },
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should fail when user is not a member of the play", async () => {
    mockJwtVerify(mockedData.user[2].id.toString());

    const response = await using(
      api.get(`/api/plays/${mockedData.play[0].id}/events`),
      { withAuth: true, withCsrf: false },
    );

    expect(response.status).toBe(403);
  });
});

describe("POST /api/plays/:playId/events", () => {
  it("should create an event successfully when user is a teacher", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.post(`/api/plays/${mockedData.play[0].id}/events`).send({
        type: "SHOW",
        title: "Test Event",
        start_time: "2026-05-01T10:00:00Z",
        end_time: "2026-05-01T12:00:00Z",
      }),
      { withAuth: true, withCsrf: true },
    );

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("insertId");
  });

  it("should fail when user is not a teacher (e.g. actor)", async () => {
    mockJwtVerify(mockedData.user[1].id.toString());

    const response = await using(
      api.post(`/api/plays/${mockedData.play[0].id}/events`).send({
        type: "SHOW",
        title: "Test Event",
        start_time: "2026-05-01T10:00:00Z",
        end_time: "2026-05-01T12:00:00Z",
      }),
      { withAuth: true, withCsrf: true },
    );

    expect(response.status).toBe(403);
  });

  it("should fail on invalid request body", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.post(`/api/plays/${mockedData.play[0].id}/events`).send({}),
      { withAuth: true, withCsrf: true },
    );

    expect(response.status).toBe(400);
  });
});

describe("PUT /api/events/:eventId", () => {
  it("should update an event successfully when teacher", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.put(`/api/events/${mockedData.event[0].id}`).send({
        title: "Updated Title",
        type: "SHOW",
        start_time: "2026-05-01T10:00:00Z",
        end_time: "2026-05-01T12:00:00Z",
      }),
      { withAuth: true, withCsrf: true },
    );

    expect(response.status).toBe(204);
  });

  it("should fail to update if not a teacher", async () => {
    mockJwtVerify(mockedData.user[1].id.toString());

    const response = await using(
      api.put(`/api/events/${mockedData.event[0].id}`).send({
        title: "Updated Title",
        type: "SHOW",
        start_time: "2026-05-01T10:00:00Z",
        end_time: "2026-05-01T12:00:00Z",
      }),
      { withAuth: true, withCsrf: true },
    );

    expect(response.status).toBe(403);
  });

  it("should fail on invalid request body", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.put(`/api/events/${mockedData.event[0].id}`).send({}),
      { withAuth: true, withCsrf: true },
    );

    expect(response.status).toBe(400);
  });

  it("should not fail on invalid eventId", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.put("/api/events/not-a-number").send({
        title: "Updated Title",
        type: "SHOW",
        start_time: "2026-05-01T10:00:00Z",
        end_time: "2026-05-01T12:00:00Z",
      }),
      { withAuth: true, withCsrf: true },
    );

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/events/:eventId", () => {
  it("should delete an event successfully when teacher", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.delete(`/api/events/${mockedData.event[0].id}`),
      { withAuth: true, withCsrf: true },
    );

    expect(response.status).toBe(204);
  });

  it("should fail to delete if not a teacher", async () => {
    mockJwtVerify(mockedData.user[1].id.toString());

    const response = await using(
      api.delete(`/api/events/${mockedData.event[0].id}`),
      { withAuth: true, withCsrf: true },
    );

    expect(response.status).toBe(403);
  });

  it("should not fail on invalid eventId", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(api.delete("/api/events/not-a-number"), {
      withCsrf: true,
      withAuth: true,
    });

    expect(response.status).toBe(204);
  });
});
