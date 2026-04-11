import { cookies } from "supertest";
import {
  actorUser,
  insertId,
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

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];
type JsonObject = { [key: string]: Json };

export type Case = {
  path?: string;
  request: {
    body?: JsonObject;
    jwtPayload?: { sub: number | string } | null;
    withoutCsrfProtection?: boolean;
  };
  response: {
    status: number;
    body: unknown;
    and?: (response: { headers: { [key: string]: string } }) => void;
  };
};

export type Test = {
  method: "get" | "post" | "put" | "delete";
  path: string;
  cases: Record<string, Case>;
};

export type Contract = Record<string, Test>;

/**
 * API Contracts: The Point of Truth for API.
 *
 * Each entry defines a request and the expected response for a given test case.
 */
export const contracts: Record<string, Contract> = {
  auth: {
    magic_link: {
      method: "post" as const,
      path: "/api/auth/magic-link",
      cases: {
        teacher: {
          request: {
            body: {
              email: teacherUser.email,
            },
          },
          response: {
            status: 200,
            body: {
              message: "Magic link sent to your email",
              _testing_link:
                "http://localhost:5173/verify?token=fake_jwt_token",
              _testing_token: "fake_jwt_token",
            },
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
        teacher: {
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
        unknown: {
          request: { jwtPayload: { sub: NaN } },
          response: { status: 401, body: {} },
        },
      },
    },
    verify: {
      method: "post" as const,
      path: "/api/auth/verify",
      cases: {
        teacher: {
          request: {
            body: {
              token: "fake_jwt_token",
            },
            jwtPayload: { sub: teacherUser.email },
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
        new_user: {
          request: {
            body: { token: "fake_jwt_token" },
            jwtPayload: { sub: "new_user@mail.com" },
          },
          response: {
            status: 201,
            body: {
              id: expect.any(Number),
              email: "new_user@mail.com",
              name: "new_user",
            },
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
          request: { body: { token: "invalid_jwt_token" }, jwtPayload: null },
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
        first_play: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: mainMatrix },
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
          path: `/api/plays/${NaN}/castings`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 404, body: {} },
        },
      },
    },
    assign: {
      method: "post" as const,
      path: `/api/plays/${mainPlay.id}/castings`,
      cases: {
        first_play: {
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
          path: `/api/plays/${NaN}/castings`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 404, body: {} },
        },
      },
    },
    unassign: {
      method: "delete" as const,
      path: `/api/plays/${mainPlay.id}/castings`,
      cases: {
        first_play: {
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
          path: `/api/plays/${NaN}/castings`,
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
          path: `/api/plays/${NaN}/events`,
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
          response: { status: 201, body: { insertId } },
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
          path: `/api/plays/${NaN}/events`,
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
          path: `/api/events/${NaN}`,
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
          path: `/api/events/${NaN}`,
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
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
        forbidden: {
          request: { jwtPayload: { sub: thirdUser.id } },
          response: { status: 403, body: {} },
        },
        not_found: {
          path: `/api/plays/${NaN}/members`,
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
          path: `/api/plays/${NaN}/members`,
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
          response: { status: 200, body: [mainPlay] },
        },
        actor: {
          request: { jwtPayload: { sub: actorUser.id } },
          response: { status: 200, body: [mainPlay] },
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
          path: `/api/plays/${NaN}`,
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
          response: { status: 201, body: { insertId } },
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
              ...mainPlay,
              title: "Updated Play",
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
          path: `/api/plays/${NaN}`,
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
          path: `/api/plays/${NaN}`,
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
          path: `/api/plays/${NaN}/preferences`,
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
          path: `/api/scenes/${mainScenes[2].id}/preferences`,
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
          path: `/api/scenes/${NaN}/preferences`,
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
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
        forbidden: {
          request: { jwtPayload: { sub: thirdUser.id } },
          response: { status: 403, body: {} },
        },
        not_found: {
          path: `/api/plays/${NaN}/roles`,
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
          response: { status: 201, body: { insertId } },
        },
        no_scene: {
          request: {
            body: { name: "Test", description: null, sceneIds: [] },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 201, body: { insertId } },
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
          path: `/api/plays/${NaN}/roles`,
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
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
        forbidden: {
          request: { jwtPayload: { sub: thirdUser.id } },
          response: { status: 403, body: {} },
        },
        not_found: {
          path: `/api/plays/${NaN}/scenes`,
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
          path: `/api/scenes/${NaN}`,
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
          response: { status: 201, body: { insertId } },
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
          path: `/api/plays/${NaN}/scenes`,
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
          path: `/api/scenes/${NaN}`,
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
          path: `/api/scenes/${NaN}`,
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
          path: `/api/users/${NaN}`,
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
          path: `/api/users/${NaN}`,
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
          path: `/api/users/${NaN}`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 204, body: {} },
        },
      },
    },
  },
};
