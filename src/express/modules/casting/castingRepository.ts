/*
  Purpose:
  Centralize persistent logic for Casting and the Dashboard Matrix.
*/

import { z } from "zod";
import database from "../../../database";

import { rolePreferenceShape } from "../preference/preferenceRepository";
import { roleShape } from "../role/roleRepository";
import { sceneShape } from "../scene/sceneRepository";
import { userShape } from "../user/userRepository";

const castingMatrixShape = {
  actors: z.array(z.object(userShape)),
  scenes: z.array(
    z.object({
      ...sceneShape,
      roles: z.array(
        z.object(roleShape).extend({
          assigned_user: z.object(userShape).nullable(),
          preferences: z.array(z.object(rolePreferenceShape)),
        }),
      ),
    }),
  ),
};

const castingMatrixSchema: z.ZodType<CastingMatrix> =
  z.object(castingMatrixShape);

class CastingRepository {
  assignRole(sceneId: RowId, roleId: RowId, userId: RowId): boolean {
    const result = database
      .prepare(
        `insert into casting (scene_id, role_id, user_id)
         values (?, ?, ?)
         on conflict(scene_id, role_id) do update set user_id = excluded.user_id`,
      )
      .run(sceneId, roleId, userId);

    return result.changes > 0;
  }

  unassignRole(sceneId: RowId, roleId: RowId, userId: RowId): boolean {
    const result = database
      .prepare(
        `delete from casting where scene_id = ? and role_id = ? and user_id = ?`,
      )
      .run(sceneId, roleId, userId);

    return result.changes > 0;
  }

  getPlayCastingMatrix(playId: RowId): CastingMatrix {
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

    return castingMatrixSchema.parse({
      actors,
      scenes: scenesWithRolesAndCastings.map((s) => ({
        ...s,
        roles: JSON.parse(String(s.roles)),
      })),
    });
  }
}

export default new CastingRepository();
