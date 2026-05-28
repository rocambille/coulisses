/*
  Purpose:
  Centralize all persistence logic related to Preference entities.
*/

import database from "../../../database";

class PreferenceRepository {
  findAllForUser(userId: RowId): {
    playPreferences: PlayPreference[];
    scenePreferences: ScenePreference[];
    rolePreferences: RolePreference[];
  } {
    const playRows = database
      .prepare(
        `select user_id, play_id, level, created_at 
         from play_preference
         where user_id = ?`,
      )
      .all(userId);

    const sceneRows = database
      .prepare(
        `select user_id, scene_id, level, created_at
         from scene_preference
         where user_id = ?`,
      )
      .all(userId);

    const roleRows = database
      .prepare(
        `select user_id, scene_id, role_id, level, created_at
         from role_preference
         where user_id = ?`,
      )
      .all(userId);

    return {
      playPreferences: playRows.map<PlayPreference>((row) => ({
        user_id: Number(row.user_id),
        play_id: Number(row.play_id),
        level: row.level as PreferenceLevel,
        created_at: String(row.created_at),
      })),
      scenePreferences: sceneRows.map<ScenePreference>((row) => ({
        user_id: Number(row.user_id),
        scene_id: Number(row.scene_id),
        level: row.level as PreferenceLevel,
        created_at: String(row.created_at),
      })),
      rolePreferences: roleRows.map<RolePreference>((row) => ({
        user_id: Number(row.user_id),
        scene_id: Number(row.scene_id),
        role_id: Number(row.role_id),
        level: row.level as PreferenceLevel,
        created_at: String(row.created_at),
      })),
    };
  }

  upsertPlayPreference(
    userId: RowId,
    playId: RowId,
    level: PreferenceLevel,
  ): void {
    database
      .prepare(
        `insert into play_preference (user_id, play_id, level) 
         values (?, ?, ?) 
         on conflict(user_id, play_id) do update set level = excluded.level`,
      )
      .run(userId, playId, level);
  }

  upsertScenePreference(
    userId: RowId,
    sceneId: RowId,
    level: PreferenceLevel,
  ): void {
    database
      .prepare(
        `insert into scene_preference (user_id, scene_id, level) 
         values (?, ?, ?) 
         on conflict(user_id, scene_id) do update set level = excluded.level`,
      )
      .run(userId, sceneId, level);
  }

  upsertRolePreference(
    userId: RowId,
    sceneId: RowId,
    roleId: RowId,
    level: PreferenceLevel,
  ): void {
    database
      .prepare(
        `insert into role_preference (user_id, scene_id, role_id, level) 
         values (?, ?, ?, ?) 
         on conflict(user_id, scene_id, role_id) do update set level = excluded.level`,
      )
      .run(userId, sceneId, roleId, level);
  }
}

export default new PreferenceRepository();
