/*
  Purpose:
  Centralize all persistence logic related to Preference entities.
*/

import database from "../../../database";
import {
  PlayPreferenceSchema,
  RolePreferenceSchema,
  ScenePreferenceSchema,
} from "./preferenceSchemas";

class PreferenceRepository {
  findAllForUser(userId: User["id"]): {
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
      playPreferences: playRows.map((row) => PlayPreferenceSchema.parse(row)),
      scenePreferences: sceneRows.map((row) =>
        ScenePreferenceSchema.parse(row),
      ),
      rolePreferences: roleRows.map((row) => RolePreferenceSchema.parse(row)),
    };
  }

  upsertPlayPreference(playPreference: PlayPreference): void {
    database
      .prepare(
        `insert into play_preference (user_id, play_id, level) 
         values (?, ?, ?) 
         on conflict(user_id, play_id) do update set level = excluded.level`,
      )
      .run(
        playPreference.user_id,
        playPreference.play_id,
        playPreference.level,
      );
  }

  upsertScenePreference(scenePreference: ScenePreference): void {
    database
      .prepare(
        `insert into scene_preference (user_id, scene_id, level) 
         values (?, ?, ?) 
         on conflict(user_id, scene_id) do update set level = excluded.level`,
      )
      .run(
        scenePreference.user_id,
        scenePreference.scene_id,
        scenePreference.level,
      );
  }

  upsertRolePreference(rolePreference: RolePreference): void {
    database
      .prepare(
        `insert into role_preference (user_id, scene_id, role_id, level) 
         values (?, ?, ?, ?) 
         on conflict(user_id, scene_id, role_id) do update set level = excluded.level`,
      )
      .run(
        rolePreference.user_id,
        rolePreference.scene_id,
        rolePreference.role_id,
        rolePreference.level,
      );
  }
}

export default new PreferenceRepository();
