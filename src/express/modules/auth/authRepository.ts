/*
  Purpose:
  Centralize all persistence logic related to Authentication tokens.
*/

import database from "../../../database";

class AuthRepository {
  insertOrReplaceToken(
    userId: RowId,
    tokenHash: string,
    expiresAt: Date,
  ): RowId {
    const query = database.prepare(
      "insert or replace into magic_link_token (user_id, token_hash, expires_at) values (?, ?, ?)",
    );
    const result = query.run(userId, tokenHash, expiresAt.toISOString());

    return result.lastInsertRowid;
  }

  findByHash(tokenHash: string): MagicLinkToken | null {
    const query = database.prepare(
      "select user_id, token_hash, expires_at, consumed_at from magic_link_token where token_hash = ?",
    );
    const row = query.get(tokenHash);

    if (row == null) return null;

    const { user_id, token_hash, expires_at, consumed_at } = row;

    return {
      user_id: Number(user_id),
      token_hash: String(token_hash),
      expires_at: new Date(String(expires_at)),
      consumed_at: consumed_at ? new Date(String(consumed_at)) : null,
    };
  }

  markAsConsumed(userId: RowId): boolean {
    const query = database.prepare(
      "update magic_link_token set consumed_at = datetime('now') where user_id = ?",
    );
    const result = query.run(userId);

    return result.changes > 0;
  }
}

export default new AuthRepository();
