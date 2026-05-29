import {
  actorUser,
  allEvents,
  mainTroupe,
  openingNightEvent,
  teacherUser,
} from "../data";

export default (<Contract>{
  browse: {
    method: "get" as const,
    path: `/api/troupes/${mainTroupe.id}/events`,
    cases: {
      as_member: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 200, body: allEvents },
      },
      with_query: {
        specialPath: `/api/troupes/${mainTroupe.id}/events?start=2026-06-01&end=2026-06-30`,
        request: {
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 200, body: allEvents },
      },
    },
  },
  add: {
    method: "post" as const,
    path: `/api/troupes/${mainTroupe.id}/events`,
    cases: {
      as_member: {
        request: {
          body: {
            type: "SHOW",
            title: "Test Event",
            description: "",
            location: "",
            start_time: "2026-06-05T10:00:00.000Z",
            end_time: "2026-06-05T10:00:00.000Z",
          },
          jwtPayload: { sub: actorUser.id },
        },
        response: { status: 201, body: { insertId: expect.any(Number) } },
      },
    },
  },
  edit: {
    method: "put" as const,
    path: `/api/events/${openingNightEvent.id}`,
    cases: {
      owner: {
        request: {
          body: {
            type: openingNightEvent.type,
            title: "Updated",
            description: openingNightEvent.description,
            location: openingNightEvent.location,
            start_time: openingNightEvent.start_time,
            end_time: openingNightEvent.end_time,
          },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 204, body: {} },
      },
    },
  },
  delete: {
    method: "delete" as const,
    path: `/api/events/${openingNightEvent.id}`,
    cases: {
      owner: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 204, body: {} },
      },
    },
  },
  presence: {
    method: "post" as const,
    path: `/api/events/${openingNightEvent.id}/presence`,
    cases: {
      as_member: {
        request: {
          body: { status: "PRESENT" },
          jwtPayload: { sub: actorUser.id },
        },
        response: { status: 204, body: {} },
      },
    },
  },
});
