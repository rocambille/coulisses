/*
  Purpose:
  Centralize all persistence logic related to Play entities.
*/

import database from "../../../database";

class PlayRepository {
  create(play: Omit<Play, "id">): RowId {
    const result = database
      .prepare(
        `insert into play (title, description)
       values (?, ?)`,
      )
      .run(play.title, play.description ?? null);

    return result.lastInsertRowid;
  }

  find(byId: RowId): Play | null {
    const row = database.prepare(`select * from play where id = ?`).get(byId);

    if (row == null) {
      return null;
    }

    const { id, title, description } = row;

    const play: Play = {
      id: Number(id),
      title: String(title),
    };
    if (description != null) play.description = String(description);

    return play;
  }

  findByUser(user: User): Play[] {
    const rows = database
      .prepare(
        `select p.* from play p join member_play mp on p.id = mp.play_id where mp.user_id = ?`,
      )
      .all(user.id);

    return rows.map<Play>(({ id, title, description }) => {
      const play: Play = {
        id: Number(id),
        title: String(title),
      };
      if (description != null) play.description = String(description);

      return play;
    });
  }

  update(id: RowId, play: Omit<Play, "id">): boolean {
    const result = database
      .prepare("update play set title = ?, description = ? where id = ?")
      .run(play.title, play.description ?? null, id);

    return result.changes > 0;
  }

  hardDelete(id: RowId): boolean {
    const result = database.prepare("delete from play where id = ?").run(id);

    return result.changes > 0;
  }

  // --- Members ---

  addMember(playId: RowId, userId: RowId, role: "TEACHER" | "ACTOR"): RowId {
    // Insert or IGNORE to avoid errors if they are already in the play
    const result = database
      .prepare(
        "insert or ignore into member_play (play_id, user_id, role) values (?, ?, ?)",
      )
      .run(playId, userId, role);
    return result.lastInsertRowid;
  }

  getMembers(playId: RowId): (User & { role: string })[] {
    const rows = database
      .prepare(
        `select u.id, u.email, pm.role, u.name
       from user u
       join member_play pm on u.id = pm.user_id
       where pm.play_id = ?`,
      )
      .all(playId);

    return rows.map<User & { role: string }>(({ id, email, role, name }) => ({
      id: Number(id),
      email: String(email),
      role: String(role),
      name: String(name),
    }));
  }
}

export default new PlayRepository();
