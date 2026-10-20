import { getTroupeInviteToken } from "../../src/express/modules/troupe/troupeInviteHelper";
import { allTroupes, mainTroupe } from "../fixtures/troupes";
import { actorUser, teacherUser, thirdUser } from "../fixtures/users";

export default (<Contract>{
  browse: {
    method: "get",
    path: "/api/troupes",
    cases: {
      as_member: {
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
  add: {
    method: "post",
    path: "/api/troupes",
    cases: {
      as_admin: {
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
        response: { status: 400, body: expect.any(Array) },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
    },
  },
  read: {
    method: "get",
    path: `/api/troupes/${mainTroupe.id}`,
    cases: {
      as_member: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 200, body: mainTroupe },
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
        specialPath: `/api/troupes/${NaN}`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
  invite_link: {
    method: "get",
    path: `/api/troupes/${mainTroupe.id}/invite-link`,
    cases: {
      as_admin: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: {
          status: 200,
          body: {
            token: expect.any(String),
            inviteUrl: expect.stringContaining(
              `/troupes/${mainTroupe.id}/join`,
            ),
          },
        },
      },
      forbidden: {
        request: { jwtPayload: { sub: actorUser.id } },
        response: { status: 403, body: {} },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
    },
  },
  get_join: {
    method: "get",
    path: `/api/troupes/${mainTroupe.id}/join?token=${getTroupeInviteToken(mainTroupe.id)}`,
    cases: {
      success: {
        request: { jwtPayload: null },
        response: {
          status: 200,
          body: {
            id: mainTroupe.id,
            name: mainTroupe.name,
            description: mainTroupe.description,
          },
        },
      },
      forbidden: {
        specialPath: `/api/troupes/${mainTroupe.id}/join?token=invalid_token`,
        request: { jwtPayload: null },
        response: { status: 403, body: {} },
      },
    },
  },
  post_join: {
    method: "post",
    path: `/api/troupes/${mainTroupe.id}/join`,
    cases: {
      as_user: {
        request: {
          body: { token: getTroupeInviteToken(mainTroupe.id) },
          jwtPayload: { sub: thirdUser.id },
        },
        response: { status: 204, body: {} },
      },
      forbidden: {
        request: {
          body: { token: "invalid_token" },
          jwtPayload: { sub: thirdUser.id },
        },
        response: { status: 403, body: {} },
      },
      unauthorized: {
        request: {
          body: { token: getTroupeInviteToken(mainTroupe.id) },
          jwtPayload: null,
        },
        response: { status: 401, body: {} },
      },
    },
  },
});
