/*
  Purpose:
  Centralize all persistence logic related to Authentication tokens.
*/

import databaseClient, {
  type Result,
  type Rows,
} from "../../../database/client";

class AuthRepository {
  async insertToken(userId: number, tokenHash: string, expiresAt: Date) {
    const [result] = await databaseClient.query<Result>(
      "insert into magic_link_token (user_id, token_hash, expires_at) values (?, ?, ?)",
      [userId, tokenHash, expiresAt],
    );

    return result.insertId;
  }

  async findByHash(tokenHash: string): Promise<MagicLinkToken | null> {
    const [rows] = await databaseClient.query<Rows>(
      "select id, user_id, token_hash, expires_at, consumed_at from magic_link_token where token_hash = ?",
      [tokenHash],
    );

    if (rows[0] == null) return null;

    const { id, user_id, token_hash, expires_at, consumed_at } = rows[0];

    return {
      id,
      user_id,
      token_hash,
      expires_at,
      consumed_at,
    };
  }

  async markAsConsumed(tokenId: number) {
    const [result] = await databaseClient.query<Result>(
      "update magic_link_token set consumed_at = now() where id = ?",
      [tokenId],
    );

    return result.affectedRows;
  }

  async deleteExpiredByUser(userId: number) {
    const [result] = await databaseClient.query<Result>(
      "delete from magic_link_token where user_id = ? and (expires_at < now() or consumed_at is not null)",
      [userId],
    );

    return result.affectedRows;
  }
}

export default new AuthRepository();
