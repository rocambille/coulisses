/*
  Purpose:
  Centralize all persistence logic related to Play entities.
*/

import database from "../../../database";

class PlayRepository {
  create(play: Omit<Play, "id">): RowId {
    const result = database
      .prepare(
        `insert into play (troupe_id, title, description)
         values (?, ?, ?)`,
      )
      .run(play.troupe_id, play.title, play.description ?? null);

    return result.lastInsertRowid;
  }

  find(byId: RowId): Play | null {
    const row = database.prepare(`select * from play where id = ?`).get(byId);

    if (row == null) {
      return null;
    }

    const { id, troupe_id, title, description } = row;

    return {
      id: Number(id),
      troupe_id: Number(troupe_id),
      title: String(title),
      description: String(description),
    };
  }

  findByScene(sceneId: RowId): Play | null {
    const row = database
      .prepare(
        `select p.* from play p join scene s on s.play_id = p.id where s.id = ?`,
      )
      .get(sceneId);

    if (row == null) {
      return null;
    }

    const { id, troupe_id, title, description } = row;

    return {
      id: Number(id),
      troupe_id: Number(troupe_id),
      title: String(title),
      description: String(description),
    };
  }

  findByTroupe(troupeId: RowId): Play[] {
    const rows = database
      .prepare(`select * from play where troupe_id = ?`)
      .all(troupeId);

    return rows.map<Play>(({ id, troupe_id, title, description }) => ({
      id: Number(id),
      troupe_id: Number(troupe_id),
      title: String(title),
      description: String(description),
    }));
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
