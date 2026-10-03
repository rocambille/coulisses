/*
  Purpose:
  Central registry for mock fixtures and test database seeders.
  Orders seeders to respect foreign key constraints.
*/
import type { DatabaseSync } from "node:sqlite";
import { seedAuthTokens } from "./auth";
import { seedCastings } from "./castings";
import { seedDocuments } from "./documents";
import { seedEvents } from "./events";
import { seedPlays } from "./plays";
import { seedPreferences } from "./preferences";
import { seedRoles } from "./roles";
import { seedScenes } from "./scenes";
import { seedTroupeMembers } from "./troupeMembers";
import { seedTroupes } from "./troupes";
import { seedUsers } from "./users";

export type Seeder = (db: DatabaseSync) => void;

// Seeders ordered by foreign key dependencies (users before items/tokens)
export const seeders: readonly Seeder[] = Object.freeze([
  seedUsers,
  seedAuthTokens,
  seedTroupes,
  seedTroupeMembers,
  seedPlays,
  seedScenes,
  seedRoles,
  seedDocuments,
  seedPreferences,
  seedCastings,
  seedEvents,
]);

export * from "./auth";
export * from "./users";
