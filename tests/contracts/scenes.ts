import { emptyPlay, mainPlay, mainScenes, teacherUser } from "../data";

export default (<Contract>{
  browse: {
    method: "get" as const,
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
    },
  },
  add: {
    method: "post" as const,
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
      as_admin: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 204, body: {} },
      },
    },
  },
});
