/*
  Purpose:
  Centralize all persistence logic related to Role entities.
*/

import database from "../../../database";

class RoleRepository {
  create(
    playId: RowId,
    role: Omit<Role, "id" | "play_id">,
    sceneIds: RowId[] = [],
  ): RowId {
    database.exec("BEGIN");

    try {
      const result = database
        .prepare(
          `insert into role (play_id, name, description) values (?, ?, ?)`,
        )
        .run(playId, role.name, role.description);

      const roleId = result.lastInsertRowid;

      if (sceneIds.length > 0) {
        const insertRoleScene = database.prepare(
          `insert or ignore into role_scene (role_id, scene_id) values (?, ?)`,
        );
        for (const sceneId of sceneIds) {
          insertRoleScene.run(roleId, sceneId);
        }
      }

      database.exec("COMMIT");
      return roleId;
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  }

  findByPlay(playId: RowId): RoleWithScenes[] {
    const rows = database
      .prepare(
        `select r.id, r.name, r.description, r.play_id,
       json_group_array(
         json_object(
           'id', s.id, 
           'title', s.title, 
           'description', s.description, 
           'cut_notes', s.cut_notes,
           'duration_estimated_seconds', s.duration_estimated_seconds, 
           'play_id', s.play_id, 
           'order_in_play', s.order_in_play, 
           'is_active', s.is_active
         )
       ) as scenes
       from role r
       left join role_scene rs on r.id = rs.role_id
       left join scene s on rs.scene_id = s.id
       where r.play_id = ?
       group by r.id`,
      )
      .all(playId);

    return rows.map<RoleWithScenes>(
      ({ id, name, description, play_id, scenes }) => {
        const parsedScenes: Scene[] =
          typeof scenes === "string" ? JSON.parse(scenes) : [];
        const validScenes = parsedScenes.filter((s) => s.id !== null); // json_group_array can create an array with a single object full of nulls if no scenes exist

        return {
          id: Number(id),
          name: String(name),
          description: String(description),
          play_id: Number(play_id),
          scenes: validScenes.map<Scene>((s) => ({
            id: Number(s.id),
            title: String(s.title),
            description: String(s.description),
            cut_notes: String(s.cut_notes),
            duration_estimated_seconds: Number(s.duration_estimated_seconds),
            play_id: Number(s.play_id),
            order_in_play: Number(s.order_in_play),
            is_active: Boolean(s.is_active),
          })),
        };
      },
    );
  }

  find(byId: RowId): Role | null {
    const row = database.prepare("select * from role where id = ?").get(byId);

    if (row == null) return null;

    const { id, play_id, name, description } = row;

    return {
      id: Number(id),
      play_id: Number(play_id),
      name: String(name),
      description: String(description),
    };
  }

  linkScene(roleId: RowId, sceneId: RowId): void {
    database
      .prepare(
        `insert or ignore into role_scene (role_id, scene_id) values (?, ?)`,
      )
      .run(roleId, sceneId);
  }

  delete(roleId: RowId): void {
    database.prepare("delete from role where id = ?").run(roleId);
  }
}

export default new RoleRepository();
