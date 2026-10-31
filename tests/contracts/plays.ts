import { allPlays, mainPlay } from "../fixtures/plays";
import { emptyTroupe, mainTroupe } from "../fixtures/troupes";
import { actorUser, teacherUser, thirdUser } from "../fixtures/users";

const dummyImageBuffer = Buffer.from(
  "UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=",
  "base64",
);

export default (<Contract>{
  browse: {
    method: "get",
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
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
      forbidden: {
        request: { jwtPayload: { sub: thirdUser.id } },
        response: { status: 403, body: {} },
      },
      not_found: {
        specialPath: `/api/troupes/${NaN}/plays`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
  read: {
    method: "get",
    path: `/api/plays/${mainPlay.id}`,
    cases: {
      as_member: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 200, body: mainPlay },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
      forbidden: {
        request: { jwtPayload: { sub: thirdUser.id } },
        response: { status: 403, body: {} },
      },
      not_found: {
        specialPath: `/api/plays/${NaN}`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
  add: {
    method: "post",
    path: `/api/troupes/${mainTroupe.id}/plays`,
    cases: {
      as_admin: {
        request: {
          body: { title: "New Play", description: "" },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 201, body: { insertId: expect.any(Number) } },
      },
      as_admin_with_document: {
        request: {
          fields: { title: "New Play", description: "" },
          attach: {
            name: "document",
            file: dummyImageBuffer,
            options: { filename: "page1.webp", contentType: "image/webp" },
          },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 201, body: { insertId: expect.any(Number) } },
      },
      bad_request: {
        request: {
          body: {},
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 400, body: expect.any(Array) },
      },
      bad_request_with_document: {
        request: {
          fields: { description: "" },
          attach: {
            name: "document",
            file: dummyImageBuffer,
            options: { filename: "page1.webp", contentType: "image/webp" },
          },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 400, body: expect.any(Array) },
      },
      invalid_file_type: {
        request: {
          fields: { title: "New Play", description: "" },
          attach: {
            name: "document",
            file: Buffer.from("plain text"),
            options: { filename: "doc.txt", contentType: "text/plain" },
          },
          jwtPayload: { sub: teacherUser.id },
        },
        response: {
          status: 400,
          body: { message: expect.stringMatching(/Invalid file type/i) },
        },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
      forbidden: {
        request: {
          body: { title: "New Play" },
          jwtPayload: { sub: actorUser.id },
        },
        response: { status: 403, body: {} },
      },
      not_found: {
        specialPath: `/api/troupes/${NaN}/plays`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
  delete: {
    method: "delete",
    path: `/api/plays/${mainPlay.id}`,
    cases: {
      as_admin: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 204, body: {} },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
      forbidden: {
        request: { jwtPayload: { sub: actorUser.id } },
        response: { status: 403, body: {} },
      },
      not_found: {
        specialPath: `/api/plays/${NaN}`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 204, body: {} },
      },
    },
  },
});
