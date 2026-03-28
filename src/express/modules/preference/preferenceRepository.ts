/*
  Purpose:
  Persistent logic for Preferences.
*/

import databaseClient, { type Result } from "../../../database/client";

class PreferenceRepository {
  async upsert(userId: number, sceneId: number, level: PreferenceLevel) {
    // MySQL UPSERT using ON DUPLICATE KEY UPDATE
    const [result] = await databaseClient.query<Result>(
      `insert into preference (user_id, scene_id, level) 
       values (?, ?, ?)
       on duplicate key update level = values(level), created_at = current_timestamp`,
      [userId, sceneId, level],
    );

    // Note: insertId is not guaranteed on duplicate update, but we return affected rows.
    return result.affectedRows;
  }
}

export default new PreferenceRepository();
