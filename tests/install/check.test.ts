import path from "node:path";
import fs from "fs-extra";

import database from "../../src/database";

describe("Setup", () => {
  describe(".env file", () => {
    it("should exist at project root", async () => {
      const envPath = path.resolve(import.meta.dirname, "../../.env");

      expect(await fs.exists(envPath)).toBe(true);
    });
    it("should define required environment variables", () => {
      expect(process.env.APP_SECRET).toBeDefined();
    });
  });
  describe("Database connection", () => {
    it("should be open", () => {
      expect(database.isOpen).toBe(true);
    });
  });
  describe("Database schema", () => {
    it("should contain a 'user' table as defined in schema.sql", () => {
      const statement = database.prepare(
        "select name from sqlite_schema where type ='table' and name = 'user'",
      );

      const rows = statement.all();

      expect(rows.length).toBe(1);
    });
  });
});
