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

describe("GET /api/users", () => {
  it("should fetch users successfully", async () => {
    const response = await api.get("/api/users");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockedData.user);
  });
});

describe("GET /api/users/:id", () => {
  it("should fetch a single user successfully", async () => {
    const response = await api.get(`/api/users/${mockedData.user[0].id}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockedData.user[0]);
  });

  it("should fail on invalid id", async () => {
    const response = await api.get("/api/users/not-a-number");

    expect(response.status).toBe(404);
  });
});

describe("PUT /api/users/:id", () => {
  it("should update an existing user successfully", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api
        .put(`/api/users/${mockedData.user[0].id}`)
        .send({ email: "updated@mail.com", name: "Updated" }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(204);
  });

  it("should fail on invalid id", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api
        .put("/api/users/not-a-number")
        .send({ email: "updated@mail.com", name: "Updated" }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(404);
  });

  it("should fail on invalid authorization", async () => {
    mockJwtVerify(mockedData.user[1].id.toString()); // Not the same user id

    const response = await using(
      api
        .put(`/api/users/${mockedData.user[0].id}`)
        .send({ email: "updated@mail.com", name: "Updated" }),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(403);
  });

  it("should fail on invalid request body", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.put(`/api/users/${mockedData.user[0].id}`).send({}),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/users/:id", () => {
  it("should delete an existing user successfully", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(
      api.delete(`/api/users/${mockedData.user[0].id}`),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(204);
  });

  it("should not fail on invalid id", async () => {
    mockJwtVerify(mockedData.user[0].id.toString());

    const response = await using(api.delete("/api/users/not-a-number"), {
      withCsrf: true,
      withAuth: true,
    });

    expect(response.status).toBe(204);
  });

  it("should fail on invalid authorization", async () => {
    mockJwtVerify(mockedData.user[1].id.toString());

    const response = await using(
      api.delete(`/api/users/${mockedData.user[0].id}`),
      { withCsrf: true, withAuth: true },
    );

    expect(response.status).toBe(403);
  });
});
