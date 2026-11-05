/*
  Purpose:
  Centralize all persistence logic related to Authentication tokens.

  Notes:
  - magic_link_token holds every one-time secret sent by email: a login
    (new_email is null) or an email change (new_email is the new address)
*/

import database from "../../../database";
import { UserSchema } from "../user/userSchemas";

const now = "strftime('%Y-%m-%dT%H:%M:%SZ', 'now')";

class AuthRepository {
  /*
    Replaces the pending tokens of the same purpose: only the latest email
    works. Also purges tokens expired for more than a day, which no limit
    looks at anymore.
  */
  insertToken({
    userId,
    tokenHash,
    codeHash,
    newEmail,
    expiresAt,
  }: {
    userId: User["id"];
    tokenHash: string;
    codeHash: string;
    newEmail: string | null;
    expiresAt: Date;
  }) {
    database
      .prepare(
        `update magic_link_token
         set consumed_at = ${now}
         where user_id = ? and consumed_at is null and (new_email is null) = ?`,
      )
      .run(userId, newEmail == null ? 1 : 0);

    database
      .prepare("delete from magic_link_token where expires_at < ?")
      .run(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    database
      .prepare(
        `insert into magic_link_token
           (user_id, token_hash, code_hash, new_email, expires_at, created_at)
         values (?, ?, ?, ?, ?, ${now})`,
      )
      .run(userId, tokenHash, codeHash, newEmail, expiresAt.toISOString());
  }

  countIssuedSince(userId: User["id"], since: Date): number {
    const row = database
      .prepare(
        "select count(*) as count from magic_link_token where user_id = ? and created_at > ?",
      )
      .get(userId, since.toISOString());

    return Number(row?.count);
  }

  countFailedCodeAttemptsSince(userId: User["id"], since: Date): number {
    const row = database
      .prepare(
        `select coalesce(sum(failed_attempts), 0) as count
         from magic_link_token
         where user_id = ? and created_at > ?`,
      )
      .get(userId, since.toISOString());

    return Number(row?.count);
  }

  /* Links log in only: an email change is confirmed with its code */
  consume(tokenHash: string): User["id"] | null {
    const query = database.prepare(`
      update magic_link_token
      set consumed_at = ${now}
      where token_hash = ?
        and new_email is null
        and consumed_at is null
        and expires_at > ${now}
      returning user_id
    `);
    const row = query.get(tokenHash);

    return row ? UserSchema.shape.id.parse(row.user_id) : null;
  }

  /*
    Checks a code against the latest pending token of that purpose.
    A wrong code counts as a failed attempt; past maxAttempts the code is
    disabled, while the link of the same email keeps working.
  */
  consumeCode({
    userId,
    codeHash,
    purpose,
    maxAttempts,
  }: {
    userId: User["id"];
    codeHash: string;
    purpose: "login" | "email_change";
    maxAttempts: number;
  }): { newEmail: string | null } | null {
    const pending = database
      .prepare(
        `select id, code_hash, new_email
         from magic_link_token
         where user_id = ?
           and (new_email is null) = ?
           and code_hash is not null
           and consumed_at is null
           and expires_at > ${now}
         order by id desc
         limit 1`,
      )
      .get(userId, purpose === "login" ? 1 : 0);

    if (pending == null) {
      return null;
    }

    if (pending.code_hash === codeHash) {
      database
        .prepare(
          `update magic_link_token set consumed_at = ${now} where id = ?`,
        )
        .run(pending.id);

      return {
        newEmail: pending.new_email == null ? null : String(pending.new_email),
      };
    }

    database
      .prepare(
        `update magic_link_token
         set failed_attempts = failed_attempts + 1,
             code_hash = case when failed_attempts + 1 >= ? then null else code_hash end
         where id = ?`,
      )
      .run(maxAttempts, pending.id);

    return null;
  }
}

export default new AuthRepository();
