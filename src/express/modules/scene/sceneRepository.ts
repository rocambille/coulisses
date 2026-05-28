/*
  Purpose:
  Centralize all persistence logic related to Scene entities.
*/

import database from "../../../database";

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

    if (row == null) return null;

    const {
      id,
      title,
      description,
      cut_notes,
      play_id,
      duration_estimated_seconds,
      order_in_play,
      is_active,
    } = row;

    return {
      id: Number(id),
      title: String(title),
      description: String(description),
      cut_notes: String(cut_notes),
      play_id: Number(play_id),
      order_in_play: Number(order_in_play),
      duration_estimated_seconds: Number(duration_estimated_seconds),
      is_active: Boolean(is_active),
    };
  }

  findByPlay(playId: RowId): Scene[] {
    const rows = database
      .prepare(
        "select * from scene where play_id = ? order by order_in_play asc",
      )
      .all(playId);

    return rows.map<Scene>(
      ({
        id,
        title,
        description,
        cut_notes,
        play_id,
        duration_estimated_seconds,
        order_in_play,
        is_active,
      }) => ({
        id: Number(id),
        title: String(title),
        description: String(description),
        cut_notes: String(cut_notes),
        play_id: Number(play_id),
        order_in_play: Number(order_in_play),
        duration_estimated_seconds: Number(duration_estimated_seconds),
        is_active: Boolean(is_active),
      }),
    );
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
        scene.is_active ? 1 : 0,
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
