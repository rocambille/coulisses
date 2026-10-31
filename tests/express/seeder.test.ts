/*
  Purpose:
  Check that seeded rows satisfy the schemas of the API: contract tests use
  fixtures, so nothing else would notice a seeder the application cannot read.
*/

import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { scanDatabaseFiles } from "../../scripts/database-helpers";
import { EventSchema } from "../../src/express/modules/event/eventSchemas";

describe("seeder.sql", () => {
  it("should seed events the API can read", () => {
    const database = new DatabaseSync(":memory:");
    const rootDir = path.join(import.meta.dirname, "../..");

    for (const file of scanDatabaseFiles(rootDir)) {
      database.exec(fs.readFileSync(file, "utf8"));
    }

    const events = database.prepare("select * from event").all();

    expect(events.length).toBeGreaterThan(0);
    expect(() => events.map((event) => EventSchema.parse(event))).not.toThrow();

    database.close();
  });
});
