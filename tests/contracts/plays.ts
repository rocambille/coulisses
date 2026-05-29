import {
  actorUser,
  allPlays,
  emptyTroupe,
  mainPlay,
  mainTroupe,
  teacherUser,
  thirdUser,
} from "../data";

export default (<Contract>{
  browse: {
    method: "get" as const,
    path: `/api/troupes/${mainTroupe.id}/plays`,
    cases: {
      as_member: {
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
  read: {
    method: "get" as const,
    path: `/api/plays/${mainPlay.id}`,
    cases: {
      as_member: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 200, body: mainPlay },
      },
      forbidden: {
        request: { jwtPayload: { sub: thirdUser.id } },
        response: { status: 403, body: {} },
      },
    },
  },
  add: {
    method: "post" as const,
    path: `/api/troupes/${mainTroupe.id}/plays`,
    cases: {
      as_admin: {
        request: {
          body: { title: "New Play", description: "" },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 201, body: { insertId: expect.any(Number) } },
      },
      forbidden: {
        request: {
          body: { title: "New Play" },
          jwtPayload: { sub: actorUser.id },
        },
        response: { status: 403, body: {} },
      },
    },
  },
});
