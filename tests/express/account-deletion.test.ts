/*
  Purpose:
  Verify that deleting an account erases what identifies its owner, without
  blocking the email address or breaking what still references the account.
*/

import fs from "node:fs";

import contracts from "../contracts";
import { actorUser, thirdUser, userWithAvatar } from "../fixtures/users";
import { check, mockedDatabase, setupMocks } from "./test-utils";

const deleteAccountOf = (user: User) => {
  const test = contracts.users.delete_me;

  return check(
    {
      ...test,
      cases: {
        current: {
          ...test.cases.as_me,
          request: { jwtPayload: { sub: user.id } },
        },
      },
    },
    "current",
  );
};

const requestMagicLink = (email: string) =>
  check(
    {
      ...contracts.auth.magic_link,
      cases: {
        current: {
          request: { body: { email } },
          response: { status: 204, body: {} },
        },
      },
    },
    "current",
  );

const findUser = (id: User["id"]) =>
  mockedDatabase.prepare("select * from user where id = ?").get(id);

const usersWithEmail = (email: string) =>
  mockedDatabase.prepare("select id from user where email = ?").all(email);

// Runs a contract case, only asserting that its response still parses
const expectStillReadable = (test: Test, caseName: string) =>
  check(
    {
      ...test,
      cases: {
        current: {
          ...test.cases[caseName],
          response: { status: 200, body: expect.anything() },
        },
      },
    },
    "current",
  );

describe("Account deletion", () => {
  beforeEach(() => {
    setupMocks();
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should erase the name and the email, and mark the row as deleted", async () => {
    await deleteAccountOf(actorUser);

    expect(findUser(actorUser.id)).toMatchObject({
      name: "Compte supprimé",
      email: `deleted-${actorUser.id}@deleted.invalid`,
      deleted_at: expect.any(String),
    });
  });

  it("should erase the photo", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    const unlinkSync = vi.spyOn(fs, "unlinkSync").mockImplementation(() => {});

    await deleteAccountOf(userWithAvatar);

    expect(findUser(userWithAvatar.id)?.avatar_url).toBeNull();
    expect(String(unlinkSync.mock.calls[0][0])).toMatch(
      new RegExp(`${userWithAvatar.avatar_url}$`),
    );
  });

  it("should let the same email sign up again as a new account", async () => {
    await deleteAccountOf(actorUser);

    await requestMagicLink(actorUser.email);

    const [newAccount, ...others] = usersWithEmail(actorUser.email);

    expect(others).toEqual([]);
    expect(newAccount.id).not.toBe(actorUser.id);
  });

  it("should give two deleted accounts different placeholders", async () => {
    await deleteAccountOf(actorUser);
    await deleteAccountOf(thirdUser);

    expect(findUser(actorUser.id)?.email).not.toBe(
      findUser(thirdUser.id)?.email,
    );
  });

  it("should keep the troupe readable for its remaining members", async () => {
    await deleteAccountOf(actorUser);

    await expectStillReadable(contracts.members.browse, "as_member");
    await expectStillReadable(contracts.castings.dashboard, "as_member");
  });
});
