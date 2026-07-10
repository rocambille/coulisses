import { mainTroupeMembers } from "../fixtures/troupeMembers";
import { emptyTroupe, mainTroupe } from "../fixtures/troupes";
import { actorUser, teacherUser, thirdUser } from "../fixtures/users";

export default (<Contract>{
  browse: {
    method: "get",
    path: `/api/troupes/${mainTroupe.id}/members`,
    cases: {
      as_member: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 200, body: mainTroupeMembers },
      },
    },
  },
  add: {
    method: "post",
    path: `/api/troupes/${mainTroupe.id}/members`,
    cases: {
      as_admin: {
        request: {
          body: { email: thirdUser.email, role: "ACTOR" },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 204, body: {} },
      },
      forbidden: {
        request: {
          body: { email: thirdUser.email, role: "ACTOR" },
          jwtPayload: { sub: actorUser.id },
        },
        response: { status: 403, body: {} },
      },
    },
  },
  edit: {
    method: "put",
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
      forbidden: {
        request: {
          body: {
            email: actorUser.email,
            name: actorUser.name,
            role: "ADMIN",
          },
          jwtPayload: { sub: actorUser.id },
        },
        response: { status: 403, body: {} },
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
    method: "delete",
    path: `/api/troupes/${mainTroupe.id}/members/${actorUser.id}`,
    cases: {
      as_admin: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 204, body: {} },
      },
      forbidden: {
        request: { jwtPayload: { sub: actorUser.id } },
        response: { status: 403, body: {} },
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
