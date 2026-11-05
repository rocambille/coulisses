/*
  Purpose:
  Centralize authentication tokens and database seeding for auth test cases.
*/
import crypto from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import {
  consumedTokenUser,
  deletedUser,
  standardUser,
  teacherUser,
  userWithAvatar,
} from "./users";

export const authTokens = Object.freeze({
  success: "success_token",
  expired: "expired_token",
  consumed: "consumed_token",
  deletedUser: "deleted_token",
});

export const authCodes = Object.freeze({
  success: "123456",
  wrong: "000000",
  emailChange: "654321",
});

export const emailChanges = Object.freeze({
  // Pending for standardUser
  success: "confirmed@mail.com",
  // Pending for userWithAvatar, but already used by teacherUser
  taken: teacherUser.email,
});

export const seedAuthTokens = (db: DatabaseSync) => {
  const insertMagicLinkToken = db.prepare(
    "insert into magic_link_token(user_id, token_hash, expires_at, consumed_at) values(?, ?, ?, ?)",
  );

  const insertCode = db.prepare(
    "insert into magic_link_token(user_id, token_hash, code_hash, new_email, expires_at, created_at) values(?, ?, ?, ?, ?, ?)",
  );

  const hash = (token: string) =>
    crypto.createHash("sha256").update(token).digest("hex");

  // Same formula as authHelper.hashCode, which tests cannot import here:
  // fixtures are also loaded by React tests
  const hashCode = (userId: User["id"], code: string) =>
    crypto
      .createHmac("sha256", String(process.env.APP_SECRET))
      .update(`${userId}:${code}`)
      .digest("hex");

  const validDate = new Date(Date.now() + 100000);
  const expiredDate = new Date(Date.now() - 100000);

  /* valid token for testing valid token scenarios */
  insertMagicLinkToken.run(
    standardUser.id,
    hash(authTokens.success),
    validDate.toISOString(),
    null,
  );

  /* expired token for testing expired token scenarios */
  insertMagicLinkToken.run(
    userWithAvatar.id,
    hash(authTokens.expired),
    expiredDate.toISOString(),
    null,
  );

  /* consumed token for testing consumed token scenarios */
  insertMagicLinkToken.run(
    consumedTokenUser.id,
    hash(authTokens.consumed),
    validDate.toISOString(),
    validDate.toISOString(),
  );

  /* deleted user for testing deleted user scenarios */
  insertMagicLinkToken.run(
    deletedUser.id,
    hash(authTokens.deletedUser),
    validDate.toISOString(),
    null,
  );

  /* login code for standardUser, next to its link */
  insertCode.run(
    standardUser.id,
    hash("code_token"),
    hashCode(standardUser.id, authCodes.success),
    null,
    validDate.toISOString(),
    new Date().toISOString(),
  );

  /* pending email changes */
  insertCode.run(
    standardUser.id,
    hash("email_change_token"),
    hashCode(standardUser.id, authCodes.emailChange),
    emailChanges.success,
    validDate.toISOString(),
    new Date().toISOString(),
  );
  insertCode.run(
    userWithAvatar.id,
    hash("taken_email_change_token"),
    hashCode(userWithAvatar.id, authCodes.emailChange),
    emailChanges.taken,
    validDate.toISOString(),
    new Date().toISOString(),
  );
};
