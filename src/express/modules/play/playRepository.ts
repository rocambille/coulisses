/*
  Purpose:
  Centralize all persistence logic related to Play entities.
*/

import databaseClient, {
  type Result,
  type Rows,
} from "../../../database/client";

class PlayRepository {
  async create(play: Omit<Play, "id">) {
    const [result] = await databaseClient.query<Result>(
      "insert into play (title, description) values (?, ?)",
      [play.title, play.description ?? null],
    );

    return result.insertId;
  }

  async read(byId: number): Promise<Play | null> {
    const [rows] = await databaseClient.query<Rows>(
      "select id, title, description from play where id = ?",
      [byId],
    );

    if (rows[0] == null) {
      return null;
    }

    const { id, title, description } = rows[0];

    return { id, title, description };
  }

  // Browse only plays where the user is a member
  async browseForUser(userId: number): Promise<Play[]> {
    const [rows] = await databaseClient.query<Rows>(
      `select p.id, p.title, p.description 
       from play p 
       join play_member pm on p.id = pm.play_id 
       where pm.user_id = ?`,
      [userId],
    );

    return rows as Play[];
  }

  async update(id: number, play: Omit<Play, "id">) {
    const [result] = await databaseClient.query<Result>(
      "update play set title = ?, description = ? where id = ?",
      [play.title, play.description, id],
    );

    return result.affectedRows;
  }

  async hardDelete(id: number) {
    const [result] = await databaseClient.query<Result>(
      "delete from play where id = ?",
      [id],
    );

    return result.affectedRows;
  }

  // --- Members ---

  async addMember(playId: number, userId: number, role: "TEACHER" | "ACTOR") {
    // Insert IGNORE to avoid errors if they are already in the play
    const [result] = await databaseClient.query<Result>(
      "insert ignore into play_member (play_id, user_id, role) values (?, ?, ?)",
      [playId, userId, role],
    );
    return result.insertId;
  }

  async getMembers(playId: number): Promise<(User & { role: string })[]> {
    const [rows] = await databaseClient.query<Rows>(
      `select u.id, u.email, pm.role, u.name
       from user u
       join play_member pm on u.id = pm.user_id
       where pm.play_id = ?`,
      [playId],
    );
    return rows as (User & { role: string })[];
  }
}

export default new PlayRepository();
