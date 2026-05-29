import { allTroupes, mainTroupe, teacherUser, thirdUser } from "../data";

export default (<Contract>{
  browse: {
    method: "get" as const,
    path: "/api/troupes",
    cases: {
      as_member: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 200, body: allTroupes },
      },
      empty: {
        request: { jwtPayload: { sub: thirdUser.id } },
        response: { status: 200, body: [] },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
    },
  },
  add: {
    method: "post" as const,
    path: "/api/troupes",
    cases: {
      as_admin: {
        request: {
          body: {
            name: "New Troupe",
            description: "",
            external_discussion_link: "",
          },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 201, body: { insertId: expect.any(Number) } },
      },
      bad_request: {
        request: { body: {}, jwtPayload: { sub: teacherUser.id } },
        response: { status: 400, body: expect.any(Object) },
      },
    },
  },
  read: {
    method: "get" as const,
    path: `/api/troupes/${mainTroupe.id}`,
    cases: {
      as_member: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 200, body: mainTroupe },
      },
      forbidden: {
        request: { jwtPayload: { sub: thirdUser.id } },
        response: { status: 403, body: {} },
      },
    },
  },
});
