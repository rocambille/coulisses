import { mainMatrix } from "../fixtures/castings";
import { mainPlay } from "../fixtures/plays";
import { mainRoles } from "../fixtures/roles";
import { mainScenes } from "../fixtures/scenes";
import { actorUser, teacherUser, thirdUser } from "../fixtures/users";

/* ************************************************************************ */
/* Contracts Definitions                                                    */
/* ************************************************************************ */

export default (<Contract>{
  dashboard: {
    method: "get",
    path: `/api/plays/${mainPlay.id}/castings`,
    cases: {
      as_member: {
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
        specialPath: `/api/plays/${NaN}/castings`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
  assign: {
    method: "post",
    path: `/api/castings`,
    cases: {
      as_admin: {
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
      bad_request: {
        request: {
          body: {},
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 400, body: expect.any(Array) },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
      forbidden: {
        request: {
          body: {
            scene_id: mainScenes[0].id,
            role_id: mainRoles[0].id,
            user_id: actorUser.id,
          },
          jwtPayload: { sub: thirdUser.id },
        },
        response: { status: 403, body: {} },
      },
    },
  },
  unassign: {
    method: "delete",
    path: `/api/castings`,
    cases: {
      as_admin: {
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
      bad_request: {
        request: {
          body: {},
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 400, body: expect.any(Array) },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
      forbidden: {
        request: {
          body: {
            scene_id: mainScenes[0].id,
            role_id: mainRoles[0].id,
            user_id: actorUser.id,
          },
          jwtPayload: { sub: thirdUser.id },
        },
        response: { status: 403, body: {} },
      },
    },
  },
});
