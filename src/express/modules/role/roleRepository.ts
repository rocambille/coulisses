/*
  Purpose:
  Centralize all persistence logic related to Role entities.
*/

import databaseClient, {
  type Result,
  type Rows,
} from "../../../database/client";

class RoleRepository {
  async create(
    playId: number,
    role: Omit<Role, "id" | "play_id">,
    sceneIds: number[] = [],
  ) {
    // We need to insert the role and then the associations in scene_role
    const [result] = await databaseClient.query<Result>(
      `insert into role (play_id, name, description) values (?, ?, ?)`,
      [playId, role.name, role.description],
    );

    const roleId = result.insertId;

    if (sceneIds.length > 0) {
      // Build multiple insert values: (?, ?), (?, ?)
      const placeholders = sceneIds.map(() => "(?, ?)").join(", ");
      const values = sceneIds.flatMap((sceneId) => [sceneId, roleId]);

      await databaseClient.query(
        `insert ignore into scene_role (scene_id, role_id) values ${placeholders}`,
        values,
      );
    }

    return roleId;
  }

  async findByPlay(play: Play): Promise<Role[]> {
    // Fetch all roles for a play, and aggregate their scene_ids
    const [rows] = await databaseClient.query<Rows>(
      `select r.id, r.name, r.description, r.play_id,
       json_arrayagg(sr.scene_id) as sceneIds
       from role r
       left join scene_role sr on r.id = sr.role_id
       where r.play_id = ?
       group by r.id`,
      [play.id],
    );

    return rows.map<{
      id: number;
      name: string;
      description: string | null;
      play_id: number;
      sceneIds: number[];
    }>(({ id, name, description, play_id, sceneIds }) => ({
      id,
      name,
      description,
      play_id,
      sceneIds,
    }));
  }
}

export default new RoleRepository();
