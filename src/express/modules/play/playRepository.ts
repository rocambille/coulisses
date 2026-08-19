/*
  Purpose:
  Centralize all persistence logic related to Play entities.
*/

import database from "../../../database";
import { type PlayDTOWithTroupeId, PlaySchema } from "./playSchemas";

class PlayRepository {
  create(play: PlayDTOWithTroupeId): Play["id"] {
    const result = database
      .prepare(
        `insert into play (troupe_id, title, description)
         values (?, ?, ?)`,
      )
      .run(play.troupe_id, play.title, play.description ?? null);

    return Number(result.lastInsertRowid);
  }

  find(id: Play["id"]): Play | null {
    const row = database.prepare(`select * from play where id = ?`).get(id);

    return row ? PlaySchema.parse(row) : null;
  }

  findByScene(sceneId: Scene["id"]): Play | null {
    const row = database
      .prepare(
        `select p.* from play p join scene s on s.play_id = p.id where s.id = ?`,
      )
      .get(sceneId);

    return row ? PlaySchema.parse(row) : null;
  }

  findByTroupe(troupeId: Troupe["id"]): Play[] {
    const rows = database
      .prepare(`select * from play where troupe_id = ?`)
      .all(troupeId);

    return rows.map((row) => PlaySchema.parse(row));
  }

  update(play: Play): boolean {
    const result = database
      .prepare("update play set title = ?, description = ? where id = ?")
      .run(play.title, play.description, play.id);

    return result.changes > 0;
  }

  hardDelete(id: Play["id"]): boolean {
    const result = database.prepare("delete from play where id = ?").run(id);

    return result.changes > 0;
  }
}

export default new PlayRepository();
