/*
  Purpose:
  Centralize all persistence logic related to Role entities.
*/
import { z } from "zod";

import database from "../../../database";
import { sceneShape } from "../scene/sceneRepository";

export const roleShape = {
  id: z.number(),
  name: z.string(),
  description: z.string(),
  play_id: z.number(),
};

const roleSchema: z.ZodType<Role> = z.object(roleShape);

const roleWithScenesSchema: z.ZodType<RoleWithScenes> = z.object({
  ...roleShape,
  scenes: z.preprocess(
    (val: string) => {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    },
    z.array(z.object(sceneShape)),
  ),
});

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
          `insert into role_scene (role_id, scene_id) values (?, ?)`,
        );
        for (const sceneId of sceneIds) {
          insertRoleScene.run(roleId, sceneId);
        }
      }

      database.exec("COMMIT");
      return Number(roleId);
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

    return rows.map((row) => roleWithScenesSchema.parse(row));
  }

  find(id: RowId): Role | null {
    const row = database.prepare("select * from role where id = ?").get(id);

    return row ? roleSchema.parse(row) : null;
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
