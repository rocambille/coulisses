/*
  Purpose:
  Centralize persistent logic for Casting and the Dashboard Matrix.
*/

import databaseClient, {
  type Result,
  type Rows,
} from "../../../database/client";

class CastingRepository {
  async assignRole(userId: number, roleId: number) {
    // MySQL UPSERT to keep only one official casting per user/role pair
    const [result] = await databaseClient.query<Result>(
      `insert into casting (role_id, user_id) 
       values (?, ?)
       on duplicate key update user_id = ?`,
      [roleId, userId, userId],
    );

    return result.affectedRows;
  }

  async unassignRole(userId: number, roleId: number) {
    const [result] = await databaseClient.query<Result>(
      `delete from casting where user_id = ? and role_id = ?`,
      [userId, roleId],
    );

    return result.affectedRows;
  }

  async getPlayCastingMatrix(playId: number) {
    // This is the aggregated endpoint returning Scenes, Roles, Castings, and Preferences
    // To avoid massive unstructured JSON from MySQL, let's fetch individual sets and assemble them.

    const [scenes] = await databaseClient.query<Rows>(
      `select *
      from scene
      where play_id = ?
      order by scene_order asc`,
      [playId],
    );

    const [roles] = await databaseClient.query<Rows>(
      `select r.*, json_arrayagg(sr.scene_id) as scene_ids, c.user_id as user_id
      from role r
      join scene_role sr on r.id = sr.role_id
      left join casting c on r.id = c.role_id
      where r.play_id = ?
      group by r.id`,
      [playId],
    );

    const matrix: CastingMatrix = {
      scenes: scenes.map<Scene>((scene) => ({
        id: scene.id,
        title: scene.title,
        description: scene.description,
        scene_order: scene.scene_order,
        play_id: scene.play_id,
        duration: scene.duration,
        is_active: scene.is_active,
      })),
      roles: roles.map<CastingMatrix["roles"][number]>((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        play_id: role.play_id,
        scene_ids: role.scene_ids,
        user_id: role.user_id,
      })),
    };

    return matrix;
  }
}

export default new CastingRepository();
