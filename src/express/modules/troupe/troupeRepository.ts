/*
  Purpose:
  Centralize all persistence logic related to Troupe entities.
*/
import { z } from "zod";

import database from "../../../database";
import { userShape } from "../user/userRepository";

const troupeSchema: z.ZodType<Troupe> = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  external_discussion_link: z.string(),
  created_at: z.string(),
});

const troupeMemberSchema: z.ZodType<TroupeMember> = z.object({
  troupe_id: z.number(),
  role: z.enum(["ADMIN", "ACTOR"]),
  joined_at: z.string(),
  ...userShape,
});

class TroupeRepository {
  create(troupe: Omit<Troupe, "id" | "created_at">, creatorId: RowId): RowId {
    /* use transaction to insert troupe and add creator as member */
    database.exec("BEGIN");

    try {
      const result = database
        .prepare(
          `insert into troupe (name, description, external_discussion_link)
         values (?, ?, ?)`,
        )
        .run(troupe.name, troupe.description, troupe.external_discussion_link);

      this.addMember(result.lastInsertRowid, creatorId, "ADMIN");

      database.exec("COMMIT");
      return result.lastInsertRowid;
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  }

  find(byId: RowId): Troupe | null {
    const row = database.prepare(`select * from troupe where id = ?`).get(byId);

    return row ? troupeSchema.parse(row) : null;
  }

  findByUser(user: User): Troupe[] {
    const rows = database
      .prepare(
        `select t.* from troupe t
         join troupe_member tm on t.id = tm.troupe_id
         where tm.user_id = ?`,
      )
      .all(user.id);

    return rows.map((row) => troupeSchema.parse(row));
  }

  // --- Members ---

  addMember(troupeId: RowId, userId: RowId, role: "ADMIN" | "ACTOR"): RowId {
    // Insert or IGNORE to avoid errors if they are already in the troupe
    const result = database
      .prepare(
        "insert or ignore into troupe_member (troupe_id, user_id, role) values (?, ?, ?)",
      )
      .run(troupeId, userId, role);
    return result.lastInsertRowid;
  }

  updateMember(
    troupeId: RowId,
    userId: RowId,
    role: "ADMIN" | "ACTOR",
  ): boolean {
    const result = database
      .prepare(
        "update troupe_member set role = ? where troupe_id = ? and user_id = ?",
      )
      .run(role, troupeId, userId);

    return result.changes > 0;
  }

  removeMember(troupeId: RowId, userId: RowId): boolean {
    const result = database
      .prepare("delete from troupe_member where troupe_id = ? and user_id = ?")
      .run(troupeId, userId);
    return result.changes > 0;
  }

  getMembers(troupeId: RowId): TroupeMember[] {
    const rows = database
      .prepare(
        `select tm.troupe_id, tm.role, tm.joined_at, u.id, u.email, u.name, u.created_at, u.deleted_at
         from user u
         join troupe_member tm on u.id = tm.user_id
         where tm.troupe_id = ?`,
      )
      .all(troupeId);

    return rows.map((row) => troupeMemberSchema.parse(row));
  }

  findMember(
    troupeId: RowId,
    userId: RowId,
  ): { role: "ADMIN" | "ACTOR" } | null {
    const row = database
      .prepare(
        "select role from troupe_member where troupe_id = ? and user_id = ?",
      )
      .get(troupeId, userId);

    if (row == null) {
      return null;
    }

    return {
      role: row.role === "ADMIN" ? "ADMIN" : "ACTOR",
    };
  }
}

export default new TroupeRepository();
