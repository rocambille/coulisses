import { emptyPlay, mainPlay } from "../fixtures/plays";
import { mainRoles } from "../fixtures/roles";
import { mainScenes } from "../fixtures/scenes";
import { teacherUser, thirdUser } from "../fixtures/users";

export default (<Contract>{
  browse: {
    method: "get",
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
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
  add: {
    method: "post",
    path: `/api/plays/${mainPlay.id}/roles`,
    cases: {
      as_admin: {
        request: {
          body: { name: "New Role", description: "", sceneIds: [] },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 201, body: { insertId: expect.any(Number) } },
      },
      with_scene: {
        request: {
          body: {
            name: "New Role",
            description: "",
            sceneIds: [mainScenes[0].id],
          },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 201, body: { insertId: expect.any(Number) } },
      },
      bad_request: {
        body: {},
        request: { jwtPayload: { sub: teacherUser.id } },
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
        specialPath: `/api/plays/${NaN}/roles`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
  edit: {
    method: "put",
    path: `/api/roles/${mainRoles[0].id}`,
    cases: {
      as_admin: {
        request: {
          body: {
            name: "Updated Role",
            description: "Updated Description",
            sceneIds: [mainScenes[0].id, mainScenes[1].id],
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
        request: { jwtPayload: { sub: thirdUser.id } },
        response: { status: 403, body: {} },
      },
      not_found: {
        specialPath: `/api/roles/${NaN}`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
  delete: {
    method: "delete",
    path: `/api/roles/${mainRoles[0].id}`,
    cases: {
      as_admin: {
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
        specialPath: `/api/roles/${NaN}`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 204, body: {} },
      },
    },
  },
  link_scene: {
    method: "post",
    path: `/api/roles/${mainRoles[0].id}/scenes`,
    cases: {
      as_admin: {
        request: {
          body: { sceneId: mainScenes[2].id },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 204, body: {} },
      },
      bad_request: {
        body: {},
        request: { jwtPayload: { sub: teacherUser.id } },
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
        specialPath: `/api/roles/${NaN}/scenes`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
});
