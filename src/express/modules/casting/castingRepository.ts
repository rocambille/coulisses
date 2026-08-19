/*
  Purpose:
  Centralize persistent logic for Casting and the Dashboard Matrix.
*/

import database from "../../../database";
import { type CastingDTO, CastingMatrixSchema } from "./castingSchemas";

class CastingRepository {
  assignRole(casting: CastingDTO): boolean {
    const result = database
      .prepare(
        `insert into casting (scene_id, role_id, user_id)
         values (?, ?, ?)
         on conflict(scene_id, role_id) do update set user_id = excluded.user_id`,
      )
      .run(casting.scene_id, casting.role_id, casting.user_id);

    return result.changes > 0;
  }

  unassignRole(casting: CastingDTO): boolean {
    const result = database
      .prepare(
        `delete from casting where scene_id = ? and role_id = ? and user_id = ?`,
      )
      .run(casting.scene_id, casting.role_id, casting.user_id);

    return result.changes > 0;
  }

  getPlayCastingMatrix(playId: Play["id"]): CastingMatrix {
    const actors = database
      .prepare(
        `select u.*
         from user u
         join troupe_member tm on u.id = tm.user_id
         join play p on p.troupe_id = tm.troupe_id
         where p.id = ?`,
      )
      .all(playId);

    const scenesWithRolesAndCastings = database
      .prepare(
        `select s.*,
         json_group_array(
           json_object(
             'id',
             r.id,
             'name',
             r.name,
             'description',
             r.description,
             'play_id',
             r.play_id,
             'preferences',
             (
               select json_group_array(
                 json_object(
                   'user_id',
                   rp.user_id,
                   'level',
                   rp.level,
                   'created_at',
                   rp.created_at,
                   'role_id',
                   rp.role_id,
                   'scene_id',
                   rp.scene_id
                 )
               )
               from role_preference rp
               where rp.role_id = r.id and rp.scene_id = s.id
             ),
             'assigned_user',
             (
               select json_object(
                 'id',
                 u.id,
                 'name',
                 u.name,
                 'email',
                 u.email,
                 'avatar_url',
                 u.avatar_url,
                 'created_at',
                 u.created_at,
                 'deleted_at',
                 u.deleted_at
               )
               from user u
               join casting c on u.id = c.user_id
               where c.role_id = r.id and c.scene_id = s.id
             )
           )
         ) as roles
         from scene s
         join role r on r.play_id = s.play_id
         where s.play_id = ?
         group by s.id
         order by s.order_in_play asc`,
      )
      .all(playId);

    return CastingMatrixSchema.parse({
      actors,
      scenes: scenesWithRolesAndCastings.map((s) => ({
        ...s,
        roles: JSON.parse(String(s.roles)),
      })),
    });
  }
}

export default new CastingRepository();
