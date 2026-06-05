/*
  Purpose:
  Centralize all mocked data for both API and React tests.
  This ensures consistency and eliminates duplication.

  Naming:
  Use descriptive names (e.g., teacherUser, mainPlay, mainTroupe) to make tests more readable.
*/

import { mainRolePreferences } from "./preferences";
import { mainRoles } from "./roles";
import { mainScenes } from "./scenes";
import { emptyTroupeMembers, mainTroupeMembers } from "./troupeMembers";
import { actorUser, allUsers } from "./users";

export const mainCastings: Casting[] = [
  {
    user_id: actorUser.id,
    scene_id: 1,
    role_id: 1,
    assigned_at: "2026-01-01T00:00:00.000Z",
  },
  {
    user_id: actorUser.id,
    scene_id: 2,
    role_id: 1,
    assigned_at: "2026-01-01T00:00:00.000Z",
  },
];

const matrix = (
  actors: TroupeMember[],
  scenes: Scene[],
  roles: RoleWithScenes[],
  castings: Casting[],
  preferences: RolePreference[],
): CastingMatrix => ({
  actors: actors.map<User>((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    deleted_at: a.deleted_at,
    created_at: a.created_at,
  })),
  scenes: scenes.map((s) => ({
    ...s,
    roles: roles.map(({ scenes, ...r }) => {
      const casting = castings.find(
        (c) => c.role_id === r.id && c.scene_id === s.id,
      );
      return {
        ...r,
        preferences: preferences.filter(
          (rp) => rp.role_id === r.id && rp.scene_id === s.id,
        ),
        assigned_user: casting
          ? (allUsers.find((u) => u.id === casting.user_id) ?? null)
          : null,
      };
    }),
  })),
});

export const mainMatrix = matrix(
  mainTroupeMembers,
  mainScenes,
  mainRoles,
  mainCastings,
  mainRolePreferences,
);
export const emptyMatrix = matrix(emptyTroupeMembers, [], [], [], []);
