/*
  Purpose:
  Centralize all persistence logic related to Role entities.
*/

import database from "../../../database";

class RoleRepository {
  create(
    playId: number | bigint,
    role: Omit<Role, "id" | "play_id">,
    sceneIds: number[] = [],
  ): number | bigint {
    // We need to insert the role and then the associations in role_scene
    const result = database
      .prepare(`insert into role (play_id, name, description) values (?, ?, ?)`)
      .run(playId, role.name, role.description ?? null);

    const roleId = result.lastInsertRowid;

    if (sceneIds.length > 0) {
      // Build multiple insert values: (?, ?), (?, ?)
      const placeholders = sceneIds.map(() => "(?, ?)").join(", ");
      const values = sceneIds.flatMap((sceneId) => [sceneId, roleId]);

      database
        .prepare(
          `insert or ignore into role_scene (scene_id, role_id) values ${placeholders}`,
        )
        .run(...values);
    }

    return roleId;
  }

  findByPlay(play: Play): Role[] {
    // Fetch all roles for a play, and aggregate their scene_ids
    const rows = database
      .prepare(
        `select r.id, r.name, r.description, r.play_id,
       json_group_array(json_object('id', s.id, 'title', s.title, 'description', s.description, 'duration', s.duration, 'play_id', s.play_id, 'scene_order', s.scene_order, 'is_active', s.is_active)) as scenes
       from role r
       left join role_scene rs on r.id = rs.role_id
       left join scene s on rs.scene_id = s.id
       where r.play_id = ?
       group by r.id`,
      )
      .all(play.id);

    return rows.map<RoleWithScenes>(
      ({ id, name, description, play_id, scenes }) => {
        const role: RoleWithScenes = {
          id: Number(id),
          name: String(name),
          play_id: Number(play_id),
          scenes:
            typeof scenes === "string"
              ? JSON.parse(scenes).map((s: Scene) => ({
                  id: Number(s.id),
                  title: String(s.title),
                  description: String(s.description),
                  duration: Number(s.duration),
                  play_id: Number(s.play_id),
                  scene_order: Number(s.scene_order),
                  is_active: Boolean(s.is_active),
                }))
              : [],
        };
        if (description != null) role.description = String(description);
        return role;
      },
    );
  }
}

export default new RoleRepository();
