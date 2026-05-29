import {
  emptyPlay,
  mainPlay,
  mainRoles,
  mainScenes,
  teacherUser,
} from "../data";

export default (<Contract>{
  browse: {
    method: "get" as const,
    path: `/api/plays/${mainPlay.id}/roles`,
    cases: {
      as_member: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 200, body: mainRoles },
      },
      empty: {
        specialPath: `/api/plays/${emptyPlay.id}/roles`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 200, body: [] },
      },
    },
  },
  add: {
    method: "post" as const,
    path: `/api/plays/${mainPlay.id}/roles`,
    cases: {
      as_admin: {
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
      as_admin: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 204, body: {} },
      },
    },
  },
  link_scene: {
    method: "post" as const,
    path: `/api/roles/${mainRoles[0].id}/scenes`,
    cases: {
      as_admin: {
        request: {
          body: { sceneId: mainScenes[2].id },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 204, body: {} },
      },
    },
  },
});
