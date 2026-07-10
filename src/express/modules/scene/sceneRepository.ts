/*
  Purpose:
  Centralize all persistence logic related to Scene entities.
*/
import { z } from "zod";

import database from "../../../database";

export const sceneShape = {
  id: z.number(),
  title: z.string(),
  description: z.string(),
  cut_notes: z.string(),
  play_id: z.number(),
  order_in_play: z.number(),
  duration_estimated_seconds: z.number(),
  is_active: z.coerce.boolean(),
};

const sceneSchema: z.ZodType<Scene> = z.object(sceneShape);

class SceneRepository {
  create(
    playId: RowId,
    scene: Omit<Scene, "id" | "play_id" | "is_active">,
  ): RowId {
    const result = database
      .prepare(
        `insert into scene (play_id, title, description, cut_notes, order_in_play, duration_estimated_seconds) 
         values (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        playId,
        scene.title,
        scene.description,
        scene.cut_notes,
        scene.order_in_play,
        scene.duration_estimated_seconds,
      );

    return result.lastInsertRowid;
  }

  find(byId: RowId): Scene | null {
    const row = database.prepare("select * from scene where id = ?").get(byId);

    return row ? sceneSchema.parse(row) : null;
  }

  findByPlay(playId: RowId): Scene[] {
    const rows = database
      .prepare(
        "select * from scene where play_id = ? order by order_in_play asc",
      )
      .all(playId);

    return rows.map((row) => sceneSchema.parse(row));
  }

  update(id: RowId, scene: Omit<Scene, "id" | "play_id">): boolean {
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
        id,
      );

    return result.changes > 0;
  }

  hardDelete(id: RowId): boolean {
    const result = database.prepare("delete from scene where id = ?").run(id);

    return result.changes > 0;
  }
}

export default new SceneRepository();
