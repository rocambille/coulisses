import {
  actorUser,
  mainMatrix,
  mainPlay,
  mainRoles,
  mainScenes,
  teacherUser,
} from "../data";

/* ************************************************************************ */
/* Contracts Definitions                                                    */
/* ************************************************************************ */

export default (<Contract>{
  dashboard: {
    method: "get" as const,
    path: `/api/plays/${mainPlay.id}/castings`,
    cases: {
      as_member: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 200, body: mainMatrix },
      },
    },
  },
  assign: {
    method: "post" as const,
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
    },
  },
  unassign: {
    method: "delete" as const,
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
    },
  },
});
