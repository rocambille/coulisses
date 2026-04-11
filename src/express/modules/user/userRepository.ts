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

  async find(byId: number): Promise<User | null> {
    const [rows] = await databaseClient.query<Rows>(
      "select id, email, name from user where id = ? and deleted_at is null",
      [byId],
    );

    if (rows[0] == null) return null;

    const { id, email, name } = rows[0];

    return { id, email, name };
  }

  async findByEmail(byEmail: string): Promise<User | null> {
    const [rows] = await databaseClient.query<Rows>(
      "select id, email, name from user where email = ? and deleted_at is null",
      [byEmail],
    );

    if (rows[0] == null) return null;

    const { id, email, name } = rows[0];

    return { id, email, name };
  }

  async findOrCreateByEmail(email: string, name?: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (user) return user;

    const id = await this.create({
      email,
      name: name ?? email.split("@")[0],
    });

    return { id, email, name: name ?? email.split("@")[0] };
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
