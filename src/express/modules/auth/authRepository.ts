/*
  Purpose:
  Centralize all persistence logic related to Authentication tokens.
*/

import database from "../../../database";

class AuthRepository {
  insertToken(userId: number, tokenHash: string, expiresAt: Date) {
    const query = database.prepare(
      "insert into magic_link_token (user_id, token_hash, expires_at) values (?, ?, ?)",
    );
    const result = query.run(userId, tokenHash, expiresAt.toISOString());

    return result.lastInsertRowid;
  }

  findByHash(tokenHash: string): MagicLinkToken | null {
    const query = database.prepare(
      "select id, user_id, token_hash, expires_at, consumed_at from magic_link_token where token_hash = ?",
    );
    const row = query.get(tokenHash);

    if (row == null) return null;

    const { id, user_id, token_hash, expires_at, consumed_at } = row;

    return {
      id: Number(id),
      user_id: Number(user_id),
      token_hash: String(token_hash),
      expires_at: new Date(String(expires_at)),
      consumed_at: consumed_at ? new Date(String(consumed_at)) : null,
    };
  }

  markAsConsumed(tokenId: number): number | bigint {
    const query = database.prepare(
      "update magic_link_token set consumed_at = datetime('now') where id = ?",
    );
    const result = query.run(tokenId);

    return result.changes;
  }

  deleteExpiredByUser(userId: number): number | bigint {
    const query = database.prepare(
      "delete from magic_link_token where user_id = ? and (expires_at < datetime('now') or consumed_at is not null)",
    );
    const result = query.run(userId);

    return result.changes;
  }
}

export default new AuthRepository();
