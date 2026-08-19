/*
  Purpose:
  Centralize all persistence logic related to Troupe entities.
*/
import database from "../../../database";
import {
  type TroupeDTO,
  TroupeMemberSchema,
  TroupeSchema,
} from "./troupeSchemas";

class TroupeRepository {
  create(troupe: TroupeDTO, creatorId: User["id"]): Troupe["id"] {
    /* use transaction to insert troupe and add creator as member */
    database.exec("BEGIN");

    try {
      const result = database
        .prepare(
          `insert into troupe (name, description, external_discussion_link)
         values (?, ?, ?)`,
        )
        .run(troupe.name, troupe.description, troupe.external_discussion_link);

      const troupeId = Number(result.lastInsertRowid);

      this.addMember(troupeId, creatorId, "ADMIN");

      database.exec("COMMIT");

      return troupeId;
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  }

  find(id: Troupe["id"]): Troupe | null {
    const row = database.prepare(`select * from troupe where id = ?`).get(id);

    return row ? TroupeSchema.parse(row) : null;
  }

  findByUser(user: User): Troupe[] {
    const rows = database
      .prepare(
        `select t.* from troupe t
         join troupe_member tm on t.id = tm.troupe_id
         where tm.user_id = ?`,
      )
      .all(user.id);

    return rows.map((row) => TroupeSchema.parse(row));
  }

  // --- Members ---

  addMember(
    troupeId: Troupe["id"],
    userId: User["id"],
    role: "ADMIN" | "ACTOR",
  ): TroupeMember["id"] {
    // Insert or IGNORE to avoid errors if they are already in the troupe
    const result = database
      .prepare(
        "insert or ignore into troupe_member (troupe_id, user_id, role) values (?, ?, ?)",
      )
      .run(troupeId, userId, role);

    return Number(result.lastInsertRowid);
  }

  updateMember(
    troupeId: Troupe["id"],
    userId: User["id"],
    role: TroupeMember["role"],
  ): boolean {
    const result = database
      .prepare(
        "update troupe_member set role = ? where troupe_id = ? and user_id = ?",
      )
      .run(role, troupeId, userId);

    return result.changes > 0;
  }

  removeMember(troupeId: Troupe["id"], userId: User["id"]): boolean {
    const result = database
      .prepare("delete from troupe_member where troupe_id = ? and user_id = ?")
      .run(troupeId, userId);
    return result.changes > 0;
  }

  getMembers(troupeId: Troupe["id"]): TroupeMember[] {
    const rows = database
      .prepare(
        `select
           tm.troupe_id,
           tm.role,
           tm.joined_at,
           u.id,
           u.email,
           u.name,
           u.avatar_url,
           u.created_at,
           u.deleted_at
         from user u
         join troupe_member tm on u.id = tm.user_id
         where tm.troupe_id = ?`,
      )
      .all(troupeId);

    return rows.map((row) => TroupeMemberSchema.parse(row));
  }

  findMemberRole(
    troupeId: Troupe["id"],
    userId: User["id"],
  ): TroupeMember["role"] | null {
    const row = database
      .prepare(
        "select role from troupe_member where troupe_id = ? and user_id = ?",
      )
      .get(troupeId, userId);

    if (row == null) {
      return null;
    }

    return TroupeMemberSchema.pick({ role: true }).parse(row).role;
  }
}

export default new TroupeRepository();
