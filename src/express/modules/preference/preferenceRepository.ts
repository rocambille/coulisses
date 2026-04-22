/*
  Purpose:
  Persistent logic for Preferences.
*/

import database from "../../../database";

const mapLevelToPreferenceLevel = (level: string): PreferenceLevel => {
  switch (level) {
    case "HIGH":
      return "HIGH";
    case "MEDIUM":
      return "MEDIUM";
    case "LOW":
      return "LOW";
    case "NOT_INTERESTED":
      return "NOT_INTERESTED";
    default:
      throw new Error(`Invalid preference level: ${level}`);
  }
};

class PreferenceRepository {
  upsert(
    userId: number | bigint,
    sceneId: number | bigint,
    level: PreferenceLevel,
  ): boolean {
    // SQLite UPSERT using ON CONFLICT
    const result = database
      .prepare(
        `insert into preference (user_id, scene_id, level) 
       values (?, ?, ?)
       on conflict(user_id, scene_id) do update set level = ?`,
      )
      .run(userId, sceneId, level, level);

    return result.changes === 1;
  }

  findByPlay(playId: number | bigint): PreferenceWithUser[] {
    const rows = database
      .prepare(
        `select p.user_id, u.name, u.email, p.scene_id, p.level 
       from preference p
       join user u on p.user_id = u.id
       join scene s on p.scene_id = s.id 
       where s.play_id = ?`,
      )
      .all(playId);

    return rows.map<PreferenceWithUser>((row) => ({
      user_id: Number(row.user_id),
      name: String(row.name),
      email: String(row.email),
      scene_id: Number(row.scene_id),
      level: mapLevelToPreferenceLevel(String(row.level)),
    }));
  }
}

export default new PreferenceRepository();
