import { emptyPlay, mainPlay } from "../fixtures/plays";
import { mainRoles } from "../fixtures/roles";
import { mainScenes } from "../fixtures/scenes";
import { teacherUser, thirdUser } from "../fixtures/users";

export default (<Contract>{
  browse: {
    method: "get",
    path: `/api/plays/${mainPlay.id}/scenes`,
    cases: {
      as_member: {
        request: { jwtPayload: { sub: teacherUser.id } },
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
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
  add: {
    method: "post",
    path: `/api/plays/${mainPlay.id}/scenes`,
    cases: {
      as_admin: {
        request: {
          body: {
            title: "New Scene",
            description: "",
            cut_notes: "",
            duration_estimated_seconds: 0,
            order_in_play: 4,
            is_active: true,
            roleIds: [],
          },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 201, body: { insertId: expect.any(Number) } },
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
        specialPath: `/api/plays/${NaN}/scenes`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
  edit: {
    method: "put",
    path: `/api/scenes/${mainScenes[0].id}`,
    cases: {
      as_admin: {
        request: {
          body: {
            title: "Updated",
            description: mainScenes[0].description,
            cut_notes: mainScenes[0].cut_notes,
            duration_estimated_seconds:
              mainScenes[0].duration_estimated_seconds,
            order_in_play: mainScenes[0].order_in_play,
            is_active: mainScenes[0].is_active,
            roleIds: [mainRoles[0].id],
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
        specialPath: `/api/scenes/${NaN}`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
  delete: {
    method: "delete",
    path: `/api/scenes/${mainScenes[0].id}`,
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
        specialPath: `/api/scenes/${NaN}`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 204, body: {} },
      },
    },
  },
});
