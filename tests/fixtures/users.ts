/*
  Purpose:
  Centralize all mocked user data and database seeding for API, contract, and React tests.
  This ensures consistency and eliminates duplication.

  Naming:
  Use descriptive names (e.g., teacherUser, standardUser, userWithAvatar) to reveal test intent.
*/
import type { DatabaseSync } from "node:sqlite";

export const teacherUser: User = Object.freeze({
  id: 1,
  email: "teacher@mail.com",
  name: "teacher",
  avatar_url: null,
  created_at: "2026-01-01T00:00:00.000Z",
  deleted_at: null,
});

export const standardUser: User = Object.freeze({
  id: 2,
  email: "foo@mail.com",
  name: "foo",
  avatar_url: null,
  created_at: "2026-01-01T00:00:00.000Z",
  deleted_at: null,
});

export const actorUser: User = standardUser;

export const userWithAvatar: User = Object.freeze({
  id: 3,
  email: "bar@mail.com",
  name: "bar",
  avatar_url: "/uploads/avatars/bar.webp",
  created_at: "2026-01-01T00:00:00.000Z",
  deleted_at: null,
});

export const thirdUser: User = userWithAvatar;

export const consumedTokenUser: User = Object.freeze({
  id: 4,
  email: "baz@mail.com",
  name: "baz",
  avatar_url: null,
  created_at: "2026-01-01T00:00:00.000Z",
  deleted_at: null,
});

export const deletedUser: User = Object.freeze({
  id: 5,
  email: "deleted@mail.com",
  name: "deleted",
  avatar_url: null,
  created_at: "2026-01-01T00:00:00.000Z",
  deleted_at: "2026-01-01T10:00:00.000Z",
});

export const corruptedUser: User = Object.freeze({
  id: 6,
  email: "corrupted@mail.com",
  name: "corrupted",
  avatar_url: "http://[invalid",
  created_at: "2026-01-01T00:00:00.000Z",
  deleted_at: null,
});

export const allUsers: User[] = Object.freeze([
  teacherUser,
  standardUser,
  userWithAvatar,
  consumedTokenUser,
  deletedUser,
  corruptedUser,
]) as User[];

export const seedUsers = (db: DatabaseSync) => {
  const insertUser = db.prepare(
    "insert into user(id, email, name, avatar_url, created_at, deleted_at) values(?, ?, ?, ?, ?, ?)",
  );
  for (const user of allUsers) {
    insertUser.run(
      user.id,
      user.email,
      user.name,
      user.avatar_url ?? null,
      user.created_at,
      user.deleted_at ?? null,
    );
  }
};
