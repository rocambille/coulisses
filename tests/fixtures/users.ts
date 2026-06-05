/*
  Purpose:
  Centralize all mocked data for both API and React tests.
  This ensures consistency and eliminates duplication.

  Naming:
  Use descriptive names (e.g., teacherUser, mainPlay, mainTroupe) to make tests more readable.
*/

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
