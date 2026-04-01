/*
  Purpose:
  Persistent logic for Preferences.
*/

import databaseClient, {
  type Result,
  type Rows,
} from "../../../database/client";

class PreferenceRepository {
  async upsert(userId: number, sceneId: number, level: PreferenceLevel) {
    // MySQL UPSERT using ON DUPLICATE KEY UPDATE
    const [result] = await databaseClient.query<Result>(
      `insert into preference (user_id, scene_id, level) 
       values (?, ?, ?)
       on duplicate key update level = ?`,
      [userId, sceneId, level, level],
    );

    return result.affectedRows;
  }

  async findByPlay(playId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `select p.user_id, p.scene_id, p.level 
       from preference p 
       join scene s on p.scene_id = s.id 
       where s.play_id = ?`,
      [playId],
    );

    return rows.map<Preference>((row) => ({
      user_id: row.user_id,
      scene_id: row.scene_id,
      level: row.level,
    }));
  }
}

export default new PreferenceRepository();
