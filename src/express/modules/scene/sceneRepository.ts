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
      `insert into scene (play_id, title, description, duration, scene_order) 
       values (?, ?, ?, ?, ?)`,
      [
        playId,
        scene.title,
        scene.description ?? null,
        scene.duration ?? null,
        scene.scene_order,
      ],
    );

    return result.insertId;
  }

  async find(byId: number): Promise<Scene | null> {
    const [rows] = await databaseClient.query<Rows>(
      "select * from scene where id = ?",
      [byId],
    );

    if (rows[0] == null) return null;

    const {
      id,
      title,
      description,
      play_id,
      duration,
      scene_order,
      is_active,
    } = rows[0];

    return {
      id,
      title,
      description,
      play_id,
      duration,
      scene_order,
      is_active,
    };
  }

  async findByPlay(play: Play): Promise<Scene[]> {
    const [rows] = await databaseClient.query<Rows>(
      "select * from scene where play_id = ? order by scene_order asc",
      [play.id],
    );
    return rows.map<Scene>(
      ({
        id,
        title,
        description,
        play_id,
        duration,
        scene_order,
        is_active,
      }) => ({
        id,
        title,
        description,
        play_id,
        duration,
        scene_order,
        is_active,
      }),
    );
  }

  async update(id: number, scene: Omit<Scene, "id">) {
    // Dynamic update based on provided fields
    const fields: string[] = [];
    const values: unknown[] = [];

    fields.push("title = ?");
    values.push(scene.title);

    fields.push("description = ?");
    values.push(scene.description);

    fields.push("duration = ?");
    values.push(scene.duration);

    fields.push("scene_order = ?");
    values.push(scene.scene_order);

    fields.push("is_active = ?");
    values.push(scene.is_active);

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
