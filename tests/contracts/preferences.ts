import {
  mainPlay,
  mainPlayPreferences,
  mainRolePreferences,
  mainRoles,
  mainScenePreferences,
  mainScenes,
  teacherUser,
} from "../data";

export default (<Contract>{
  get_me: {
    method: "get" as const,
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
    },
  },
  set_play: {
    method: "post" as const,
    path: `/api/plays/${mainPlay.id}/preferences`,
    cases: {
      as_member: {
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
      as_member: {
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
      as_member: {
        request: {
          body: { level: "HIGH" },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 204, body: {} },
      },
    },
  },
});
