import { teacherUser } from "../data";

export default (<Contract>{
  read_me: {
    method: "get" as const,
    path: "/api/users/me",
    cases: {
      as_me: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 200, body: teacherUser },
      },
      guest: {
        request: {},
        response: { status: 401, body: {} },
      },
      unauthorized: {
        request: { jwtPayload: { sub: NaN } },
        response: { status: 401, body: {} },
      },
    },
  },
  edit_me: {
    method: "put" as const,
    path: "/api/users/me",
    cases: {
      as_me: {
        request: {
          body: { email: "updated@mail.com", name: "updated" },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 204, body: {} },
      },
    },
  },
  delete_me: {
    method: "delete" as const,
    path: "/api/users/me",
    cases: {
      as_me: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 204, body: {} },
      },
    },
  },
});
