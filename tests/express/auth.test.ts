/*
  Purpose:
  Check the rules of sessions and of the secrets sent by email, which
  contracts cannot see: limits across several requests, what one secret
  does to the others, and what the session token really contains.

  Note:
  Without SMTP_URL, emails are printed: these tests read them from the
  console, as a developer would.
*/

import jwt from "jsonwebtoken";
import type { MockInstance } from "vitest";

import contracts from "../contracts";
import { authCodes, emailChanges } from "../fixtures/auth";
import { standardUser, teacherUser } from "../fixtures/users";
import { check, mockedDatabase, setupMocks } from "./test-utils";

vi.mock("../../src/env/server", async (importActual) => {
  const actual = await importActual<typeof import("../../src/env/server")>();

  return { ...actual, serverEnv: { ...actual.serverEnv, SMTP_URL: undefined } };
});

type Request = Case["request"];

// Runs a request with any status, returning the response
const send = (test: Test, request: Request, status: number) =>
  check(
    {
      ...test,
      cases: {
        current: { request, response: { status, body: expect.anything() } },
      },
    },
    "current",
  );

let consoleInfo: MockInstance<typeof console.info>;

const emails = () =>
  consoleInfo.mock.calls
    .map(([text]) => String(text))
    .filter((text) => text.startsWith("To: "));

const lastEmail = (to: string) => {
  const email = emails().findLast((text) => text.startsWith(`To: ${to}\n`));

  if (email == null) throw new Error(`No email sent to ${to}`);

  return {
    text: email,
    code: email.match(/\n(\d{6})\n/)?.[1] ?? "",
    token: email.match(/verify\?token=([0-9a-f]+)/)?.[1] ?? "",
  };
};

const requestLoginEmail = (email: string) =>
  send(contracts.auth.magic_link, { body: { email } }, 204);

const loginWithCode = (email: string, code: string, status: number) =>
  send(contracts.auth.verify_code, { body: { email, code } }, status);

const loginWithLink = (token: string, status: number) =>
  send(contracts.auth.verify, { body: { token } }, status);

const asStandardUser = (
  extra: Partial<NonNullable<Request["jwtPayload"]>> = {},
) => ({ sub: standardUser.id, ...extra }) as Request["jwtPayload"];

describe("Authentication", () => {
  beforeEach(() => {
    setupMocks();
    consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("login email", () => {
    it("should carry a link and a code that both log in", async () => {
      await requestLoginEmail(standardUser.email);
      const { text, code, token } = lastEmail(standardUser.email);

      expect(text).toMatch(/expirent dans 15 minutes/);
      expect(code).toMatch(/^\d{6}$/);

      await loginWithCode(standardUser.email, code, 201);

      // One email, one login: the code consumed the link too
      await loginWithLink(token, 401);
    });

    it("should carry the page to open after login in the link", async () => {
      await send(
        contracts.auth.magic_link,
        {
          body: {
            email: standardUser.email,
            next: "/troupes/1/join?token=abc",
          },
        },
        204,
      );

      const { text } = lastEmail(standardUser.email);

      expect(text).toContain(
        `&next=${encodeURIComponent("/troupes/1/join?token=abc")}`,
      );
    });

    it.each([
      "https://evil.example/troupes",
      "//evil.example/troupes",
      "/\\evil.example/troupes",
      "/\t/evil.example",
      "troupes/1",
    ])("should leave out an unsafe next page: %s", async (next) => {
      await send(
        contracts.auth.magic_link,
        { body: { email: standardUser.email, next } },
        204,
      );

      expect(lastEmail(standardUser.email).text).not.toContain("next=");
    });

    it("should replace the previous email", async () => {
      await requestLoginEmail(standardUser.email);
      const first = lastEmail(standardUser.email);
      await requestLoginEmail(standardUser.email);

      await loginWithCode(standardUser.email, first.code, 401);
      await loginWithLink(first.token, 401);
      await loginWithCode(standardUser.email, authCodes.success, 401);
    });

    it("should stop sending after 5 emails in 15 minutes, without telling", async () => {
      for (let i = 0; i < 6; i += 1) {
        await requestLoginEmail("flooded@mail.com");
      }

      expect(
        emails().filter((text) => text.includes("flooded@mail.com")),
      ).toHaveLength(5);
    });
  });

  describe("code guessing", () => {
    const fail = (times: number) =>
      Promise.all(
        Array.from({ length: times }, () =>
          loginWithCode(standardUser.email, authCodes.wrong, 401),
        ),
      );

    it("should disable a code after 5 wrong attempts, but keep its link", async () => {
      await requestLoginEmail(standardUser.email);
      const { code, token } = lastEmail(standardUser.email);

      await fail(5);

      await loginWithCode(standardUser.email, code, 401);
      await loginWithLink(token, 201);
    });

    it("should refuse codes after 10 failures in a day, but keep links", async () => {
      await requestLoginEmail(standardUser.email);
      await fail(5);
      await requestLoginEmail(standardUser.email);
      await fail(5);

      await requestLoginEmail(standardUser.email);
      const { code, token } = lastEmail(standardUser.email);

      await loginWithCode(standardUser.email, code, 401);
      await loginWithLink(token, 201);
    });

    it("should not accept an email change code to log in", async () => {
      await loginWithCode(standardUser.email, authCodes.emailChange, 401);
    });
  });

  describe("session", () => {
    it("should last 8 days, pinned to HS256, with a version and a login time", async () => {
      vi.mocked(jwt.sign).mockRestore();

      const response = await loginWithCode(
        standardUser.email,
        authCodes.success,
        201,
      );

      const cookie = String(response.headers["set-cookie"]).match(
        /__Host-auth=([^;]+)/,
      )?.[1];
      const token = jwt.decode(String(cookie), { complete: true });
      const payload = token?.payload as jwt.JwtPayload;

      expect(token?.header.alg).toBe("HS256");
      expect(Number(payload.exp) - Number(payload.iat)).toBe(8 * 24 * 60 * 60);
      expect(payload).toMatchObject({
        sub: String(standardUser.id),
        ver: 0,
        auth_time: expect.any(Number),
      });
    });

    it("should keep the login time when it renews the token", async () => {
      const authTime = Math.floor(Date.now() / 1000) - 3600;

      await send(
        contracts.users.read_me,
        { jwtPayload: asStandardUser({ auth_time: authTime }) },
        200,
      );

      expect(vi.mocked(jwt.sign).mock.calls.at(-1)?.[0]).toMatchObject({
        auth_time: authTime,
      });
    });

    it("should end 30 days after the login, even when active", async () => {
      const days = (count: number) =>
        Math.floor(Date.now() / 1000) - count * 24 * 60 * 60;

      await send(
        contracts.users.read_me,
        { jwtPayload: asStandardUser({ auth_time: days(29) }) },
        200,
      );
      await send(
        contracts.users.read_me,
        { jwtPayload: asStandardUser({ auth_time: days(31) }) },
        401,
      );
    });

    it("should refuse tokens issued before session versions", async () => {
      await send(
        contracts.users.read_me,
        { jwtPayload: asStandardUser({ ver: undefined }) },
        401,
      );
    });

    it("should close every session and push subscription when logging out everywhere", async () => {
      mockedDatabase
        .prepare(
          "insert into push_subscription(user_id, endpoint, p256dh, auth) values(?, 'https://fcm.googleapis.com/x', 'k', 'a')",
        )
        .run(standardUser.id);

      await send(
        contracts.auth.logout_everywhere,
        { jwtPayload: asStandardUser() },
        204,
      );

      await send(
        contracts.users.read_me,
        { jwtPayload: asStandardUser() },
        401,
      );
      await send(
        contracts.users.read_me,
        { jwtPayload: asStandardUser({ ver: 1 }) },
        200,
      );
      expect(
        mockedDatabase
          .prepare("select count(*) as count from push_subscription")
          .get()?.count,
      ).toBe(0);
    });
  });

  describe("email change", () => {
    const editMe = (email: string, status: number) =>
      send(
        contracts.users.edit_me,
        {
          body: { email, name: standardUser.name },
          jwtPayload: asStandardUser(),
        },
        status,
      );

    const confirm = (code: string, status: number) =>
      send(
        contracts.users.confirm_me_email,
        { body: { code }, jwtPayload: asStandardUser() },
        status,
      );

    const currentEmail = () =>
      mockedDatabase
        .prepare("select email from user where id = ?")
        .get(standardUser.id)?.email;

    it("should wait for the code sent to the new address", async () => {
      await editMe("new@mail.com", 202);

      expect(currentEmail()).toBe(standardUser.email);

      const { code, token } = lastEmail("new@mail.com");
      expect(token).toBe("");

      await confirm(code, 200);

      expect(currentEmail()).toBe("new@mail.com");
    });

    it("should warn the old address once the change is done", async () => {
      await confirm(authCodes.emailChange, 200);

      expect(lastEmail(standardUser.email).text).toContain(
        `est désormais ${emailChanges.success}`,
      );
    });

    it("should close the other sessions, and renew this one", async () => {
      await confirm(authCodes.emailChange, 200);

      expect(vi.mocked(jwt.sign).mock.calls.at(-1)?.[0]).toMatchObject({
        ver: 1,
      });
      await send(
        contracts.users.read_me,
        { jwtPayload: asStandardUser() },
        401,
      );
    });

    it("should not accept a login code to confirm an email", async () => {
      await confirm(authCodes.success, 400);

      expect(currentEmail()).toBe(standardUser.email);
    });

    it("should refuse an address taken in the meantime", async () => {
      await editMe("soon-taken@mail.com", 202);
      const { code } = lastEmail("soon-taken@mail.com");
      mockedDatabase
        .prepare("update user set email = 'soon-taken@mail.com' where id = ?")
        .run(teacherUser.id);

      await confirm(code, 409);
    });

    it("should limit the codes sent, and say so", async () => {
      // 2 emails are already pending for this user in the fixtures
      for (let i = 0; i < 3; i += 1) {
        await editMe(`try-${i}@mail.com`, 202);
      }

      await editMe("one-too-many@mail.com", 429);
    });
  });
});
