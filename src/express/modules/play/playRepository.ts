/*
  Purpose:
  Centralize all persistence logic related to Play entities.
*/

import { z } from "zod";
import database from "../../../database";

const playShape = {
  id: z.number(),
  troupe_id: z.number(),
  title: z.string(),
  description: z.string(),
};

const playSchema: z.ZodType<Play> = z.object(playShape);

class PlayRepository {
  create(play: Omit<Play, "id">): RowId {
    const result = database
      .prepare(
        `insert into play (troupe_id, title, description)
         values (?, ?, ?)`,
      )
      .run(play.troupe_id, play.title, play.description ?? null);

    return Number(result.lastInsertRowid);
  }

  find(id: RowId): Play | null {
    const row = database.prepare(`select * from play where id = ?`).get(id);

    return row ? playSchema.parse(row) : null;
  }

  findByScene(sceneId: RowId): Play | null {
    const row = database
      .prepare(
        `select p.* from play p join scene s on s.play_id = p.id where s.id = ?`,
      )
      .get(sceneId);

    return row ? playSchema.parse(row) : null;
  }

  findByTroupe(troupeId: RowId): Play[] {
    const rows = database
      .prepare(`select * from play where troupe_id = ?`)
      .all(troupeId);

    return rows.map((row) => playSchema.parse(row));
  }

  update(id: RowId, play: Omit<Play, "id" | "troupe_id">): boolean {
    const result = database
      .prepare("update play set title = ?, description = ? where id = ?")
      .run(play.title, play.description, id);

    return result.changes > 0;
  }

  hardDelete(id: RowId): boolean {
    const result = database.prepare("delete from play where id = ?").run(id);

    return result.changes > 0;
  }
}

export default new PlayRepository();
