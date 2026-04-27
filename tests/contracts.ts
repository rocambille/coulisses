import { cookies } from "supertest";
import {
  actorUser,
  allPlays,
  emptyMatrix,
  emptyPlay,
  emptyPlayMembers,
  mainMatrix,
  mainPlay,
  mainPlayMembers,
  mainPreferences,
  mainRoles,
  mainScenes,
  openingNightEvent,
  teacherUser,
  thirdUser,
} from "./data";

export type Json =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | { [key: string]: Json }
  | Json[];

export type JsonObject = { [key: string]: Json };

export type Case = {
  only?: boolean;
  // Optional path override (useful for IDs)
  specialPath?: string;
  request: {
    body?: JsonObject;
    // Mocked JWT payload to simulate different users
    jwtPayload?: { sub: RowId | string } | null;
    // Explicitly bypass CSRF to test protection
    withoutCsrfProtection?: boolean;
  };
  response: {
    status: number;
    body: unknown;
    // Optional hook to run extra assertions on the response
    and?: (response: { headers: { [key: string]: string } }) => void;
  };
};

export type Test = {
  method: "get" | "post" | "put" | "delete";
  path: string;
  cases: Record<string, Case>;
};

export type Contract = Record<string, Test>;

/* ************************************************************************ */
/* Contracts Definitions                                                    */
/* ************************************************************************ */

export const contracts: Record<string, Contract> = {
  auth: {
    magic_link: {
      method: "post" as const,
      path: "/api/auth/magic-link",
      cases: {
        success: {
          request: {
            body: {
              email: teacherUser.email,
            },
          },
          response: {
            status: 204,
            body: {},
          },
        },
        new_user: {
          request: {
            body: { email: "new_user@mail.com" },
          },
          response: {
            status: 204,
            body: {},
          },
        },
        bad_request: {
          request: { body: {} },
          response: { status: 400, body: expect.any(Object) },
        },
      },
    },
    me: {
      method: "get" as const,
      path: "/api/me",
      cases: {
        success: {
          request: {
            jwtPayload: { sub: teacherUser.id },
          },
          response: {
            status: 200,
            body: teacherUser,
          },
        },
        guest: {
          request: {},
          response: { status: 401, body: {} },
        },
        unauthorized: {
          request: { jwtPayload: { sub: NaN } },
          response: { status: 401, body: {} },
        },
      },
    },
    verify: {
      method: "post" as const,
      path: "/api/auth/verify",
      cases: {
        success: {
          request: {
            body: {
              token: "success_token",
            },
          },
          response: {
            status: 201,
            body: teacherUser,
            and: () => {
              expect(
                cookies.set({
                  name: "__Host-auth",
                  options: {
                    httpOnly: true,
                    sameSite: "strict",
                    secure: true,
                    path: "/",
                  },
                }),
              );
            },
          },
        },
        bad_request: {
          request: { body: {} },
          response: {
            status: 400,
            body: expect.any(Object),
            and: () => {
              expect(
                cookies.not("set", {
                  name: "__Host-auth",
                }),
              );
            },
          },
        },
        unauthorized: {
          request: { body: { token: "invalid_token" } },
          response: {
            status: 401,
            body: {},
            and: () => {
              expect(
                cookies.not("set", {
                  name: "__Host-auth",
                }),
              );
            },
          },
        },
        consumed: {
          request: { body: { token: "consumed_token" } },
          response: {
            status: 401,
            body: {},
            and: () => {
              expect(
                cookies.not("set", {
                  name: "__Host-auth",
                }),
              );
            },
          },
        },
        expired: {
          request: { body: { token: "expired_token" } },
          response: {
            status: 401,
            body: {},
            and: () => {
              expect(
                cookies.not("set", {
                  name: "__Host-auth",
                }),
              );
            },
          },
        },
        deleted_user: {
          request: {
            body: { token: "deleted_user_token" },
            jwtPayload: { sub: "deleted_user@mail.com" },
          },
          response: {
            status: 401,
            body: {},
            and: () => {
              expect(
                cookies.not("set", {
                  name: "__Host-auth",
                }),
              );
            },
          },
        },
      },
    },
    logout: {
      method: "post" as const,
      path: "/api/auth/logout",
      cases: {
        anyone: {
          request: {},
          response: {
            status: 204,
            body: {},
          },
        },
      },
    },
  },
  castings: {
    browse: {
      method: "get" as const,
      path: `/api/plays/${mainPlay.id}/castings`,
      cases: {
        main: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: mainMatrix },
        },
        empty: {
          specialPath: `/api/plays/${emptyPlay.id}/castings`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: emptyMatrix },
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
          specialPath: `/api/plays/${NaN}/castings`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 404, body: {} },
        },
      },
    },
    assign: {
      method: "post" as const,
      path: `/api/plays/${mainPlay.id}/castings`,
      cases: {
        main: {
          request: {
            body: { roleId: 2, userId: actorUser.id },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 201, body: {} },
        },
        bad_request: {
          request: { body: {}, jwtPayload: { sub: teacherUser.id } },
          response: { status: 400, body: expect.any(Object) },
        },
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
        forbidden: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 403, body: {} },
        },
        not_found: {
          specialPath: `/api/plays/${NaN}/castings`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 404, body: {} },
        },
      },
    },
    update: {
      method: "post" as const,
      path: `/api/plays/${mainPlay.id}/castings`,
      cases: {
        main: {
          request: {
            body: { roleId: 1, userId: teacherUser.id },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 201, body: {} },
        },
      },
    },
    unassign: {
      method: "delete" as const,
      path: `/api/plays/${mainPlay.id}/castings`,
      cases: {
        main: {
          request: {
            body: { roleId: 1, userId: actorUser.id },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 204, body: {} },
        },
        bad_request: {
          request: { body: {}, jwtPayload: { sub: teacherUser.id } },
          response: { status: 400, body: expect.any(Object) },
        },
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
        forbidden: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 403, body: {} },
        },
        not_found: {
          specialPath: `/api/plays/${NaN}/castings`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 204, body: {} },
        },
      },
    },
  },
  events: {
    browse: {
      method: "get" as const,
      path: `/api/plays/${mainPlay.id}/events`,
      cases: {
        teacher: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: [openingNightEvent] },
        },
        actor: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 200, body: [openingNightEvent] },
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
          specialPath: `/api/plays/${NaN}/events`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 404, body: {} },
        },
      },
    },
    create: {
      method: "post" as const,
      path: `/api/plays/${mainPlay.id}/events`,
      cases: {
        opening_night: {
          request: {
            body: {
              title: "Opening Night",
              type: "SHOW",
              start_time: "2026-05-05T12:00:00.000Z",
              end_time: "2026-05-05T12:00:00.000Z",
              location: "",
              description: "",
            },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 201, body: { insertId: expect.any(Number) } },
        },
        bad_request: {
          request: { body: {}, jwtPayload: { sub: teacherUser.id } },
          response: { status: 400, body: expect.any(Object) },
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
          specialPath: `/api/plays/${NaN}/events`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 404, body: {} },
        },
      },
    },
    update: {
      method: "put" as const,
      path: `/api/events/${openingNightEvent.id}`,
      cases: {
        opening_night: {
          request: {
            body: {
              type: openingNightEvent.type,
              title: "updated",
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
          request: { body: {}, jwtPayload: { sub: teacherUser.id } },
          response: { status: 400, body: expect.any(Object) },
        },
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
        forbidden: {
          request: { jwtPayload: { sub: actorUser.id } },
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
      method: "delete" as const,
      path: `/api/events/${openingNightEvent.id}`,
      cases: {
        opening_night: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 204, body: {} },
        },
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
        forbidden: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 403, body: {} },
        },
        not_found: {
          specialPath: `/api/events/${NaN}`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 204, body: {} },
        },
      },
    },
  },
  health: {
    get: {
      method: "get" as const,
      path: "/api/health",
      cases: {
        hello_world: {
          request: {},
          response: { status: 200, body: { hello: "world" } },
        },
      },
    },
    post: {
      method: "post" as const,
      path: "/api/health",
      cases: {
        hello_world: {
          request: { body: { hello: "world" } },
          response: { status: 200, body: { hello: "world" } },
        },
        missing_csrf_token: {
          request: { body: { hello: "world" }, withoutCsrfProtection: true },
          response: { status: 401, body: {} },
        },
      },
    },
  },
  members: {
    browse: {
      method: "get" as const,
      path: `/api/plays/${mainPlay.id}/members`,
      cases: {
        teacher: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: mainPlayMembers },
        },
        actor: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 200, body: mainPlayMembers },
        },
        empty: {
          specialPath: `/api/plays/${emptyPlay.id}/members`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: emptyPlayMembers },
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
          specialPath: `/api/plays/${NaN}/members`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 404, body: {} },
        },
      },
    },
    invite: {
      method: "post" as const,
      path: `/api/plays/${mainPlay.id}/members`,
      cases: {
        teacher: {
          request: {
            body: { email: actorUser.email, role: "ACTOR" },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 204, body: {} },
        },
        bad_request: {
          request: { body: {}, jwtPayload: { sub: teacherUser.id } },
          response: { status: 400, body: expect.any(Object) },
        },
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
        forbidden: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 403, body: {} },
        },
        not_found: {
          specialPath: `/api/plays/${NaN}/members`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 404, body: {} },
        },
      },
    },
  },
  plays: {
    browse: {
      method: "get" as const,
      path: "/api/plays",
      cases: {
        teacher: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: allPlays },
        },
        third: {
          request: { jwtPayload: { sub: thirdUser.id } },
          response: { status: 200, body: [] },
        },
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
      },
    },
    get: {
      method: "get" as const,
      path: `/api/plays/${mainPlay.id}`,
      cases: {
        teacher: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: mainPlay },
        },
        actor: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 200, body: mainPlay },
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
          specialPath: `/api/plays/${NaN}`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 404, body: {} },
        },
      },
    },
    create: {
      method: "post" as const,
      path: "/api/plays",
      cases: {
        teacher: {
          request: {
            body: {
              title: "New Play",
            },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 201, body: { insertId: expect.any(Number) } },
        },
        bad_request: {
          request: { body: {}, jwtPayload: { sub: teacherUser.id } },
          response: { status: 400, body: expect.any(Object) },
        },
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
      },
    },
    update: {
      method: "put" as const,
      path: `/api/plays/${mainPlay.id}`,
      cases: {
        teacher: {
          request: {
            body: {
              title: "Updated Play",
              description: mainPlay.description,
            },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 204, body: {} },
        },
        bad_request: {
          request: { body: {}, jwtPayload: { sub: teacherUser.id } },
          response: { status: 400, body: expect.any(Object) },
        },
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
        forbidden: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 403, body: {} },
        },
        not_found: {
          specialPath: `/api/plays/${NaN}`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 404, body: {} },
        },
      },
    },
    delete: {
      method: "delete" as const,
      path: `/api/plays/${mainPlay.id}`,
      cases: {
        teacher: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 204, body: {} },
        },
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
        forbidden: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 403, body: {} },
        },
        not_found: {
          specialPath: `/api/plays/${NaN}`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 204, body: {} },
        },
      },
    },
  },
  preferences: {
    browse: {
      method: "get" as const,
      path: `/api/plays/${mainPlay.id}/preferences`,
      cases: {
        teacher: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: mainPreferences },
        },
        actor: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 200, body: mainPreferences },
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
          specialPath: `/api/plays/${NaN}/preferences`,
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 404, body: {} },
        },
      },
    },
    upsert: {
      method: "put" as const,
      path: `/api/scenes/${mainScenes[0].id}/preferences`,
      cases: {
        update: {
          request: {
            body: { level: "HIGH" },
            jwtPayload: { sub: actorUser.id },
          },
          response: { status: 204, body: {} },
        },
        insert: {
          specialPath: `/api/scenes/${mainScenes[2].id}/preferences`,
          request: {
            body: { level: "HIGH" },
            jwtPayload: { sub: actorUser.id },
          },
          response: { status: 204, body: {} },
        },
        bad_request: {
          request: { body: {}, jwtPayload: { sub: actorUser.id } },
          response: { status: 400, body: expect.any(Object) },
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
          specialPath: `/api/scenes/${NaN}/preferences`,
          request: {},
          response: { status: 404, body: {} },
        },
      },
    },
  },
  roles: {
    browse: {
      method: "get" as const,
      path: `/api/plays/${mainPlay.id}/roles`,
      cases: {
        teacher: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: mainRoles },
        },
        actor: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 200, body: mainRoles },
        },
        empty: {
          specialPath: `/api/plays/${emptyPlay.id}/roles`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: [] },
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
          specialPath: `/api/plays/${NaN}/roles`,
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 404, body: {} },
        },
      },
    },
    create: {
      method: "post" as const,
      path: `/api/plays/${mainPlay.id}/roles`,
      cases: {
        teacher: {
          request: {
            body: {
              name: "Test",
              description: null,
              sceneIds: [mainScenes[0].id],
            },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 201, body: { insertId: expect.any(Number) } },
        },
        no_scene: {
          request: {
            body: { name: "Test", description: null, sceneIds: [] },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 201, body: { insertId: expect.any(Number) } },
        },
        bad_request: {
          request: { body: {}, jwtPayload: { sub: teacherUser.id } },
          response: { status: 400, body: expect.any(Object) },
        },
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
        forbidden: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 403, body: {} },
        },
        not_found: {
          specialPath: `/api/plays/${NaN}/roles`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 404, body: {} },
        },
      },
    },
  },
  scenes: {
    browse: {
      method: "get" as const,
      path: `/api/plays/${mainPlay.id}/scenes`,
      cases: {
        teacher: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: mainScenes },
        },
        actor: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 200, body: mainScenes },
        },
        empty: {
          specialPath: `/api/plays/${emptyPlay.id}/scenes`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: [] },
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
          specialPath: `/api/plays/${NaN}/scenes`,
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 404, body: {} },
        },
      },
    },
    get: {
      method: "get" as const,
      path: `/api/scenes/${mainScenes[0].id}`,
      cases: {
        first_scene: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: mainScenes[0] },
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
          specialPath: `/api/scenes/${NaN}`,
          request: {},
          response: { status: 404, body: {} },
        },
      },
    },
    create: {
      method: "post" as const,
      path: `/api/plays/${mainPlay.id}/scenes`,
      cases: {
        teacher: {
          request: {
            body: { title: "New Scene", scene_order: mainScenes.length + 1 },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 201, body: { insertId: expect.any(Number) } },
        },
        bad_request: {
          request: { body: {}, jwtPayload: { sub: teacherUser.id } },
          response: { status: 400, body: expect.any(Object) },
        },
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
        forbidden: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 403, body: {} },
        },
        not_found: {
          specialPath: `/api/plays/${NaN}/scenes`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 404, body: {} },
        },
      },
    },
    update: {
      method: "put" as const,
      path: `/api/scenes/${mainScenes[0].id}`,
      cases: {
        first_scene: {
          request: {
            body: {
              title: "Updated Scene",
              scene_order: mainScenes[0].scene_order,
            },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 204, body: {} },
        },
        bad_request: {
          request: { body: {}, jwtPayload: { sub: teacherUser.id } },
          response: { status: 400, body: expect.any(Object) },
        },
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
        forbidden: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 403, body: {} },
        },
        not_found: {
          specialPath: `/api/scenes/${NaN}`,
          request: {},
          response: { status: 404, body: {} },
        },
      },
    },
    delete: {
      method: "delete" as const,
      path: `/api/scenes/${mainScenes[0].id}`,
      cases: {
        first_scene: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 204, body: {} },
        },
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
        forbidden: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 403, body: {} },
        },
        not_found: {
          specialPath: `/api/scenes/${NaN}`,
          request: {},
          response: { status: 204, body: {} },
        },
      },
    },
  },
  users: {
    get: {
      method: "get" as const,
      path: `/api/users/${teacherUser.id}`,
      cases: {
        teacher: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: teacherUser },
        },
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
        forbidden: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 403, body: {} },
        },
        not_found: {
          specialPath: `/api/users/${NaN}`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 404, body: {} },
        },
      },
    },
    update: {
      method: "put" as const,
      path: `/api/users/${teacherUser.id}`,
      cases: {
        teacher: {
          request: {
            body: {
              name: "New Name",
              email: "new@mail.com",
            },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 204, body: {} },
        },
        bad_request: {
          request: { body: {}, jwtPayload: { sub: teacherUser.id } },
          response: { status: 400, body: expect.any(Object) },
        },
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
        forbidden: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 403, body: {} },
        },
        not_found: {
          specialPath: `/api/users/${NaN}`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 404, body: {} },
        },
      },
    },
    delete: {
      method: "delete" as const,
      path: `/api/users/${teacherUser.id}`,
      cases: {
        teacher: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 204, body: {} },
        },
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
        forbidden: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 403, body: {} },
        },
        not_found: {
          specialPath: `/api/users/${NaN}`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 204, body: {} },
        },
      },
    },
  },
};
