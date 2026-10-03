/*
  Purpose:
  Centralize all mocked data for both API and React tests.
  This ensures consistency and eliminates duplication.

  Naming:
  Use descriptive names (e.g., teacherUser, mainPlay, mainTroupe) to make tests more readable.
*/

import type { DatabaseSync } from "node:sqlite";

import { mainPlay } from "./plays";
import { mainScenes } from "./scenes";

export const mainRoles: RoleWithScenes[] = [
  {
    id: 1,
    play_id: mainPlay.id,
    name: "Role 1",
    description: "Major role",
    scenes: [mainScenes[0], mainScenes[1]],
  },
  {
    id: 2,
    play_id: mainPlay.id,
    name: "Role 2",
    description: "",
    scenes: [mainScenes[1]],
  },
];

export const seedRoles = (db: DatabaseSync) => {
  const insertRole = db.prepare(
    "insert into role(id, play_id, name, description) values(?, ?, ?, ?)",
  );
  const insertRoleScene = db.prepare(
    "insert into role_scene(role_id, scene_id) values(?, ?)",
  );

  for (const role of mainRoles) {
    insertRole.run(role.id, role.play_id, role.name, role.description);

    for (const scene of role.scenes) {
      insertRoleScene.run(role.id, scene.id);
    }
  }
};
