import { allEvents, openingNightEvent } from "../fixtures/events";
import { mainTroupe } from "../fixtures/troupes";
import { actorUser, teacherUser, thirdUser } from "../fixtures/users";

export default (<Contract>{
  browse: {
    method: "get",
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
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
      forbidden: {
        request: { jwtPayload: { sub: thirdUser.id } },
        response: { status: 403, body: {} },
      },
      not_found: {
        specialPath: `/api/troupes/${NaN}/events`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
  add: {
    method: "post",
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
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 201, body: { insertId: expect.any(Number) } },
      },
      bad_request: {
        request: {
          body: {
            type: "INVALID",
            title: "Test Event",
            description: "",
            location: "",
            start_time: "2026-06-05T10:00:00.000Z",
            end_time: "2026-06-05T10:00:00.000Z",
          },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 400, body: expect.any(Array) },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
      forbidden: {
        request: { jwtPayload: { sub: thirdUser.id } },
        response: { status: 403, body: {} },
      },
      not_found: {
        specialPath: `/api/troupes/${NaN}/events`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
  edit: {
    method: "put",
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
      bad_request: {
        request: {
          body: {
            type: "INVALID",
            title: "Test Event",
            description: "",
            location: "",
            start_time: "2026-06-05T10:00:00.000Z",
            end_time: "2026-06-05T10:00:00.000Z",
          },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 400, body: expect.any(Array) },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
      forbidden: {
        request: { jwtPayload: { sub: thirdUser.id } },
        response: { status: 403, body: {} },
      },
      not_found: {
        specialPath: `/api/events/${NaN}`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
  delete: {
    method: "delete",
    path: `/api/events/${openingNightEvent.id}`,
    cases: {
      owner: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 204, body: {} },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
      forbidden: {
        request: { jwtPayload: { sub: thirdUser.id } },
        response: { status: 403, body: {} },
      },
      not_found: {
        specialPath: `/api/events/${NaN}`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 204, body: {} },
      },
    },
  },
  presence: {
    method: "post",
    path: `/api/events/${openingNightEvent.id}/presence`,
    cases: {
      as_member: {
        request: {
          body: { status: "PRESENT" },
          jwtPayload: { sub: actorUser.id },
        },
        response: { status: 204, body: {} },
      },
      bad_request: {
        request: {
          body: { status: "INVALID" },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 400, body: expect.any(Array) },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
      forbidden: {
        request: { jwtPayload: { sub: thirdUser.id } },
        response: { status: 403, body: {} },
      },
      not_found: {
        specialPath: `/api/events/${NaN}/presence`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
});
