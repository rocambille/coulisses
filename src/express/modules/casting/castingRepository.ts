/*
  Purpose:
  Centralize persistent logic for Casting and the Dashboard Matrix.
*/

import database from "../../../database";

class CastingRepository {
  assignRole(userId: number | bigint, roleId: number | bigint): boolean {
    // SQLite UPSERT to keep only one official casting per user/role pair
    const result = database
      .prepare(
        `insert into casting (role_id, user_id)
       values (?, ?)
       on conflict(role_id) do update set user_id = ?`,
      )
      .run(roleId, userId, userId);

    return result.changes === 1;
  }

  unassignRole(userId: number | bigint, roleId: number | bigint): boolean {
    const result = database
      .prepare(`delete from casting where user_id = ? and role_id = ?`)
      .run(userId, roleId);

    return result.changes === 1;
  }

  getPlayCastingMatrix(playId: number | bigint): CastingMatrix {
    // This is the aggregated endpoint returning Scenes, Roles, Castings, and Preferences
    // To avoid massive unstructured JSON from SQLite, let's fetch individual sets and assemble them.

    const scenes = database
      .prepare(
        `select *
      from scene
      where play_id = ?
      order by scene_order asc`,
      )
      .all(playId);

    const roles = database
      .prepare(
        `select r.*, json_group_array(rs.scene_id) as scene_ids, c.user_id as user_id
      from role r
      join role_scene rs on r.id = rs.role_id
      left join casting c on r.id = c.role_id
      where r.play_id = ?
      group by r.id`,
      )
      .all(playId);

    const matrix: CastingMatrix = {
      scenes: scenes.map<Scene>((scene) => ({
        id: Number(scene.id),
        title: String(scene.title),
        description: String(scene.description),
        scene_order: Number(scene.scene_order),
        play_id: Number(scene.play_id),
        duration: Number(scene.duration),
        is_active: Boolean(scene.is_active),
      })),
      roles: roles.map<CastingMatrix["roles"][number]>((role) => ({
        id: Number(role.id),
        name: String(role.name),
        description: String(role.description),
        play_id: Number(role.play_id),
        scene_ids:
          typeof role.scene_ids === "string" ? JSON.parse(role.scene_ids) : [],
        user_id: role.user_id != null ? Number(role.user_id) : null,
      })),
    };

    return matrix;
  }
}

export default new CastingRepository();
