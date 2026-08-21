/*
  Purpose:
  Centralize all persistence logic related to Scene entities.
*/

import database from "../../../database";
import {
  type SceneDTO,
  type SceneDTOWithPlayId,
  SceneSchema,
} from "./sceneSchemas";

class SceneRepository {
  create(scene: SceneDTOWithPlayId): Scene["id"] {
    database.exec("BEGIN");

    try {
      const result = database
        .prepare(
          `insert into scene (play_id, title, description, cut_notes, order_in_play, duration_estimated_seconds) 
           values (?, ?, ?, ?, ?, ?)`,
        )
        .run(
          scene.play_id,
          scene.title,
          scene.description,
          scene.cut_notes,
          scene.order_in_play,
          scene.duration_estimated_seconds,
        );

      const sceneId = result.lastInsertRowid;

      if (scene.roleIds.length > 0) {
        const insertRoleScene = database.prepare(
          `insert into role_scene (role_id, scene_id) values (?, ?)`,
        );
        for (const roleId of scene.roleIds) {
          insertRoleScene.run(roleId, sceneId);
        }
      }

      database.exec("COMMIT");
      return Number(sceneId);
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  }

  find(id: Scene["id"]): Scene | null {
    const row = database.prepare("select * from scene where id = ?").get(id);

    return row ? SceneSchema.parse(row) : null;
  }

  findByPlay(playId: Play["id"]): Scene[] {
    const rows = database
      .prepare(
        "select * from scene where play_id = ? order by order_in_play asc",
      )
      .all(playId);

    return rows.map((row) => SceneSchema.parse(row));
  }

  update(scene: SceneDTO & { id: Scene["id"] }): boolean {
    database.exec("BEGIN");

    try {
      const query = `update scene 
                     set title = ?,
                         description = ?,
                         cut_notes = ?,
                         duration_estimated_seconds = ?,
                         order_in_play = ?,
                         is_active = ?
                     where id = ?`;

      const result = database
        .prepare(query)
        .run(
          scene.title,
          scene.description,
          scene.cut_notes,
          scene.duration_estimated_seconds,
          scene.order_in_play,
          Number(scene.is_active),
          scene.id,
        );

      database
        .prepare(`delete from role_scene where scene_id = ?`)
        .run(scene.id);

      if (scene.roleIds.length > 0) {
        const insertRoleScene = database.prepare(
          `insert into role_scene (role_id, scene_id) values (?, ?)`,
        );
        for (const roleId of scene.roleIds) {
          insertRoleScene.run(roleId, scene.id);
        }
      }

      database.exec("COMMIT");
      return result.changes > 0;
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  }

  hardDelete(id: Scene["id"]): boolean {
    const result = database.prepare("delete from scene where id = ?").run(id);

    return result.changes > 0;
  }
}

export default new SceneRepository();
