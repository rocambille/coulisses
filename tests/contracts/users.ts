import { authCodes, emailChanges } from "../fixtures/auth";
import { corruptedUser, standardUser, userWithAvatar } from "../fixtures/users";

const dummyImageBuffer = Buffer.from(
  "UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=",
  "base64",
);

export default (<Contract>{
  read_me: {
    method: "get",
    path: "/api/users/me",
    cases: {
      as_me: {
        request: {
          jwtPayload: { sub: standardUser.id },
        },
        response: {
          status: 200,
          body: standardUser,
        },
      },
      as_user_with_avatar: {
        request: {
          jwtPayload: { sub: userWithAvatar.id },
        },
        response: {
          status: 200,
          body: userWithAvatar,
        },
      },
      corrupted_avatar_url: {
        request: { jwtPayload: { sub: corruptedUser.id } },
        response: { status: 401, body: {} },
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
          body: { email: standardUser.email, name: "updated" },
          jwtPayload: { sub: standardUser.id },
        },
        response: { status: 204, body: {} },
      },
      email_change: {
        request: {
          body: { email: "updated@mail.com", name: standardUser.name },
          jwtPayload: { sub: standardUser.id },
        },
        response: { status: 202, body: { pending_email: "updated@mail.com" } },
      },
    },
  },
  confirm_me_email: {
    method: "post",
    path: "/api/users/me/email",
    cases: {
      as_me: {
        request: {
          body: { code: authCodes.emailChange },
          jwtPayload: { sub: standardUser.id },
        },
        response: {
          status: 200,
          body: { ...standardUser, email: emailChanges.success },
        },
      },
      bad_request: {
        request: { body: { code: "x" }, jwtPayload: { sub: standardUser.id } },
        response: { status: 400, body: expect.any(Array) },
      },
      wrong_code: {
        request: {
          body: { code: authCodes.wrong },
          jwtPayload: { sub: standardUser.id },
        },
        response: { status: 400, body: {} },
      },
      email_taken: {
        request: {
          body: { code: authCodes.emailChange },
          jwtPayload: { sub: userWithAvatar.id },
        },
        response: { status: 409, body: {} },
      },
      unauthorized: {
        request: {},
        response: { status: 401, body: {} },
      },
    },
  },
  delete_me: {
    method: "delete",
    path: "/api/users/me",
    cases: {
      as_me: {
        request: { jwtPayload: { sub: standardUser.id } },
        response: { status: 204, body: {} },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
    },
  },
  upload_me_avatar: {
    method: "post",
    path: "/api/users/me/avatar",
    cases: {
      as_me: {
        request: {
          jwtPayload: { sub: standardUser.id },
          attach: {
            name: "avatar",
            file: dummyImageBuffer,
            options: { filename: "avatar.webp", contentType: "image/webp" },
          },
        },
        response: {
          status: 201,
          body: {
            avatar_url: expect.stringMatching(/^\/uploads\/avatars\/.*\.webp$/),
          },
        },
      },
      invalid_file_type: {
        request: {
          jwtPayload: { sub: standardUser.id },
          attach: {
            name: "avatar",
            file: Buffer.from("plain text"),
            options: { filename: "doc.txt", contentType: "text/plain" },
          },
        },
        response: {
          status: 400,
          body: { message: expect.stringMatching(/Invalid file type/i) },
        },
      },
      no_attached_file: {
        request: { jwtPayload: { sub: standardUser.id } },
        response: {
          status: 400,
          body: { message: expect.stringMatching(/No file attached/i) },
        },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
    },
  },
  delete_me_avatar: {
    method: "delete",
    path: "/api/users/me/avatar",
    cases: {
      as_me: {
        request: { jwtPayload: { sub: standardUser.id } },
        response: { status: 204, body: {} },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
    },
  },
});
