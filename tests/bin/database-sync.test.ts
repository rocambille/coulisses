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

  it("fails when given unexpected arguments", async () => {
    await expect(main(["node", "script", "--unknown-flag"])).rejects.toThrow(
      /Usage/,
    );
  });

  it("cancels sync when user answers no interactively", async () => {
    const readline = await import("node:readline/promises");
    readline.default.createInterface = vi.fn().mockReturnValue({
      question: () => "n",
      close: vi.fn(),
    });

    await main(["node", "script"]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/cancelled/));
  });

  it("syncs the database with schema in interactive mode", async () => {
    const readline = await import("node:readline/promises");
    readline.default.createInterface = vi.fn().mockReturnValue({
      question: () => "y",
      close: vi.fn(),
    });

    await runMainWith(["node", "script"]);

    checkSchema();
  });

  it("syncs the database with schema in non-interactive mode", async () => {
    await runMainWith(["node", "script", "-n"]);

    checkSchema();
  });

  it("seeds the database when --use-seeder is passed", async () => {
    await runMainWith(["node", "script", "--use-seeder", "-n"]);

    checkSchema();

    check((db) => {
      const users = db.prepare("select * from user").all();

      expect(users.length).toBeGreaterThan(0);

      const items = db.prepare("select * from item").all();

      expect(items.length).toBeGreaterThan(0);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/Seeded using/),
    );
  });
});
