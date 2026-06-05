import { teacherUser } from "../fixtures/users";

export default (<Contract>{
  read_me: {
    method: "get",
    path: "/api/users/me",
    cases: {
      as_me: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 200, body: teacherUser },
      },
      unauthorized: {
        request: {},
        response: { status: 401, body: {} },
      },
      invalid_user_id: {
        request: { jwtPayload: { sub: NaN } },
        response: { status: 401, body: {} },
      },
    },
  },
  edit_me: {
    method: "put",
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
    method: "delete",
    path: "/api/users/me",
    cases: {
      as_me: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 204, body: {} },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
    },
  },
});
