/*
  Purpose:
  Centralize all mocked data for both API and React tests.
  This ensures consistency and eliminates duplication.

  Naming:
  Use descriptive names (e.g., teacherUser, mainPlay, mainTroupe) to make tests more readable.
*/

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
    description: "Minor role",
    scenes: [mainScenes[1]],
  },
];
