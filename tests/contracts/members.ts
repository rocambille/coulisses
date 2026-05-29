import {
  actorUser,
  emptyTroupe,
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
      conflict: {
        specialPath: `/api/troupes/${emptyTroupe.id}/members/${teacherUser.id}`,
        request: {
          body: {
            email: teacherUser.email,
            name: teacherUser.name,
            role: "ACTOR",
          },
          jwtPayload: { sub: teacherUser.id },
        },
        response: {
          status: 409,
          body: {
            error:
              "Vous devez laisser au moins un administrateur dans la troupe.",
          },
        },
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
      conflict: {
        specialPath: `/api/troupes/${emptyTroupe.id}/members/${teacherUser.id}`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: {
          status: 409,
          body: {
            error:
              "Vous devez laisser au moins un administrateur dans la troupe.",
          },
        },
      },
    },
  },
});
