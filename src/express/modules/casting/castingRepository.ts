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
    // In our model, a role could have multiple actors? `casting` has `user_id` and `role_id`
    // "Le professeur assigne officiellement un rôle à un comédien"
    const [result] = await databaseClient.query<Result>(
      `insert into casting (user_id, role_id) 
       values (?, ?)
       on duplicate key update assigned_at = current_timestamp`,
      [userId, roleId],
    );

    return result.affectedRows;
  }

  async removeRole(userId: number, roleId: number) {
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
      "select * from scene where play_id = ? order by order_num asc",
      [playId],
    );

    const [roles] = await databaseClient.query<Rows>(
      "select id, name, description from role where play_id = ?",
      [playId],
    );

    // Get Scene-Role relations
    const [sceneRoles] = await databaseClient.query<Rows>(
      `select sr.scene_id, sr.role_id 
       from scene_role sr 
       join role r on sr.role_id = r.id 
       where r.play_id = ?`,
      [playId],
    );

    // Get Official Casting
    const [castings] = await databaseClient.query<Rows>(
      `select c.id, c.user_id, c.role_id, c.assigned_at 
       from casting c 
       join role r on c.role_id = r.id 
       where r.play_id = ?`,
      [playId],
    );

    // Get Preferences for scenes of this play
    const [preferences] = await databaseClient.query<Rows>(
      `select p.id, p.user_id, p.scene_id, p.level 
       from preference p 
       join scene s on p.scene_id = s.id 
       where s.play_id = ?`,
      [playId],
    );

    return {
      scenes,
      roles,
      sceneRoles,
      castings,
      preferences,
    };
  }
}

export default new CastingRepository();
