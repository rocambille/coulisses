import {
  actorUser,
  mainTroupe,
  mainTroupeMembers,
  teacherUser,
  thirdUser,
} from "../data";

export default (<Contract>{
  browse: {
    method: "get" as const,
    path: `/api/troupes/${mainTroupe.id}/members`,
    cases: {
      as_member: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 200, body: mainTroupeMembers },
      },
    },
  },
  add: {
    method: "post" as const,
    path: `/api/troupes/${mainTroupe.id}/members`,
    cases: {
      as_admin: {
        request: {
          body: { email: thirdUser.email, role: "ACTOR" },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 204, body: {} },
      },
    },
  },
  edit: {
    method: "put" as const,
    path: `/api/troupes/${mainTroupe.id}/members/${actorUser.id}`,
    cases: {
      as_admin: {
        request: {
          body: {
            email: actorUser.email,
            name: actorUser.name,
            role: "ADMIN",
          },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 204, body: {} },
      },
    },
  },
  delete: {
    method: "delete" as const,
    path: `/api/troupes/${mainTroupe.id}/members/${actorUser.id}`,
    cases: {
      as_admin: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 204, body: {} },
      },
    },
  },
});
