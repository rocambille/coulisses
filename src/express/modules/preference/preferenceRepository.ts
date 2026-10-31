/*
  Purpose:
  Centralize all persistence logic related to Preference entities.
*/

import database from "../../../database";
import {
  PlayPreferenceSchema,
  RolePreferenceSchema,
  ScenePreferenceSchema,
  VotingStatusSchema,
} from "./preferenceSchemas";

class PreferenceRepository {
  findAllForTroupe(troupeId: Troupe["id"]): {
    playPreferences: PlayPreference[];
    scenePreferences: ScenePreference[];
    rolePreferences: RolePreference[];
  } {
    const playRows = database
      .prepare(
        `select user_id, play_id, level, created_at 
         from play_preference
         join play on play.id = play_preference.play_id
         where troupe_id = ?`,
      )
      .all(troupeId);

    const sceneRows = database
      .prepare(
        `select user_id, scene_id, level, created_at
         from scene_preference
         join scene on scene.id = scene_preference.scene_id
         join play on play.id = scene.play_id
         where troupe_id = ?`,
      )
      .all(troupeId);

    const roleRows = database
      .prepare(
        `select user_id, scene_id, role_id, level, created_at
         from role_preference
         join scene on scene.id = role_preference.scene_id
         join play on play.id = scene.play_id
         where troupe_id = ?`,
      )
      .all(troupeId);

    return {
      playPreferences: playRows.map((row) => PlayPreferenceSchema.parse(row)),
      scenePreferences: sceneRows.map((row) =>
        ScenePreferenceSchema.parse(row),
      ),
      rolePreferences: roleRows.map((row) => RolePreferenceSchema.parse(row)),
    };
  }

  /*
    Votes are only tracked on active scenes, for members who still have an
    account: soft deleting a user keeps their troupe_member row.
  */
  findVotingStatus(playId: Play["id"]): VotingStatus {
    const scenes = database
      .prepare(
        `select id from scene
         where play_id = ? and is_active = 1
         order by order_in_play`,
      )
      .all(playId);

    const members = database
      .prepare(
        `select u.id, u.name, tm.role,
           (
             select json_group_array(sp.scene_id)
             from scene_preference sp
             join scene s on s.id = sp.scene_id
             where sp.user_id = u.id and s.play_id = p.id and s.is_active = 1
           ) as voted_scene_ids
         from play p
         join troupe_member tm on tm.troupe_id = p.troupe_id
         join user u on u.id = tm.user_id
         where p.id = ? and u.deleted_at is null
         order by u.name`,
      )
      .all(playId);

    return VotingStatusSchema.parse({
      active_scene_ids: scenes.map((scene) => scene.id),
      members: members.map((member) => ({
        ...member,
        voted_scene_ids: JSON.parse(String(member.voted_scene_ids)),
      })),
    });
  }

  hasVotedInPlay(userId: User["id"], playId: Play["id"]): boolean {
    const row = database
      .prepare(
        `select exists (
           select 1
           from scene_preference sp
           join scene s on s.id = sp.scene_id
           where sp.user_id = ? and s.play_id = ?
           union all
           select 1
           from role_preference rp
           join scene s on s.id = rp.scene_id
           where rp.user_id = ? and s.play_id = ?
         ) as has_voted`,
      )
      .get(userId, playId, userId, playId);

    return row?.has_voted === 1;
  }

  findIncompleteVoterIds(playId: Play["id"]): User["id"][] {
    const { active_scene_ids, members } = this.findVotingStatus(playId);

    return members
      .filter(
        (member) =>
          member.role === "ACTOR" &&
          member.voted_scene_ids.length < active_scene_ids.length,
      )
      .map((member) => member.id);
  }

  upsertPlayPreference(playPreference: PlayPreference): void {
    database
      .prepare(
        `insert into play_preference (user_id, play_id, level) 
         values (?, ?, ?) 
         on conflict(user_id, play_id) do update set level = excluded.level`,
      )
      .run(
        playPreference.user_id,
        playPreference.play_id,
        playPreference.level,
      );
  }

  upsertScenePreference(scenePreference: ScenePreference): void {
    database
      .prepare(
        `insert into scene_preference (user_id, scene_id, level) 
         values (?, ?, ?) 
         on conflict(user_id, scene_id) do update set level = excluded.level`,
      )
      .run(
        scenePreference.user_id,
        scenePreference.scene_id,
        scenePreference.level,
      );
  }

  upsertRolePreference(rolePreference: RolePreference): void {
    database
      .prepare(
        `insert into role_preference (user_id, scene_id, role_id, level) 
         values (?, ?, ?, ?) 
         on conflict(user_id, scene_id, role_id) do update set level = excluded.level`,
      )
      .run(
        rolePreference.user_id,
        rolePreference.scene_id,
        rolePreference.role_id,
        rolePreference.level,
      );
  }
}

export default new PreferenceRepository();
