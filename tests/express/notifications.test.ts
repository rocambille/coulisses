/*
  Purpose:
  Check who receives which push notification, which contracts cannot see:
  sending happens in the background, after the response.

  Note:
  Seed through mockedDatabase only. Importing a repository from here would
  load src/database before test-utils registers its in-memory mock.
*/

import webpush from "web-push";

import { deleteUploadedFile } from "../../src/express/helpers/upload";
import contracts from "../contracts";
import { openingNightEvent } from "../fixtures/events";
import { emptyPlay, mainPlay } from "../fixtures/plays";
import { mainScenes } from "../fixtures/scenes";
import { mainTroupe } from "../fixtures/troupes";
import { actorUser, teacherUser, thirdUser } from "../fixtures/users";
import { check, mockedDatabase, setupMocks } from "./test-utils";

vi.mock("web-push", () => ({ default: { sendNotification: vi.fn() } }));

vi.mock("../../src/env/server", async (importActual) => {
  const actual = await importActual<typeof import("../../src/env/server")>();

  return {
    ...actual,
    serverEnv: {
      ...actual.serverEnv,
      VITE_VAPID_PUBLIC_KEY: "public-key",
      VAPID_PRIVATE_KEY: "private-key",
      VAPID_SUBJECT: "mailto:contact@example.com",
    },
  };
});

const endpointOf = (user: User) =>
  `https://fcm.googleapis.com/fcm/send/${user.id}`;

const seedSubscription = (user: User) => {
  mockedDatabase
    .prepare(
      "insert into push_subscription(user_id, endpoint, p256dh, auth) values(?, ?, 'key', 'auth')",
    )
    .run(user.id, endpointOf(user));
};

const subscriptionOwners = () =>
  mockedDatabase
    .prepare("select user_id from push_subscription order by user_id")
    .all()
    .map((row) => row.user_id);

const subscriptionEndpoints = () =>
  mockedDatabase
    .prepare("select endpoint from push_subscription")
    .all()
    .map((row) => row.endpoint);

// Runs a contract case with its status, without asserting on its exact body
const run = (test: Test, caseName: string, status: number) =>
  check(
    {
      ...test,
      cases: {
        current: {
          ...test.cases[caseName],
          response: { status, body: expect.anything() },
        },
      },
    },
    "current",
  );

const sent = () =>
  vi.mocked(webpush.sendNotification).mock.calls.map(([target, payload]) => ({
    endpoint: target.endpoint,
    message: JSON.parse(String(payload)),
  }));

describe("Push notifications", () => {
  beforeEach(() => {
    setupMocks();
    vi.mocked(webpush.sendNotification)
      .mockReset()
      .mockResolvedValue({} as never);
    seedSubscription(teacherUser);
    seedSubscription(actorUser);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("on a new play", () => {
    it("should notify the troupe, but not the author", async () => {
      await run(contracts.plays.add, "as_admin", 201);

      expect(sent()).toEqual([
        {
          endpoint: endpointOf(actorUser),
          message: {
            title: mainTroupe.name,
            body: "Nouvelle pièce proposée : New Play",
            url: expect.stringMatching(
              new RegExp(`^/troupes/${mainTroupe.id}/plays/\\d+/scenes$`),
            ),
          },
        },
      ]);
    });

    it("should send one notification mentioning the attached text", async () => {
      const { body } = await run(
        contracts.plays.add,
        "as_admin_with_document",
        201,
      );

      expect(sent()).toHaveLength(1);
      expect(sent()[0].message.body).toContain("texte joint");

      const document = mockedDatabase
        .prepare("select file_url from play_document where play_id = ?")
        .get(body.insertId);
      deleteUploadedFile(String(document?.file_url));
    });
  });

  describe("delivery failures", () => {
    it("should forget a subscription the push service dropped", async () => {
      vi.mocked(webpush.sendNotification).mockRejectedValue(
        Object.assign(new Error("Gone"), { statusCode: 410 }),
      );

      await run(contracts.plays.add, "as_admin", 201);

      await vi.waitFor(() =>
        expect(subscriptionOwners()).toEqual([teacherUser.id]),
      );
    });

    it("should keep the subscription and the request on any other failure", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      vi.mocked(webpush.sendNotification).mockRejectedValue(
        Object.assign(new Error("Unavailable"), { statusCode: 503 }),
      );

      await run(contracts.plays.add, "as_admin", 201);

      await vi.waitFor(() => expect(consoleError).toHaveBeenCalled());
      expect(subscriptionOwners()).toEqual([teacherUser.id, actorUser.id]);
    });
  });

  describe("when subscriptions cannot be read", () => {
    it("should not fail the request", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockedDatabase.exec("drop table push_subscription");

      await run(contracts.plays.add, "as_admin", 201);

      expect(consoleError).toHaveBeenCalled();
    });
  });

  describe("on events", () => {
    it("should notify when an event is added", async () => {
      await run(contracts.events.add, "as_member", 201);

      expect(sent()).toHaveLength(1);
      expect(sent()[0].message.body).toMatch(/^Nouvel événement/);
    });

    it("should stay silent when an edit keeps the schedule", async () => {
      await run(contracts.events.edit, "owner", 204);

      expect(sent()).toEqual([]);
    });

    it("should notify when an edit changes the schedule", async () => {
      const test = contracts.events.edit;
      const owner = test.cases.owner;

      await run(
        {
          ...test,
          cases: {
            moved: {
              ...owner,
              request: {
                ...owner.request,
                body: {
                  ...owner.request.body,
                  start_time: "2030-01-01T18:00:00.000Z",
                },
              },
            },
          },
        },
        "moved",
        204,
      );

      expect(sent()).toHaveLength(1);
      expect(sent()[0].message).toMatchObject({
        body: expect.stringMatching(/^Horaire modifié : .*2030/),
        url: `/troupes/${openingNightEvent.troupe_id}/calendar`,
      });
    });
  });

  describe("on votes", () => {
    const voteAs = (user: User, test: Test, specialPath?: string) =>
      run(
        {
          ...test,
          cases: {
            vote: {
              ...test.cases.as_member,
              specialPath,
              request: {
                ...test.cases.as_member.request,
                jwtPayload: { sub: user.id },
              },
            },
          },
        },
        "vote",
        204,
      );

    const { set_play, set_scene, set_role } = contracts.preferences;

    const adminMessages = () =>
      sent().filter(({ endpoint }) => endpoint === endpointOf(teacherUser));

    describe("on the first scene or role vote in a play", () => {
      beforeEach(() => {
        mockedDatabase.exec("delete from scene_preference");
        mockedDatabase.exec("delete from role_preference");
      });

      it("should tell admins that an actor started voting on scenes", async () => {
        await voteAs(actorUser, set_scene);

        expect(sent()).toEqual([
          {
            endpoint: endpointOf(teacherUser),
            message: {
              title: mainTroupe.name,
              body: `${actorUser.name} a commencé à voter sur ${mainPlay.title}`,
              url: `/troupes/${mainPlay.troupe_id}/plays/${mainPlay.id}/scenes`,
            },
          },
        ]);
      });

      it("should tell admins that an actor started voting on roles", async () => {
        await voteAs(actorUser, set_role);

        expect(adminMessages()).toHaveLength(1);
      });

      it("should not notify again for the next votes of that play", async () => {
        await voteAs(actorUser, set_scene);
        await voteAs(
          actorUser,
          set_scene,
          `/api/scenes/${mainScenes[2].id}/preferences`,
        );
        await voteAs(actorUser, set_role);

        expect(adminMessages()).toHaveLength(1);
      });

      it("should notify for each actor separately", async () => {
        mockedDatabase
          .prepare(
            "insert into troupe_member(user_id, troupe_id, role) values(?, ?, 'ACTOR')",
          )
          .run(thirdUser.id, mainTroupe.id);

        await voteAs(actorUser, set_scene);
        await voteAs(thirdUser, set_scene);

        expect(adminMessages()).toHaveLength(2);
      });

      it("should count a vote in another play as a first vote here", async () => {
        const otherScene = mockedDatabase
          .prepare(
            "insert into scene(play_id, title, description, cut_notes) values(?, 'Other', '', '')",
          )
          .run(emptyPlay.id).lastInsertRowid;

        await voteAs(
          actorUser,
          set_scene,
          `/api/scenes/${otherScene}/preferences`,
        );
        await voteAs(actorUser, set_scene);

        expect(adminMessages().map(({ message }) => message.url)).toEqual([
          `/troupes/${emptyPlay.troupe_id}/plays/${emptyPlay.id}/scenes`,
          `/troupes/${mainPlay.troupe_id}/plays/${mainPlay.id}/scenes`,
        ]);
      });

      it("should stay silent when an admin votes", async () => {
        await voteAs(teacherUser, set_scene);

        expect(sent()).toEqual([]);
      });
    });

    it("should not notify an actor who already voted before", async () => {
      await voteAs(actorUser, set_scene);

      expect(sent()).toEqual([]);
    });

    describe("on a play vote", () => {
      it("should tell admins each time, with the level", async () => {
        await voteAs(actorUser, set_play);
        await voteAs(actorUser, set_play);

        expect(adminMessages()).toHaveLength(2);
        expect(adminMessages()[0].message).toEqual({
          title: mainTroupe.name,
          body: `${actorUser.name} : 🔥 Très envie pour ${mainPlay.title}`,
          url: `/troupes/${mainPlay.troupe_id}`,
        });
      });

      it("should reach every admin, but not the other actors", async () => {
        seedSubscription(thirdUser);
        mockedDatabase
          .prepare(
            "insert into troupe_member(user_id, troupe_id, role) values(?, ?, 'ADMIN')",
          )
          .run(thirdUser.id, mainTroupe.id);

        await voteAs(actorUser, set_play);

        expect(
          sent()
            .map(({ endpoint }) => endpoint)
            .sort(),
        ).toEqual([endpointOf(teacherUser), endpointOf(thirdUser)].sort());
      });

      it("should stay silent when an admin votes", async () => {
        await voteAs(teacherUser, set_play);

        expect(sent()).toEqual([]);
      });
    });
  });

  describe("POST /api/plays/:playId/notify", () => {
    it("should remind actors with incomplete votes, never admins", async () => {
      const { body } = await run(
        contracts.notifications.notify,
        "vote_reminder",
        200,
      );

      expect(body).toEqual({ recipients: 1 });
      expect(sent().map(({ endpoint }) => endpoint)).toEqual([
        endpointOf(actorUser),
      ]);
      expect(sent()[0].message.url).toBe(
        `/troupes/${mainPlay.troupe_id}/plays/${mainPlay.id}/scenes`,
      );
    });

    it("should not remind an actor who voted on every active scene", async () => {
      mockedDatabase
        .prepare(
          "insert into scene_preference(user_id, scene_id, level) values(?, ?, 'LOW')",
        )
        .run(actorUser.id, mainScenes[2].id);

      const { body } = await run(
        contracts.notifications.notify,
        "vote_reminder",
        200,
      );

      expect(body).toEqual({ recipients: 0 });
      expect(sent()).toEqual([]);
    });

    it("should announce the casting to the troupe, but not the author", async () => {
      const { body } = await run(
        contracts.notifications.notify,
        "casting_published",
        200,
      );

      expect(body).toEqual({ recipients: 1 });
      expect(sent()[0].message.url).toBe(
        `/troupes/${mainPlay.troupe_id}/plays/${mainPlay.id}/casting`,
      );
    });
  });

  describe("subscriptions", () => {
    const subscribeAs = (user: User, endpoint: string, status = 204) => {
      const test = contracts.notifications.subscribe;

      return run(
        {
          ...test,
          cases: {
            again: {
              request: {
                ...test.cases.as_member.request,
                body: { endpoint, keys: { p256dh: "new", auth: "new" } },
                jwtPayload: { sub: user.id },
              },
              response: test.cases.as_member.response,
            },
          },
        },
        "again",
        status,
      );
    };

    it.each([
      "https://fcm.googleapis.com/fcm/send/abc",
      "https://jmt17.google.com/fcm/send/abc",
      "https://updates.push.services.mozilla.com/wpush/v2/abc",
      "https://web.push.apple.com/abc",
      "https://wns2-par02p.notify.windows.com/w/?token=abc",
    ])("should accept the push service at %s", async (endpoint) => {
      await subscribeAs(actorUser, endpoint);

      expect(subscriptionEndpoints()).toContain(endpoint);
    });

    it.each([
      "not a url",
      "http://fcm.googleapis.com/fcm/send/abc",
      "https://fcm.googleapis.com:8443/fcm/send/abc",
      "https://fcm.googleapis.com.evil.example/fcm/send/abc",
      "https://fcm.googleapis.com@evil.example/fcm/send/abc",
      "https://jmt17.google.com.evil.example/fcm/send/abc",
      "https://127.0.0.1/fcm/send/abc",
      "https://169.254.169.254/latest/meta-data",
    ])("should refuse the endpoint %s", async (endpoint) => {
      await subscribeAs(actorUser, endpoint, 400);

      expect(subscriptionEndpoints()).not.toContain(endpoint);
    });

    it("should move a browser's subscription to the user now logged in", async () => {
      await subscribeAs(teacherUser, endpointOf(actorUser));

      expect(subscriptionOwners()).toEqual([teacherUser.id, teacherUser.id]);
    });

    it("should not let a user remove someone else's subscription", async () => {
      const test = contracts.notifications.unsubscribe;

      await run(
        {
          ...test,
          cases: {
            foreign: {
              ...test.cases.as_member,
              request: {
                body: { endpoint: endpointOf(teacherUser) },
                jwtPayload: { sub: actorUser.id },
              },
            },
          },
        },
        "foreign",
        204,
      );

      expect(subscriptionOwners()).toEqual([teacherUser.id, actorUser.id]);
    });

    it("should remove the subscriptions of a deleted account", async () => {
      await run(contracts.users.delete_me, "as_me", 204);

      expect(subscriptionOwners()).toEqual([teacherUser.id]);
    });
  });
});
