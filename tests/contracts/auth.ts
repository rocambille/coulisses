import { cookies } from "supertest";

import { authCodes, authTokens } from "../fixtures/auth";
import { standardUser } from "../fixtures/users";

export default (<Contract>{
  magic_link: {
    method: "post",
    path: "/api/auth/magic-link",
    cases: {
      success: {
        request: {
          body: {
            email: standardUser.email,
          },
        },
        response: {
          status: 204,
          body: {},
        },
      },
      new_user: {
        request: { body: { email: "new_user@mail.com" } },
        response: { status: 204, body: {} },
      },
      with_next: {
        request: {
          body: {
            email: standardUser.email,
            next: "/troupes/1/join?token=abc",
          },
        },
        response: { status: 204, body: {} },
      },
      bad_request: {
        request: { body: {} },
        response: { status: 400, body: expect.any(Object) },
      },
    },
  },
  verify: {
    method: "post",
    path: "/api/auth/verify",
    cases: {
      success: {
        request: {
          body: {
            token: authTokens.success,
          },
        },
        response: {
          status: 201,
          body: standardUser,
          and: () => {
            expect(
              cookies.set({
                name: "__Host-auth",
                options: {
                  httpOnly: true,
                  sameSite: "strict",
                  secure: true,
                  path: "/",
                },
              }),
            );
          },
        },
      },
      bad_request: {
        request: { body: {} },
        response: {
          status: 400,
          body: expect.any(Object),
          and: () => {
            expect(
              cookies.not("set", {
                name: "__Host-auth",
              }),
            );
          },
        },
      },
      unauthorized: {
        request: { body: { token: "invalid_token" } },
        response: {
          status: 401,
          body: {},
          and: () => {
            expect(
              cookies.not("set", {
                name: "__Host-auth",
              }),
            );
          },
        },
      },
      consumed: {
        request: { body: { token: authTokens.consumed } },
        response: {
          status: 401,
          body: {},
          and: () => {
            expect(
              cookies.not("set", {
                name: "__Host-auth",
              }),
            );
          },
        },
      },
      expired: {
        request: { body: { token: authTokens.expired } },
        response: {
          status: 401,
          body: {},
          and: () => {
            expect(
              cookies.not("set", {
                name: "__Host-auth",
              }),
            );
          },
        },
      },
      deleted_user: {
        request: {
          body: { token: authTokens.deletedUser },
          jwtPayload: { sub: "deleted@mail.com" },
        },
        response: {
          status: 401,
          body: {},
          and: () => {
            expect(
              cookies.not("set", {
                name: "__Host-auth",
              }),
            );
          },
        },
      },
    },
  },
  verify_code: {
    method: "post",
    path: "/api/auth/verify-code",
    cases: {
      success: {
        request: {
          body: { email: standardUser.email, code: authCodes.success },
        },
        response: {
          status: 201,
          body: standardUser,
          and: () => {
            expect(
              cookies.set({
                name: "__Host-auth",
                options: {
                  httpOnly: true,
                  sameSite: "strict",
                  secure: true,
                  path: "/",
                },
              }),
            );
          },
        },
      },
      bad_request: {
        request: { body: { email: standardUser.email, code: "12ab" } },
        response: { status: 400, body: {} },
      },
      unauthorized: {
        request: { body: { email: standardUser.email, code: authCodes.wrong } },
        response: {
          status: 401,
          body: {},
          and: () => {
            expect(cookies.not("set", { name: "__Host-auth" }));
          },
        },
      },
      unknown_email: {
        request: {
          body: { email: "nobody@mail.com", code: authCodes.success },
        },
        response: { status: 401, body: {} },
      },
    },
  },
  logout_everywhere: {
    method: "post",
    path: "/api/auth/logout-everywhere",
    cases: {
      as_user: {
        request: { jwtPayload: { sub: standardUser.id } },
        response: { status: 204, body: {} },
      },
      unauthorized: {
        request: {},
        response: { status: 401, body: {} },
      },
    },
  },
  logout: {
    method: "post",
    path: "/api/auth/logout",
    cases: {
      anyone: {
        request: {},
        response: { status: 204, body: {} },
      },
    },
  },
});
