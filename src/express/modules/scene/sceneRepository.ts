/*
  Purpose:
  Centralize all persistence logic related to Scene entities.
*/

import databaseClient, {
  type Result,
  type Rows,
} from "../../../database/client";

class SceneRepository {
  async create(
    playId: number,
    scene: Omit<Scene, "id" | "play_id" | "is_active">,
  ) {
    const [result] = await databaseClient.query<Result>(
      `insert into scene (play_id, title, description, duration, order) 
       values (?, ?, ?, ?, ?)`,
      [
        playId,
        scene.title,
        scene.description ?? null,
        scene.duration ?? null,
        scene.order,
      ],
    );

    return result.insertId;
  }

  async read(byId: number): Promise<Scene | null> {
    const [rows] = await databaseClient.query<Rows>(
      "select * from scene where id = ?",
      [byId],
    );

    if (rows[0] == null) return null;
    return rows[0] as Scene;
  }

  async browseByPlay(playId: number): Promise<Scene[]> {
    const [rows] = await databaseClient.query<Rows>(
      "select * from scene where play_id = ? order by order asc",
      [playId],
    );
    return rows as Scene[];
  }

  async update(id: number, scene: Partial<Scene>) {
    // Dynamic update based on provided fields
    const fields: string[] = [];
    const values: unknown[] = [];

    if (scene.title !== undefined) {
      fields.push("title = ?");
      values.push(scene.title);
    }
    if (scene.description !== undefined) {
      fields.push("description = ?");
      values.push(scene.description);
    }
    if (scene.duration !== undefined) {
      fields.push("duration = ?");
      values.push(scene.duration);
    }
    if (scene.order !== undefined) {
      fields.push("order = ?");
      values.push(scene.order);
    }
    if (scene.is_active !== undefined) {
      fields.push("is_active = ?");
      values.push(scene.is_active);
    }

    if (fields.length === 0) return 0;

    values.push(id);
    const query = `update scene set ${fields.join(", ")} where id = ?`;

    const [result] = await databaseClient.query<Result>(query, values);
    return result.affectedRows;
  }

  async hardDelete(id: number) {
    const [result] = await databaseClient.query<Result>(
      "delete from scene where id = ?",
      [id],
    );
    return result.affectedRows;
  }
}

export default new SceneRepository();
