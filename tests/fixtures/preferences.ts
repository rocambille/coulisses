/*
  Purpose:
  Centralize all mocked data for both API and React tests.
  This ensures consistency and eliminates duplication.

  Naming:
  Use descriptive names (e.g., teacherUser, mainPlay, mainTroupe) to make tests more readable.
*/

import type { DatabaseSync } from "node:sqlite";

import { mainPlay } from "./plays";
import { mainRoles } from "./roles";
import { mainScenes } from "./scenes";
import { actorUser, teacherUser } from "./users";

export const mainPlayPreferences: PlayPreference[] = [
  {
    user_id: teacherUser.id,
    play_id: mainPlay.id,
    level: "HIGH",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    user_id: actorUser.id,
    play_id: mainPlay.id,
    level: "MEDIUM",
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

export const mainScenePreferences: ScenePreference[] = [
  {
    user_id: teacherUser.id,
    scene_id: mainScenes[0].id,
    level: "HIGH",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    user_id: actorUser.id,
    scene_id: mainScenes[0].id,
    level: "MEDIUM",
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

export const mainRolePreferences: RolePreference[] = [
  {
    user_id: teacherUser.id,
    scene_id: mainScenes[0].id,
    role_id: mainRoles[0].id,
    level: "HIGH",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    user_id: actorUser.id,
    scene_id: mainScenes[1].id,
    role_id: mainRoles[0].id,
    level: "NOT_INTERESTED",
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

export const seedPreferences = (db: DatabaseSync) => {
  const insertPlayPreference = db.prepare(
    "insert into play_preference(user_id, play_id, level, created_at) values(?, ?, ?, ?)",
  );
  for (const preference of mainPlayPreferences) {
    insertPlayPreference.run(
      preference.user_id,
      preference.play_id,
      preference.level,
      preference.created_at,
    );
  }
  const insertScenePreference = db.prepare(
    "insert into scene_preference(user_id, scene_id, level, created_at) values(?, ?, ?, ?)",
  );
  for (const preference of mainScenePreferences) {
    insertScenePreference.run(
      preference.user_id,
      preference.scene_id,
      preference.level,
      preference.created_at,
    );
  }
  const insertRolePreference = db.prepare(
    "insert into role_preference(user_id, scene_id, role_id, level, created_at) values(?, ?, ?, ?, ?)",
  );
  for (const preference of mainRolePreferences) {
    insertRolePreference.run(
      preference.user_id,
      preference.scene_id,
      preference.role_id,
      preference.level,
      preference.created_at,
    );
  }
};
