import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import fs from "fs-extra";

import { main } from "../../bin/database-sync";

const sqlitePath = path.join(
  import.meta.dirname,
  "../../src/database/data/database.sqlite",
);

const runMainWith = async (args: string[]) => {
  await main(args);

  // Verify the database was created
  expect(await fs.pathExists(sqlitePath)).toBe(true);
};

const check = (predicate: (db: DatabaseSync) => void) => {
  const db = new DatabaseSync(sqlitePath);

  try {
    predicate(db);
  } finally {
    db.close();
  }
};

const checkSchema = () => {
  check((db) => {
    const tables = db
      .prepare(
        "select name from sqlite_schema where type = 'table' and name not like 'sqlite_%'",
      )
      .all() as { name: string }[];

    const tableNames = tables.map((t) => t.name);

    expect(tableNames).toContain("user");
    expect(tableNames).toContain("item");
    expect(tableNames).toContain("magic_link_token");
  });
};

describe("database-sync.ts", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  let hadDatabase: boolean;
  let backupPath: string;

  beforeAll(async () => {
    // Save a backup of the current database if it exists
    hadDatabase = await fs.pathExists(sqlitePath);

    if (hadDatabase) {
      backupPath = `${sqlitePath}.bak`;
      await fs.copy(sqlitePath, backupPath);
    }
  });

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  afterAll(async () => {
    // Restore the original database
    if (hadDatabase) {
      await fs.move(backupPath, sqlitePath, { overwrite: true });
    }
  });

  it("fails when no target is provided", async () => {
    await expect(main(["node", "script"])).rejects.toThrow(/usage/i);
  });

  it("fails when given unexpected arguments", async () => {
    await expect(main(["node", "script", "--unknown-flag"])).rejects.toThrow(
      /usage/i,
    );
  });

  it("cancels when user answers no interactively", async () => {
    const readline = await import("node:readline/promises");
    readline.default.createInterface = vi.fn().mockReturnValue({
      question: () => "n",
      close: vi.fn(),
    });

    await main(["node", "script", "both"]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/cancelled/));
  });

  it("loads schema in interactive mode", async () => {
    const readline = await import("node:readline/promises");
    readline.default.createInterface = vi.fn().mockReturnValue({
      question: () => "y",
      close: vi.fn(),
    });

    await runMainWith(["node", "script", "schema"]);

    checkSchema();

    check((db) => {
      const users = db.prepare("select * from user").all();

      expect(users.length).toBe(0);

      const items = db.prepare("select * from item").all();

      expect(items.length).toBe(0);
    });
  });

  it("loads schema in non-interactive mode", async () => {
    await runMainWith(["node", "script", "schema", "-n"]);

    checkSchema();

    check((db) => {
      const users = db.prepare("select * from user").all();

      expect(users.length).toBe(0);

      const items = db.prepare("select * from item").all();

      expect(items.length).toBe(0);
    });
  });

  it("loads seeder in interactive mode", async () => {
    await runMainWith(["node", "script", "schema", "-n"]);

    checkSchema();

    const readline = await import("node:readline/promises");
    readline.default.createInterface = vi.fn().mockReturnValue({
      question: () => "y",
      close: vi.fn(),
    });

    await runMainWith(["node", "script", "seeder"]);

    check((db) => {
      const users = db.prepare("select * from user").all();

      expect(users.length).toBeGreaterThan(0);

      const items = db.prepare("select * from item").all();

      expect(items.length).toBeGreaterThan(0);
    });
  });

  it("loads seeder in non-interactive mode", async () => {
    await runMainWith(["node", "script", "schema", "-n"]);

    checkSchema();

    await runMainWith(["node", "script", "seeder", "-n"]);

    check((db) => {
      const users = db.prepare("select * from user").all();

      expect(users.length).toBeGreaterThan(0);

      const items = db.prepare("select * from item").all();

      expect(items.length).toBeGreaterThan(0);
    });
  });

  it("loads both in interactive mode", async () => {
    const readline = await import("node:readline/promises");
    readline.default.createInterface = vi.fn().mockReturnValue({
      question: () => "y",
      close: vi.fn(),
    });

    await runMainWith(["node", "script", "both"]);

    checkSchema();

    check((db) => {
      const users = db.prepare("select * from user").all();

      expect(users.length).toBeGreaterThan(0);

      const items = db.prepare("select * from item").all();

      expect(items.length).toBeGreaterThan(0);
    });
  });

  it("loads both in non-interactive mode", async () => {
    await runMainWith(["node", "script", "both", "-n"]);

    checkSchema();

    check((db) => {
      const users = db.prepare("select * from user").all();

      expect(users.length).toBeGreaterThan(0);

      const items = db.prepare("select * from item").all();

      expect(items.length).toBeGreaterThan(0);
    });
  });
});
