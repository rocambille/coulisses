/*
  Purpose:
  Centralize all mocked data for both API and React tests.
  This ensures consistency and eliminates duplication.

  Naming:
  Use descriptive names (e.g., teacherUser, mainPlay, mainTroupe) to make tests more readable.
*/
import type { DatabaseSync } from "node:sqlite";

export const allTroupes: Troupe[] = [
  {
    id: 1,
    name: "Les Joyeux Lurons",
    description: "Troupe amatrice du jeudi soir",
    external_discussion_link: "https://chat.whatsapp.com/123",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    name: "Troupe Vide",
    description: "",
    external_discussion_link: "",
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

export const mainTroupe = allTroupes[0];
export const emptyTroupe = allTroupes[1];

export const seedTroupes = (db: DatabaseSync) => {
  const insertTroupe = db.prepare(
    "insert into troupe(id, name, description, external_discussion_link, created_at) values(?, ?, ?, ?, ?)",
  );
  for (const troupe of allTroupes) {
    insertTroupe.run(
      troupe.id,
      troupe.name,
      troupe.description,
      troupe.external_discussion_link,
      troupe.created_at,
    );
  }
};
