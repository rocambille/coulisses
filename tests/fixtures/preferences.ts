/*
  Purpose:
  Centralize all mocked data for both API and React tests.
  This ensures consistency and eliminates duplication.

  Naming:
  Use descriptive names (e.g., teacherUser, mainPlay, mainTroupe) to make tests more readable.
*/

import { mainPlay } from "./plays";
import { mainRoles } from "./roles";
import { mainScenes } from "./scenes";
import { actorUser, teacherUser } from "./users";

export const mainPlayPreferences: PlayPreference[] = [
  {
    user_id: actorUser.id,
    play_id: mainPlay.id,
    level: "HIGH",
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
