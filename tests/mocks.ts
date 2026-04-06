/*
  Purpose:
  Centralize all mocked data for both API and React tests.
  This ensures consistency and eliminates duplication.

  Naming:
  Use descriptive names (e.g., teacherUser, mainPlay) to make tests more readable.
*/

// ---------------------------------------------------------
// Users
// ---------------------------------------------------------

export const allUsers: User[] = [
  {
    id: 1,
    email: "foo@mail.com",
    name: "foo",
  },
  {
    id: 2,
    email: "bar@mail.com",
    name: "bar",
  },
  {
    id: 3,
    email: "baz@mail.com",
    name: "baz",
  },
];

export const teacherUser = allUsers[0];
export const actorUser = allUsers[1];
export const guestUser = allUsers[2];

// ---------------------------------------------------------
// Plays & Members
// ---------------------------------------------------------

export const allPlays: Play[] = [
  {
    id: 1,
    title: "Play 1",
    description: "Desc 1",
  },
  {
    id: 2,
    title: "Play 2",
    description: "Desc 2",
  },
];

export const mainPlay = allPlays[0];

export const mainPlayMembers: (User & { role: "TEACHER" | "ACTOR" })[] = [
  { ...teacherUser, role: "TEACHER" },
  { ...actorUser, role: "ACTOR" },
];

export const playMembersDb: PlayMember[] = [
  {
    id: 1,
    user_id: teacherUser.id,
    play_id: mainPlay.id,
    role: "TEACHER" as const,
  },
  {
    id: 2,
    user_id: actorUser.id,
    play_id: mainPlay.id,
    role: "ACTOR" as const,
  },
];

// ---------------------------------------------------------
// Scenes & Roles
// ---------------------------------------------------------
export const mainScenes: Scene[] = [
  {
    id: 1,
    play_id: mainPlay.id,
    title: "Scène 1",
    description: "First scene",
    duration: 10,
    scene_order: 1,
    is_active: true,
  },
  {
    id: 2,
    play_id: mainPlay.id,
    title: "Scène 2",
    description: "Second scene",
    duration: 20,
    scene_order: 2,
    is_active: false,
  },
  {
    id: 3,
    play_id: mainPlay.id,
    title: "Scène 3",
    description: "Third scene",
    duration: 15,
    scene_order: 3,
    is_active: true,
  },
];

export const mainRoles: RoleWithScenes[] = [
  {
    id: 1,
    play_id: mainPlay.id,
    name: "Role 1",
    description: "Major role",
    scenes: [mainScenes[0]],
  },
  {
    id: 2,
    play_id: mainPlay.id,
    name: "Role 2",
    description: "Minor role",
    scenes: [mainScenes[1]],
  },
];

export const sceneRolesDb: { scene_id: number; role_id: number }[] = [
  { scene_id: 1, role_id: 1 },
];

// ---------------------------------------------------------
// Other data
// ---------------------------------------------------------
export const mainPreferences: PreferenceWithUser[] = [
  {
    user_id: teacherUser.id,
    name: teacherUser.name,
    email: teacherUser.email,
    scene_id: 1,
    level: "HIGH" as const,
  },
  {
    user_id: actorUser.id,
    name: actorUser.name,
    email: actorUser.email,
    scene_id: 1,
    level: "MEDIUM" as const,
  },
  {
    user_id: teacherUser.id,
    name: teacherUser.name,
    email: teacherUser.email,
    scene_id: 2,
    level: "LOW" as const,
  },
  {
    user_id: teacherUser.id,
    name: teacherUser.name,
    email: teacherUser.email,
    scene_id: 3,
    level: "NOT_INTERESTED" as const,
  },
];

export const mainCastings: Casting[] = [{ role_id: 1, user_id: actorUser.id }];

export const openingNightEvent = {
  id: 1,
  play_id: mainPlay.id,
  type: "SHOW" as const,
  title: "Opening Night",
  description: "Opening Night description",
  location: "Main Stage",
  start_time: "2026-06-01T20:00:00.000Z",
  end_time: "2026-06-01T22:30:00.000Z",
};

export const mainMatrix: CastingMatrix = {
  scenes: [...mainScenes],
  roles: mainRoles.map(({ scenes, ...r }) => ({ ...r })),
  sceneRoles: [{ scene_id: 1, role_id: 1 }],
  castings: [...mainCastings],
  preferences: mainPreferences.map(({ user_id, scene_id, level }) => ({
    user_id,
    scene_id,
    level,
  })),
};

export const insertId = 42;
