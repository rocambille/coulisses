/*
  Purpose:
  Centralize all persistence logic related to User entities.
*/

import databaseClient, {
  type Result,
  type Rows,
} from "../../../database/client";

class UserRepository {
  async create(user: Omit<User, "id">) {
    const [result] = await databaseClient.query<Result>(
      "insert into user (email, name) values (?, ?)",
      [user.email, user.name],
    );

    return result.insertId;
  }

  async read(byId: number): Promise<User | null> {
    const [rows] = await databaseClient.query<Rows>(
      "select id, email, name from user where id = ? and deleted_at is null",
      [byId],
    );

    if (rows[0] == null) return null;
    return rows[0] as User;
  }

  async readByEmail(byEmail: string): Promise<User | null> {
    const [rows] = await databaseClient.query<Rows>(
      "select id, email, name from user where email = ? and deleted_at is null",
      [byEmail],
    );

    if (rows[0] == null) return null;
    return rows[0] as User;
  }

  async readAll(limit: number, offset: number): Promise<User[]> {
    const [rows] = await databaseClient.query<Rows>(
      "select id, email, name from user where deleted_at is null limit ? offset ?",
      [limit, offset],
    );

    return rows as User[];
  }

  async update(id: number, user: Omit<User, "id">) {
    const [result] = await databaseClient.query<Result>(
      "update user set email = ?, name = ? where id = ? and deleted_at is null",
      [user.email, user.name, id],
    );

    return result.affectedRows;
  }

  async softDelete(id: number) {
    const [result] = await databaseClient.query<Result>(
      "update user set deleted_at = now() where id = ?",
      [id],
    );

    return result.affectedRows;
  }

  async softUndelete(id: number) {
    const [result] = await databaseClient.query<Result>(
      "update user set deleted_at = null where id = ?",
      [id],
    );

    return result.affectedRows;
  }

  async hardDelete(id: number) {
    const [result] = await databaseClient.query<Result>(
      "delete from user where id = ?",
      [id],
    );

    return result.affectedRows;
  }
}

export default new UserRepository();
