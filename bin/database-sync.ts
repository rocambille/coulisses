import path from "node:path";
import readline from "node:readline/promises";
import { DatabaseSync } from "node:sqlite";
import fs from "fs-extra";

export async function main(
  argv: string[] = process.argv,
  rootDirOverride?: string,
) {
  const rootDir = rootDirOverride ?? path.join(import.meta.dirname, "..");

  // Build the paths to the schema, seeder and database files
  const schema = path.join(rootDir, "src/database/schema.sql");
  const seeder = path.join(rootDir, "src/database/seeder.sql");
  const sqlite = path.join(rootDir, "src/database/data/database.sqlite");

  const args = argv.slice(2);

  const useSeeder = args.includes("--use-seeder");
  const noInteraction =
    args.includes("--no-interaction") || args.includes("-n");

  const expectedArgs = [
    ...(useSeeder ? ["--use-seeder"] : []),
    ...(noInteraction ? ["--no-interaction"] : []),
  ];

  if (args.length !== expectedArgs.length) {
    throw new Error(
      "Usage: npm run database:sync [-- --use-seeder] [--no-interaction|-n]",
    );
  }

  console.info(
    `This script will drop existing '${path.normalize(sqlite)}' to create a new one.`,
  );

  if (!noInteraction) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      const answer = await rl.question(
        "Are you sure you want to continue? This action cannot be undone. (y/N) ",
      );

      if (answer.toLowerCase() !== "y") {
        console.info("\nSync operation cancelled.");
        return;
      }
    } finally {
      rl.close();
    }
  }

  // Delete the existing database file if it exists
  await fs.remove(sqlite);

  // Ensure the parent directory exists
  await fs.ensureDir(path.dirname(sqlite));

  // Create a new database with the specified name
  const database = new DatabaseSync(sqlite);

  try {
    // Read the SQL statements from the schema file
    const sql = await fs.readFile(schema, "utf8");

    // Execute the SQL statements to update the database schema
    database.exec(sql);

    console.info(
      `\nDatabase '${path.normalize(sqlite)}' in sync with '${path.normalize(schema)}' 🆙`,
    );

    if (useSeeder) {
      // Read the SQL statements from the seeder file
      const sql = await fs.readFile(seeder, "utf8");

      // Execute the SQL statements to seed the database
      database.exec(sql);

      console.info(`\nSeeded using '${path.normalize(seeder)}' 🌱`);
    }
  } finally {
    database.close();
  }
}

/* v8 ignore next 6 */
if (process.env.NODE_ENV !== "test") {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
