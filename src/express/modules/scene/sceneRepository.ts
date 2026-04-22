/*
  Purpose:
  Centralize all persistence logic related to Scene entities.
*/

import database from "../../../database";

class SceneRepository {
  create(
    playId: number | bigint,
    scene: Omit<Scene, "id" | "play_id" | "is_active">,
  ): number | bigint {
    const result = database
      .prepare(
        `insert into scene (play_id, title, description, duration, scene_order) 
       values (?, ?, ?, ?, ?)`,
      )
      .run(
        playId,
        scene.title,
        scene.description ?? null,
        scene.duration ?? null,
        scene.scene_order,
      );

    return result.lastInsertRowid;
  }

  find(byId: number | bigint): Scene | null {
    const row = database.prepare("select * from scene where id = ?").get(byId);

    if (row == null) return null;

    const {
      id,
      title,
      description,
      play_id,
      duration,
      scene_order,
      is_active,
    } = row;

    const scene: Scene = {
      id: Number(id),
      title: String(title),
      play_id: Number(play_id),
      scene_order: Number(scene_order),
      is_active: Boolean(is_active),
    };
    if (description != null) scene.description = String(description);
    if (duration != null) scene.duration = Number(duration);

    return scene;
  }

  findByPlay(play: Play): Scene[] {
    const rows = database
      .prepare("select * from scene where play_id = ? order by scene_order asc")
      .all(play.id);

    return rows.map<Scene>(
      ({
        id,
        title,
        description,
        play_id,
        duration,
        scene_order,
        is_active,
      }) => {
        const scene: Scene = {
          id: Number(id),
          title: String(title),
          play_id: Number(play_id),
          scene_order: Number(scene_order),
          is_active: Boolean(is_active),
        };
        if (description != null) scene.description = String(description);
        if (duration != null) scene.duration = Number(duration);
        return scene;
      },
    );
  }

  update(id: number | bigint, scene: Omit<Scene, "id">): boolean {
    // Dynamic update based on provided fields
    const fields: string[] = [];
    const values: (string | number | bigint | null)[] = [];

    fields.push("title = ?");
    values.push(scene.title);

    fields.push("description = ?");
    values.push(scene.description ?? null);

    fields.push("duration = ?");
    values.push(scene.duration ?? null);

    fields.push("scene_order = ?");
    values.push(scene.scene_order);

    fields.push("is_active = ?");
    values.push(scene.is_active ? 1 : 0);

    values.push(id);
    const query = `update scene set ${fields.join(", ")} where id = ?`;

    const result = database.prepare(query).run(...values);
    return result.changes === 1;
  }

  hardDelete(id: number | bigint): boolean {
    const result = database.prepare("delete from scene where id = ?").run(id);
    return result.changes === 1;
  }
}

export default new SceneRepository();
