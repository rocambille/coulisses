import {
  actorUser,
  api,
  guestUser,
  insertId,
  mainPlay,
  mainRoles,
  mainScenes,
  setupApiAuth,
  setupApiMocks,
  teacherUser,
  using,
} from "./mocks";

describe("Roles API", () => {
  beforeEach(() => {
    setupApiMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/plays/:id/roles", () => {
    it("should fetch roles successfully for a play member", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get(`/api/plays/${mainPlay.id}/roles`), {
        withCsrf: false,
        withAuth: true,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          ...mainRoles[0],
          scenes: [mainScenes[0]],
        },
        {
          ...mainRoles[1],
          scenes: [],
        },
      ]);
    });

    it("should fail when user is not a member of the play", async () => {
      setupApiAuth(guestUser);

      const response = await using(api.get(`/api/plays/${mainPlay.id}/roles`), {
        withCsrf: false,
        withAuth: true,
      });

      expect(response.status).toBe(403);
    });

    it("should fail when play does not exist", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.get(`/api/plays/999/roles`), {
        withCsrf: false,
        withAuth: true,
      });

      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/plays/:id/roles", () => {
    it("should add a new role successfully with scenes", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/roles`).send({
          name: "Hamlet",
          description: "The Prince of Denmark",
          sceneIds: [mainScenes[0].id],
        }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ insertId });
    });

    it("should add a new role successfully without scenes", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/roles`).send({
          name: "Hamlet",
          description: "The Prince of Denmark",
          sceneIds: [],
        }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ insertId });
    });

    it("should fail when user is not a teacher of the play", async () => {
      setupApiAuth(actorUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/roles`).send({
          name: "Hamlet",
          description: "The Prince of Denmark",
          sceneIds: [mainScenes[0].id],
        }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(403);
    });

    it("should fail on invalid missing payload", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/roles`).send({}),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(400);
    });

    it("should fail when play does not exist", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/999/roles`).send({
          name: "Hamlet",
          description: "The Prince of Denmark",
          sceneIds: [mainScenes[0].id],
        }),
        { withCsrf: true, withAuth: true },
      );

      expect(response.status).toBe(404);
    });
  });
});
