/*
  Purpose:
  Centralize all mocked data for both API and React tests.
  This ensures consistency and eliminates duplication.

  Naming:
  Use descriptive names (e.g., teacherUser, mainPlay, mainTroupe) to make tests more readable.
*/

import { mainTroupe } from "./troupes";

export const allPlays: Play[] = [
  {
    id: 1,
    troupe_id: mainTroupe.id,
    title: "Play 1",
    description: "Desc 1",
  },
  {
    id: 2,
    troupe_id: mainTroupe.id,
    title: "Play 2",
    description: "Desc 2",
  },
];

export const mainPlay = allPlays[0];
export const emptyPlay = allPlays[1];
