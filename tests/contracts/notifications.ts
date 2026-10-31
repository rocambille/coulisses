import { mainPlay } from "../fixtures/plays";
import { actorUser, teacherUser } from "../fixtures/users";

const subscription = {
  endpoint: "https://fcm.googleapis.com/fcm/send/abc",
  keys: { p256dh: "public-key", auth: "auth-secret" },
};

export default (<Contract>{
  subscribe: {
    method: "post",
    path: "/api/notifications/subscribe",
    cases: {
      as_member: {
        request: { body: subscription, jwtPayload: { sub: actorUser.id } },
        response: { status: 204, body: {} },
      },
      bad_request: {
        request: { body: {}, jwtPayload: { sub: actorUser.id } },
        response: { status: 400, body: expect.any(Array) },
      },
      unknown_push_service: {
        request: {
          body: { ...subscription, endpoint: "https://internal.example/hook" },
          jwtPayload: { sub: actorUser.id },
        },
        response: { status: 400, body: expect.any(Array) },
      },
      insecure_endpoint: {
        request: {
          body: { ...subscription, endpoint: "http://fcm.googleapis.com/x" },
          jwtPayload: { sub: actorUser.id },
        },
        response: { status: 400, body: expect.any(Array) },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
    },
  },
  unsubscribe: {
    method: "post",
    path: "/api/notifications/unsubscribe",
    cases: {
      as_member: {
        request: {
          body: { endpoint: subscription.endpoint },
          jwtPayload: { sub: actorUser.id },
        },
        response: { status: 204, body: {} },
      },
      bad_request: {
        request: { body: {}, jwtPayload: { sub: actorUser.id } },
        response: { status: 400, body: expect.any(Array) },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
    },
  },
  notify: {
    method: "post",
    path: `/api/plays/${mainPlay.id}/notify`,
    cases: {
      vote_reminder: {
        request: {
          body: { kind: "VOTE_REMINDER" },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 200, body: { recipients: 0 } },
      },
      casting_published: {
        request: {
          body: { kind: "CASTING_PUBLISHED" },
          jwtPayload: { sub: teacherUser.id },
        },
        response: { status: 200, body: { recipients: 0 } },
      },
      bad_request: {
        request: { body: {}, jwtPayload: { sub: teacherUser.id } },
        response: { status: 400, body: expect.any(Array) },
      },
      unauthorized: {
        request: { jwtPayload: null },
        response: { status: 401, body: {} },
      },
      forbidden: {
        request: {
          body: { kind: "VOTE_REMINDER" },
          jwtPayload: { sub: actorUser.id },
        },
        response: { status: 403, body: {} },
      },
      not_found: {
        specialPath: `/api/plays/${NaN}/notify`,
        request: { jwtPayload: { sub: teacherUser.id } },
        response: { status: 404, body: {} },
      },
    },
  },
});
