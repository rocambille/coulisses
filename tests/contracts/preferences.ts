import { mainPlay } from "../fixtures/plays";
import {
  mainPlayPreferences,
  mainRolePreferences,
  mainScenePreferences,
} from "../fixtures/preferences";
import { mainRoles } from "../fixtures/roles";
import { mainScenes } from "../fixtures/scenes";
import { teacherUser, thirdUser } from "../fixtures/users";

export default (<Contract>{
  get_me: {
    method: "get",
    path: "/api/preferences/me",
    cases: {
      as_member: {
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
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
    },
  },
  set_play: {
    method: "post",
    path: `/api/plays/${mainPlay.id}/preferences`,
    cases: {
      as_member: {
        request: {
          body: { level: "HIGH" },
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
        specialPath: `/api/plays/${NaN}/preferences`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
  set_scene: {
    method: "post",
    path: `/api/scenes/${mainScenes[0].id}/preferences`,
    cases: {
      as_member: {
        request: {
          body: { level: "HIGH" },
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
        specialPath: `/api/scenes/${NaN}/preferences`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
  set_role: {
    method: "post",
    path: `/api/scenes/${mainScenes[0].id}/roles/${mainRoles[0].id}/preferences`,
    cases: {
      as_member: {
        request: {
          body: { level: "HIGH" },
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
      not_found_on_scene: {
        specialPath: `/api/scenes/${NaN}/roles/${mainRoles[0].id}/preferences`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
      not_found_on_role: {
        specialPath: `/api/scenes/${mainScenes[0].id}/roles/${NaN}/preferences`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
});
