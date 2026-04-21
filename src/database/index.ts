/*
  Purpose:
  Provide a single, shared SQLite database instance for the entire application.

  This module:
  - Opens a SQLite database file using node:sqlite
  - Exposes the shared database instance for repositories

  This module intentionally does NOT:
  - Manage migrations or schema creation
  - Hide SQL behind abstractions or ORMs

  Design rationale:
  - Using raw SQL keeps data access explicit and predictable
*/

import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const dbPath = path.join(import.meta.dirname, "data/database.sqlite");

// Open the SQLite database file in synchronous mode
const database = new DatabaseSync(dbPath);

// Log the database availability at startup
console.info(`Using database ${path.normalize(dbPath)}`);

export default database;
