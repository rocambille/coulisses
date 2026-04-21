import path from "node:path";
import readline from "node:readline/promises";
import { DatabaseSync } from "node:sqlite";
import fs from "fs-extra";

// Build the path to the schema SQL file
const schema = path.join(import.meta.dirname, "../src/database/schema.sql");
const seeder = path.join(import.meta.dirname, "../src/database/seeder.sql");
const sqlite = path.join(
  import.meta.dirname,
  "../src/database/data/database.sqlite",
);

// Setup readline for interactive confirmation.
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Asks the user for confirmation.
async function confirm(question: string): Promise<boolean> {
  const answer = await rl.question(`${question} (y/N) `);
  return answer.toLowerCase() === "y";
}

let database: DatabaseSync | null = null;

async function main() {
  const args = process.argv.slice(2);

  const useSeeder = args.includes("--use-seeder");
  const noInteraction =
    args.includes("--no-interaction") || args.includes("-n");

  const expectedArgs = [
    ...(useSeeder ? ["--use-seeder"] : []),
    ...(noInteraction ? ["--no-interaction"] : []),
  ];

  if (args.length !== expectedArgs.length) {
    console.error(
      "Usage: npm run database:sync [-- --use-seeder] [--no-interaction|-n]",
    );
    process.exit(1);
  }

  console.info(
    `This script will drop existing '${path.normalize(sqlite)}' to create a new one.`,
  );

  const proceed = async () => {
    if (noInteraction) {
      console.info(
        "Running in non-interactive mode. Proceeding automatically.",
      );
      return true;
    } else {
      return await confirm(
        "Are you sure you want to continue? This action cannot be undone.",
      );
    }
  };

  if (!(await proceed())) {
    console.info("\nSync operation cancelled.");
    return;
  }

  // Delete the existing database file if it exists
  await fs.remove(sqlite);

  // Create a new database with the specified name
  database = new DatabaseSync(sqlite);

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
}

main()
  .catch((err) => {
    console.error("An unexpected error occurred:", err);
    process.exit(1);
  })
  .finally(() => {
    rl.close();
    database?.close();
  });
