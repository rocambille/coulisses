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
      "select * from scene where play_id = ? order by scene_order asc",
      [playId],
    );

    const [roles] = await databaseClient.query<Rows>(
      "select * from role where play_id = ?",
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
      `select c.* 
       from casting c 
       join role r on c.role_id = r.id 
       where r.play_id = ?`,
      [playId],
    );

    // Get Preferences for scenes of this play
    const [preferences] = await databaseClient.query<Rows>(
      `select p.* 
       from preference p 
       join scene s on p.scene_id = s.id 
       where s.play_id = ?`,
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
      roles: roles.map<Role>((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        play_id: role.play_id,
      })),
      sceneRoles: sceneRoles.map<{
        scene_id: number;
        role_id: number;
      }>((sceneRole) => ({
        scene_id: sceneRole.scene_id,
        role_id: sceneRole.role_id,
      })),
      castings: castings.map<Casting>((casting) => ({
        user_id: casting.user_id,
        role_id: casting.role_id,
        assigned_at: casting.assigned_at,
      })),
      preferences: preferences.map<Preference>((preference) => ({
        id: preference.id,
        user_id: preference.user_id,
        scene_id: preference.scene_id,
        level: preference.level,
      })),
    };

    return matrix;
  }
}

export default new CastingRepository();
