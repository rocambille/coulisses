/*
  Purpose:
  Centralize all mocked data for both API and React tests.
  This ensures consistency and eliminates duplication.

  Naming:
  Use descriptive names (e.g., teacherUser, mainPlay, mainTroupe) to make tests more readable.
*/

// ---------------------------------------------------------
// Users
// ---------------------------------------------------------

export const allUsers: User[] = [
  {
    id: 1,
    email: "teacher@mail.com",
    name: "teacher",
    created_at: "2026-01-01T00:00:00.000Z",
    deleted_at: null,
  },
  {
    id: 2,
    email: "actor@mail.com",
    name: "actor",
    created_at: "2026-01-01T00:00:00.000Z",
    deleted_at: null,
  },
  {
    id: 3,
    email: "third@mail.com",
    name: "third",
    created_at: "2026-01-01T00:00:00.000Z",
    deleted_at: null,
  },
  {
    id: 4,
    email: "deleted@mail.com",
    name: "deleted",
    created_at: "2026-01-01T00:00:00.000Z",
    deleted_at: "2026-01-01T10:00:00.000Z",
  },
];

export const teacherUser = allUsers[0];
export const actorUser = allUsers[1];
export const thirdUser = allUsers[2];
export const deletedUser = allUsers[3];

// ---------------------------------------------------------
// Troupes & Members
// ---------------------------------------------------------

export const allTroupes: Troupe[] = [
  {
    id: 1,
    name: "Les Joyeux Lurons",
    description: "Troupe amatrice du jeudi soir",
    external_discussion_link: "https://chat.whatsapp.com/123",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    name: "Troupe Vide",
    description: "Une troupe sans membres",
    external_discussion_link: "",
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

export const mainTroupe = allTroupes[0];
export const emptyTroupe = allTroupes[1];

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

// ---------------------------------------------------------
// Plays
// ---------------------------------------------------------

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

export const mainPlayPreferences: PlayPreference[] = [
  {
    user_id: actorUser.id,
    play_id: mainPlay.id,
    level: "HIGH",
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

// ---------------------------------------------------------
// Scenes & Roles
// ---------------------------------------------------------
export const mainScenes: Scene[] = [
  {
    id: 1,
    play_id: mainPlay.id,
    title: "Scene 1",
    description: "First scene",
    cut_notes: "Couper la fin",
    duration_estimated_seconds: 600,
    order_in_play: 1,
    is_active: true,
  },
  {
    id: 2,
    play_id: mainPlay.id,
    title: "Scene 2",
    description: "Second scene",
    cut_notes: "",
    duration_estimated_seconds: 1200,
    order_in_play: 2,
    is_active: false,
  },
  {
    id: 3,
    play_id: mainPlay.id,
    title: "Scene 3",
    description: "Third scene",
    cut_notes: "",
    duration_estimated_seconds: 900,
    order_in_play: 3,
    is_active: true,
  },
];

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

// ---------------------------------------------------------
// Preferences & Castings
// ---------------------------------------------------------
export const mainScenePreferences: ScenePreference[] = [
  {
    user_id: teacherUser.id,
    scene_id: 1,
    level: "HIGH" as const,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    user_id: actorUser.id,
    scene_id: 1,
    level: "MEDIUM" as const,
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

export const mainRolePreferences: RolePreference[] = [
  {
    user_id: teacherUser.id,
    scene_id: 1,
    role_id: 1,
    level: "HIGH" as const,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    user_id: actorUser.id,
    scene_id: 2,
    role_id: 1,
    level: "NOT_INTERESTED" as const,
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

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

// ---------------------------------------------------------
// Events
// ---------------------------------------------------------
export const openingNightEvent: EventData = {
  id: 1,
  troupe_id: mainTroupe.id,
  owner_id: teacherUser.id,
  type: "SHOW" as const,
  title: "Opening Night",
  description: "Opening Night description",
  location: "Main Stage",
  start_time: "2026-06-01T20:00:00.000Z",
  end_time: "2026-06-01T22:30:00.000Z",
};

export const autoRehearsalEvent: EventData = {
  id: 2,
  troupe_id: mainTroupe.id,
  owner_id: teacherUser.id,
  type: "REHEARSAL" as const,
  title: "Rehearsal",
  description: "Rehearsal description",
  location: "Main Stage",
  start_time: "2026-06-02T20:00:00.000Z",
  end_time: "2026-06-02T22:30:00.000Z",
};

export const fixedRehearsalEvent: EventData = {
  id: 3,
  troupe_id: mainTroupe.id,
  owner_id: teacherUser.id,
  type: "COURSE" as const,
  title: "Course",
  description: "Course description",
  location: "Main Stage",
  start_time: "2026-06-03T20:00:00.000Z",
  end_time: "2026-06-03T22:30:00.000Z",
};

export const allEvents = [
  openingNightEvent,
  autoRehearsalEvent,
  fixedRehearsalEvent,
];

export const mainEventPresences: EventPresence[] = [
  {
    event_id: openingNightEvent.id,
    user_id: actorUser.id,
    status: "PRESENT",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    event_id: openingNightEvent.id,
    user_id: teacherUser.id,
    status: "PENDING",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
];
