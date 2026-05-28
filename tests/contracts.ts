import { cookies } from "supertest";
import {
  actorUser,
  allEvents,
  allPlays,
  allTroupes,
  emptyPlay,
  emptyTroupe,
  mainMatrix,
  mainPlay,
  mainPlayPreferences,
  mainRolePreferences,
  mainRoles,
  mainScenePreferences,
  mainScenes,
  mainTroupe,
  mainTroupeMembers,
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
  | JsonObject
  | JsonArray;

export type JsonObject = { [key: string]: Json };
export type JsonArray = Json[];

export type Case = {
  only?: boolean;
  specialPath?: string;
  request: {
    body?: JsonObject;
    jwtPayload?: { sub: RowId | string } | null;
    withoutCsrfProtection?: boolean;
  };
  response: {
    status: number;
    body?: JsonObject | JsonArray;
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
  health: {
    get: {
      method: "get",
      path: "/api/health",
      cases: {
        success: {
          request: {},
          response: { status: 200, body: { hello: "world" } },
        },
      },
    },
    post: {
      method: "post",
      path: "/api/health",
      cases: {
        success: {
          request: { body: { foo: "bar" } },
          response: { status: 200, body: { foo: "bar" } },
        },
        unauthorized: {
          request: { body: { foo: "bar" }, withoutCsrfProtection: true },
          response: { status: 401, body: {} },
        },
      },
    },
  },
  auth: {
    magic_link: {
      method: "post" as const,
      path: "/api/auth/magic-link",
      cases: {
        success: {
          request: { body: { email: teacherUser.email } },
          response: { status: 204, body: {} },
        },
        new_user: {
          request: { body: { email: "new_user@mail.com" } },
          response: { status: 204, body: {} },
        },
        bad_request: {
          request: { body: {} },
          response: { status: 400, body: expect.any(Object) },
        },
      },
    },
    verify: {
      method: "post" as const,
      path: "/api/auth/verify",
      cases: {
        success: {
          request: { body: { token: "success_token" } },
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
          response: { status: 204, body: {} },
        },
      },
    },
  },

  troupes: {
    browse: {
      method: "get" as const,
      path: "/api/troupes",
      cases: {
        member: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: allTroupes },
        },
        empty: {
          request: { jwtPayload: { sub: thirdUser.id } },
          response: { status: 200, body: [] },
        },
        unauthorized: {
          request: { jwtPayload: null },
          response: { status: 401, body: {} },
        },
      },
    },
    create: {
      method: "post" as const,
      path: "/api/troupes",
      cases: {
        success: {
          request: {
            body: {
              name: "New Troupe",
              description: "",
              external_discussion_link: "",
            },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 201, body: { insertId: expect.any(Number) } },
        },
        bad_request: {
          request: { body: {}, jwtPayload: { sub: teacherUser.id } },
          response: { status: 400, body: expect.any(Object) },
        },
      },
    },
    get: {
      method: "get" as const,
      path: `/api/troupes/${mainTroupe.id}`,
      cases: {
        member: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: mainTroupe },
        },
        not_member: {
          request: { jwtPayload: { sub: thirdUser.id } },
          response: { status: 403, body: {} },
        },
      },
    },
    members: {
      method: "get" as const,
      path: `/api/troupes/${mainTroupe.id}/members`,
      cases: {
        member: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: mainTroupeMembers },
        },
      },
    },
    invite: {
      method: "post" as const,
      path: `/api/troupes/${mainTroupe.id}/members`,
      cases: {
        admin: {
          request: {
            body: { email: thirdUser.email, role: "ACTOR" },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 204, body: {} },
        },
      },
    },
    remove_member: {
      method: "delete" as const,
      path: `/api/troupes/${mainTroupe.id}/members/${actorUser.id}`,
      cases: {
        admin: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 204, body: {} },
        },
      },
    },
  },

  plays: {
    browse: {
      method: "get" as const,
      path: `/api/troupes/${mainTroupe.id}/plays`,
      cases: {
        member: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: allPlays },
        },
        empty: {
          specialPath: `/api/troupes/${emptyTroupe.id}/plays`,
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: [] },
        },
      },
    },
    create: {
      method: "post" as const,
      path: `/api/troupes/${mainTroupe.id}/plays`,
      cases: {
        admin: {
          request: {
            body: { title: "New Play", description: "" },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 201, body: { insertId: expect.any(Number) } },
        },
        not_admin: {
          request: {
            body: { title: "New Play" },
            jwtPayload: { sub: actorUser.id },
          },
          response: { status: 403, body: {} },
        },
      },
    },
    get: {
      method: "get" as const,
      path: `/api/plays/${mainPlay.id}`,
      cases: {
        member: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: mainPlay },
        },
        not_member: {
          request: { jwtPayload: { sub: thirdUser.id } },
          response: { status: 403, body: {} },
        },
      },
    },
  },
  preferences: {
    get_me: {
      method: "get" as const,
      path: "/api/preferences/me",
      cases: {
        member: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: {
            status: 200,
            body: {
              playPreferences: mainPlayPreferences.filter(
                (p) => p.user_id === teacherUser.id,
              ),
              scenePreferences: mainScenePreferences.filter(
                (s) => s.user_id === teacherUser.id,
              ),
              rolePreferences: mainRolePreferences.filter(
                (r) => r.user_id === teacherUser.id,
              ),
            },
          },
        },
      },
    },
    set_play: {
      method: "post" as const,
      path: `/api/plays/${mainPlay.id}/preferences`,
      cases: {
        member: {
          request: {
            body: { level: "HIGH" },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 204, body: {} },
        },
      },
    },
    set_scene: {
      method: "post" as const,
      path: `/api/scenes/${mainScenes[0].id}/preferences`,
      cases: {
        member: {
          request: {
            body: { level: "HIGH" },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 204, body: {} },
        },
      },
    },
    set_role: {
      method: "post" as const,
      path: `/api/scenes/${mainScenes[0].id}/roles/${mainRoles[0].id}/preferences`,
      cases: {
        member: {
          request: {
            body: { level: "HIGH" },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 204, body: {} },
        },
      },
    },
  },
  scenes: {
    browse: {
      method: "get" as const,
      path: `/api/plays/${mainPlay.id}/scenes`,
      cases: {
        member: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: mainScenes },
        },
      },
    },
    browseEmpty: {
      method: "get" as const,
      path: `/api/plays/${emptyPlay.id}/scenes`,
      cases: {
        member: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: [] },
        },
      },
    },
    create: {
      method: "post" as const,
      path: `/api/plays/${mainPlay.id}/scenes`,
      cases: {
        admin: {
          request: {
            body: {
              title: "New Scene",
              description: "",
              cut_notes: "",
              duration_estimated_seconds: 0,
              order_in_play: 4,
              is_active: true,
            },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 201, body: { insertId: expect.any(Number) } },
        },
      },
    },
    edit: {
      method: "put" as const,
      path: `/api/scenes/${mainScenes[0].id}`,
      cases: {
        admin: {
          request: {
            body: {
              title: "Updated",
              description: mainScenes[0].description,
              cut_notes: mainScenes[0].cut_notes,
              duration_estimated_seconds:
                mainScenes[0].duration_estimated_seconds,
              order_in_play: mainScenes[0].order_in_play,
              is_active: mainScenes[0].is_active,
            },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 204, body: {} },
        },
      },
    },
    delete: {
      method: "delete" as const,
      path: `/api/scenes/${mainScenes[0].id}`,
      cases: {
        admin: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 204, body: {} },
        },
      },
    },
    set_preference: {
      method: "post" as const,
      path: `/api/scenes/${mainScenes[0].id}/preferences`,
      cases: {
        member: {
          request: {
            body: { level: "HIGH" },
            jwtPayload: { sub: actorUser.id },
          },
          response: { status: 204, body: {} },
        },
      },
    },
  },

  roles: {
    browse: {
      method: "get" as const,
      path: `/api/plays/${mainPlay.id}/roles`,
      cases: {
        member: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: mainRoles },
        },
      },
    },
    browseEmpty: {
      method: "get" as const,
      path: `/api/plays/${emptyPlay.id}/roles`,
      cases: {
        member: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: [] },
        },
      },
    },
    create: {
      method: "post" as const,
      path: `/api/plays/${mainPlay.id}/roles`,
      cases: {
        admin: {
          request: {
            body: { name: "New Role", description: "", sceneIds: [] },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 201, body: { insertId: expect.any(Number) } },
        },
      },
    },
    delete: {
      method: "delete" as const,
      path: `/api/roles/${mainRoles[0].id}`,
      cases: {
        admin: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 204, body: {} },
        },
      },
    },
    link_scene: {
      method: "post" as const,
      path: `/api/roles/${mainRoles[0].id}/scenes`,
      cases: {
        admin: {
          request: {
            body: { sceneId: mainScenes[2].id },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 204, body: {} },
        },
      },
    },
    role_preference: {
      method: "post" as const,
      path: `/api/scenes/${mainScenes[0].id}/roles/${mainRoles[0].id}/preferences`,
      cases: {
        member: {
          request: {
            body: { level: "HIGH" },
            jwtPayload: { sub: actorUser.id },
          },
          response: { status: 204, body: {} },
        },
      },
    },
  },

  castings: {
    dashboard: {
      method: "get" as const,
      path: `/api/plays/${mainPlay.id}/castings`,
      cases: {
        member: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: mainMatrix },
        },
      },
    },
    assign: {
      method: "post" as const,
      path: `/api/castings`,
      cases: {
        admin: {
          request: {
            body: {
              scene_id: mainScenes[1].id,
              role_id: mainRoles[1].id,
              user_id: actorUser.id,
            },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 201, body: {} },
        },
      },
    },
    unassign: {
      method: "delete" as const,
      path: `/api/castings`,
      cases: {
        admin: {
          request: {
            body: {
              scene_id: mainScenes[0].id,
              role_id: mainRoles[0].id,
              user_id: actorUser.id,
            },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 204, body: {} },
        },
      },
    },
  },

  events: {
    browse: {
      method: "get" as const,
      path: `/api/troupes/${mainTroupe.id}/events`,
      cases: {
        member: {
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
    create: {
      method: "post" as const,
      path: `/api/troupes/${mainTroupe.id}/events`,
      cases: {
        member: {
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
        member: {
          request: {
            body: { status: "PRESENT" },
            jwtPayload: { sub: actorUser.id },
          },
          response: { status: 204, body: {} },
        },
      },
    },
  },
  users: {
    read: {
      method: "get" as const,
      path: "/api/users/me",
      cases: {
        me: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 200, body: teacherUser },
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
    edit: {
      method: "put" as const,
      path: "/api/users/me",
      cases: {
        me: {
          request: {
            body: { email: "updated@mail.com", name: "updated" },
            jwtPayload: { sub: teacherUser.id },
          },
          response: { status: 204, body: {} },
        },
      },
    },
    delete: {
      method: "delete" as const,
      path: "/api/users/me",
      cases: {
        me: {
          request: { jwtPayload: { sub: teacherUser.id } },
          response: { status: 204, body: {} },
        },
      },
    },
  },
};
