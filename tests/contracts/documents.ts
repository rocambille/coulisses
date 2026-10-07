import { allDocuments, mainDocument } from "../fixtures/documents";
import { emptyPlay, mainPlay } from "../fixtures/plays";
import { actorUser, teacherUser, thirdUser } from "../fixtures/users";

const dummyImageBuffer = Buffer.from(
  "UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=",
  "base64",
);

export default (<Contract>{
  browse: {
    method: "get",
    path: `/api/plays/${mainPlay.id}/documents`,
    cases: {
      as_member: {
        request: { jwtPayload: { sub: teacherUser.id } },
        response: {
          status: 200,
          body: allDocuments,
        },
      },
      empty: {
        specialPath: `/api/plays/${emptyPlay.id}/documents`,
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
        specialPath: `/api/plays/${NaN}/documents`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
  upload: {
    method: "post",
    path: `/api/plays/${mainPlay.id}/documents`,
    cases: {
      as_admin: {
        request: {
          jwtPayload: { sub: teacherUser.id },
          attach: {
            name: "documents",
            file: dummyImageBuffer,
            options: { filename: "page1.webp", contentType: "image/webp" },
          },
        },
        response: {
          status: 201,
          body: [
            expect.objectContaining({
              id: expect.any(Number),
              play_id: mainPlay.id,
              file_url: expect.stringMatching(/^\/uploads\/plays\/.*\.webp$/),
              mime_type: "image/webp",
              original_name: "page1.webp",
            }),
          ],
        },
      },
      as_member: {
        request: {
          jwtPayload: { sub: actorUser.id },
          attach: {
            name: "documents",
            file: dummyImageBuffer,
            options: { filename: "page1.webp", contentType: "image/webp" },
          },
        },
        response: {
          status: 201,
          body: [
            expect.objectContaining({
              id: expect.any(Number),
              play_id: mainPlay.id,
              file_url: expect.stringMatching(/^\/uploads\/plays\/.*\.webp$/),
              mime_type: "image/webp",
              original_name: "page1.webp",
            }),
          ],
        },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
      forbidden: {
        request: {
          jwtPayload: { sub: thirdUser.id },
          attach: {
            name: "documents",
            file: dummyImageBuffer,
            options: { filename: "page1.webp", contentType: "image/webp" },
          },
        },
        response: { status: 403, body: {} },
      },
      invalid_file_type: {
        request: {
          jwtPayload: { sub: teacherUser.id },
          attach: {
            name: "documents",
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
        request: { jwtPayload: { sub: teacherUser.id } },
        response: {
          status: 400,
          body: { message: expect.stringMatching(/No files attached/i) },
        },
      },
    },
  },
  delete: {
    method: "delete",
    path: `/api/documents/${mainDocument.id}`,
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
        request: { jwtPayload: { sub: thirdUser.id } },
        response: { status: 403, body: {} },
      },
      not_found: {
        specialPath: `/api/documents/${NaN}`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 204, body: {} },
      },
    },
  },
});
