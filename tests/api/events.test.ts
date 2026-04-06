import { contracts } from "../contracts";
import {
  actorUser,
  api,
  guestUser,
  mainPlay,
  openingNightEvent,
  setupApiAuth,
  setupDatabaseMocks,
  teacherUser,
  using,
} from "./mocks";

describe("Events API", () => {
  beforeEach(() => {
    setupDatabaseMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/plays/:playId/events", () => {
    it("should fetch all events for the play successfully when user is member", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.get(`/api/plays/${mainPlay.id}/events`),
        { withAuth: true, withCsrf: false },
      );

      expect(response.status).toBe(contracts.plays.events.browse.status);
      expect(response.body).toEqual(contracts.plays.events.browse.body);
    });

    it("should fail when user is not a member of the play", async () => {
      setupApiAuth(guestUser);

      const response = await using(
        api.get(`/api/plays/${mainPlay.id}/events`),
        { withAuth: true, withCsrf: false },
      );

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });
  });

  describe("POST /api/plays/:playId/events", () => {
    it("should create an event successfully when user is a teacher", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/events`).send({
          type: "SHOW",
          title: "Test Event",
          start_time: "2026-05-01T10:00:00Z",
          end_time: "2026-05-01T12:00:00Z",
        }),
        { withAuth: true, withCsrf: true },
      );

      expect(response.status).toBe(contracts.plays.events.create.status);
      expect(response.body).toEqual(contracts.plays.events.create.body);
    });

    it("should fail when user is not a teacher (e.g. actor)", async () => {
      setupApiAuth(actorUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/events`).send({
          type: "SHOW",
          title: "Test Event",
          start_time: "2026-05-01T10:00:00Z",
          end_time: "2026-05-01T12:00:00Z",
        }),
        { withAuth: true, withCsrf: true },
      );

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });

    it("should fail on invalid request body", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.post(`/api/plays/${mainPlay.id}/events`).send({}),
        { withAuth: true, withCsrf: true },
      );

      expect(response.status).toBe(contracts.errors.badRequest.status);
    });
  });

  describe("PUT /api/events/:eventId", () => {
    it("should update an event successfully when teacher", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.put(`/api/events/${openingNightEvent.id}`).send({
          title: "Updated Title",
          type: "SHOW",
          start_time: "2026-05-01T10:00:00Z",
          end_time: "2026-05-01T12:00:00Z",
        }),
        { withAuth: true, withCsrf: true },
      );

      expect(response.status).toBe(contracts.events.update.status);
      expect(response.body).toEqual(contracts.events.update.body);
    });

    it("should fail to update if not a teacher", async () => {
      setupApiAuth(actorUser);

      const response = await using(
        api.put(`/api/events/${openingNightEvent.id}`).send({
          title: "Updated Title",
          type: "SHOW",
          start_time: "2026-05-01T10:00:00Z",
          end_time: "2026-05-01T12:00:00Z",
        }),
        { withAuth: true, withCsrf: true },
      );

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });

    it("should fail on invalid request body", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.put(`/api/events/${openingNightEvent.id}`).send({}),
        { withAuth: true, withCsrf: true },
      );

      expect(response.status).toBe(contracts.errors.badRequest.status);
    });

    it("should not fail on invalid eventId", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.put("/api/events/not-a-number").send({
          title: "Updated Title",
          type: "SHOW",
          start_time: "2026-05-01T10:00:00Z",
          end_time: "2026-05-01T12:00:00Z",
        }),
        { withAuth: true, withCsrf: true },
      );

      expect(response.status).toBe(contracts.errors.notFound.status);
    });
  });

  describe("DELETE /api/events/:eventId", () => {
    it("should delete an event successfully when teacher", async () => {
      setupApiAuth(teacherUser);

      const response = await using(
        api.delete(`/api/events/${openingNightEvent.id}`),
        { withAuth: true, withCsrf: true },
      );

      expect(response.status).toBe(contracts.events.delete.status);
      expect(response.body).toEqual(contracts.events.delete.body);
    });

    it("should fail to delete if not a teacher", async () => {
      setupApiAuth(actorUser);

      const response = await using(
        api.delete(`/api/events/${openingNightEvent.id}`),
        { withAuth: true, withCsrf: true },
      );

      expect(response.status).toBe(contracts.errors.forbidden.status);
    });

    it("should not fail on invalid eventId", async () => {
      setupApiAuth(teacherUser);

      const response = await using(api.delete("/api/events/not-a-number"), {
        withCsrf: true,
        withAuth: true,
      });

      expect(response.status).toBe(contracts.events.delete.status);
      expect(response.body).toEqual(contracts.events.delete.body);
    });
  });
});
