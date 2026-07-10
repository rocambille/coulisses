/*
  Purpose:
  Centralize all persistence logic related to Preference entities.
*/

import { z } from "zod";
import database from "../../../database";

const preferenceShape = {
  user_id: z.number(),
  level: z.enum(["NOT_INTERESTED", "LOW", "MEDIUM", "HIGH"]),
  created_at: z.string(),
};

const playPreferenceShape = {
  ...preferenceShape,
  play_id: z.number(),
};

const scenePreferenceShape = {
  ...preferenceShape,
  scene_id: z.number(),
};

const rolePreferenceShape = {
  ...preferenceShape,
  scene_id: z.number(),
  role_id: z.number(),
};

const playPreferenceSchema: z.ZodType<PlayPreference> =
  z.object(playPreferenceShape);
const scenePreferenceSchema: z.ZodType<ScenePreference> =
  z.object(scenePreferenceShape);
const rolePreferenceSchema: z.ZodType<RolePreference> =
  z.object(rolePreferenceShape);

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
      playPreferences: playRows.map((row) => playPreferenceSchema.parse(row)),
      scenePreferences: sceneRows.map((row) =>
        scenePreferenceSchema.parse(row),
      ),
      rolePreferences: roleRows.map((row) => rolePreferenceSchema.parse(row)),
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
