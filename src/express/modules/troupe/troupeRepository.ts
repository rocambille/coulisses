/*
  Purpose:
  Centralize all persistence logic related to Troupe entities.
*/

import database from "../../../database";

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

    if (row == null) {
      return null;
    }

    const { id, name, description, external_discussion_link, created_at } = row;

    return {
      id: Number(id),
      name: String(name),
      description: String(description),
      external_discussion_link: String(external_discussion_link),
      created_at: String(created_at),
    };
  }

  findByUser(user: User): Troupe[] {
    const rows = database
      .prepare(
        `select t.* from troupe t
         join troupe_member tm on t.id = tm.troupe_id
         where tm.user_id = ?`,
      )
      .all(user.id);

    return rows.map<Troupe>(
      ({ id, name, description, external_discussion_link, created_at }) => ({
        id: Number(id),
        name: String(name),
        description: String(description),
        external_discussion_link: String(external_discussion_link),
        created_at: String(created_at),
      }),
    );
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

    return rows.map<TroupeMember>(
      ({
        troupe_id,
        role,
        joined_at,
        id,
        email,
        name,
        created_at,
        deleted_at,
      }) => ({
        troupe_id: Number(troupe_id),
        role: role === "ADMIN" ? "ADMIN" : "ACTOR",
        joined_at: String(joined_at),
        id: Number(id),
        email: String(email),
        name: String(name),
        created_at: String(created_at),
        deleted_at: deleted_at != null ? String(deleted_at) : null,
      }),
    );
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
