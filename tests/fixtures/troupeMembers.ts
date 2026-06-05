/*
  Purpose:
  Centralize all mocked data for both API and React tests.
  This ensures consistency and eliminates duplication.

  Naming:
  Use descriptive names (e.g., teacherUser, mainPlay, mainTroupe) to make tests more readable.
*/

import { emptyTroupe, mainTroupe } from "./troupes";
import { actorUser, teacherUser } from "./users";

export const mainTroupeMembers: TroupeMember[] = [
  {
    troupe_id: mainTroupe.id,
    role: "ADMIN",
    joined_at: "2026-01-01T00:00:00.000Z",
    ...teacherUser,
  },
  {
    troupe_id: mainTroupe.id,
    role: "ACTOR",
    joined_at: "2026-01-01T00:00:00.000Z",
    ...actorUser,
  },
];

export const emptyTroupeMembers: TroupeMember[] = [
  {
    troupe_id: emptyTroupe.id,
    role: "ADMIN",
    joined_at: "2026-01-01T00:00:00.000Z",
    ...teacherUser,
  },
];
