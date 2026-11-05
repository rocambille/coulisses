/*
  Purpose:
  Centralize all persistence logic related to User entities.

  This repository:
  - Is the single place that knows SQL details
  - Exposes a minimal, explicit CRUD interface
  - Enforces soft-deletion rules at the data-access level

  What this file intentionally does NOT do:
  - No authorization checks
  - No HTTP concerns
  - No business rules beyond persistence semantics

  Design notes:
  - Controllers and services rely on repository contracts
  - SQL queries are explicit (no ORM, no magic)
  - Soft delete is the default find behavior
*/

import database from "../../../database";
import { type UserDTO, UserSchema } from "./userSchemas";

/* ************************************************************************ */
/* Repository                                                               */
/* ************************************************************************ */

class UserRepository {
  /* ********************************************************************** */
  /* Create                                                                 */
  /* ********************************************************************** */

  /*
    Insert a new user.

    Contract:
    - Expects a complete User payload without `id`
    - Returns the newly generated primary key

    Notes:
    - No validation here (done earlier in the pipeline)
    - Assumes referential integrity (user_id exists)
  */
  create(user: UserDTO): User["id"] {
    const query = database.prepare(
      "insert into user (email, name) values (?, ?)",
    );
    const result = query.run(user.email, user.name);

    return Number(result.lastInsertRowid);
  }

  /* ********************************************************************** */
  /* Read                                                                   */
  /* ********************************************************************** */

  /*
    Find a single user by id.

    Behavior:
    - Ignores soft-deleted rows (`deleted_at is null`)
    - Returns `null` when no matching user exists

    Why null instead of throwing:
    - Allows upper layers to decide HTTP semantics (404, 204, etc.)
  */
  find(id: User["id"]): User | null {
    const query = database.prepare(
      "select id, email, name, avatar_url, created_at, deleted_at from user where id = ? and deleted_at is null",
    );
    const row = query.get(id);

    return row ? UserSchema.parse(row) : null;
  }

  /*
    Find a single user by email.

    Behavior:
    - Ignores soft-deleted rows (`deleted_at is null`)
    - Returns `null` when no matching user exists
    - Returns matching user when exists

    Why null instead of throwing:
    - Allows upper layers to decide HTTP semantics (404, 204, etc.)
  */
  findByEmail(email: string): User | null {
    const query = database.prepare(
      "select id, email, name, avatar_url, created_at, deleted_at from user where email = ? and deleted_at is null",
    );
    const row = query.get(email);

    return row ? UserSchema.parse(row) : null;
  }

  /*
    Find a single user by email or create a new one.

    Behavior:
    - Ignores soft-deleted rows (`deleted_at is null`)
    - Returns `null` when no matching user exists

    Why null instead of throwing:
    - Allows upper layers to decide HTTP semantics (404, 204, etc.)
  */
  findByEmailOrCreate(email: string): User["id"] {
    const user = this.findByEmail(email);
    if (user) return user.id;

    const name = email.split("@")[0];

    return this.create({
      email,
      name,
    });
  }

  /*
    Find a user along with the version of their sessions.

    Behavior:
    - Ignores soft-deleted rows (`deleted_at is null`)
  */
  findWithSessionVersion(
    id: User["id"],
  ): { user: User; sessionVersion: number } | null {
    const row = database
      .prepare(
        "select id, email, name, avatar_url, created_at, deleted_at, session_version from user where id = ? and deleted_at is null",
      )
      .get(id);

    if (row == null) {
      return null;
    }

    return {
      user: UserSchema.parse(row),
      sessionVersion: Number(row.session_version),
    };
  }

  /* ********************************************************************** */
  /* Update                                                                 */
  /* ********************************************************************** */

  /*
    Update the name of a user.

    Notes:
    - The email has its own method: it is the only way to log in, so it
      only changes once the new address is confirmed (see userActions)
  */
  updateName(id: User["id"], name: User["name"]): boolean {
    const query = database.prepare(
      "update user set name = ? where id = ? and deleted_at is null",
    );
    const result = query.run(name, id);

    return result.changes > 0;
  }

  updateEmail(id: User["id"], email: User["email"]): boolean {
    const query = database.prepare(
      "update user set email = ? where id = ? and deleted_at is null",
    );
    const result = query.run(email, id);

    return result.changes > 0;
  }

  /*
    Invalidate every session of a user (see authActions.verifyAccessToken).
  */
  bumpSessionVersion(id: User["id"]): boolean {
    const query = database.prepare(
      "update user set session_version = session_version + 1 where id = ?",
    );
    const result = query.run(id);

    return result.changes > 0;
  }

  /*
    Update user avatar URL.
  */
  updateAvatar(id: User["id"], avatarUrl: string | null): boolean {
    const query = database.prepare(
      "update user set avatar_url = ? where id = ? and deleted_at is null",
    );
    const result = query.run(avatarUrl, id);

    return result.changes > 0;
  }

  /* ********************************************************************** */
  /* Delete (soft & hard)                                                   */
  /* ********************************************************************** */

  /*
    Soft delete a user.

    Semantics:
    - Marks the row as deleted without removing it
    - Default find queries automatically ignore it
    - Erases personal data: the row stays for the votes and castings that
      reference it, but it no longer identifies anyone
    - Releases the email (replaced by a unique placeholder): user.email is
      unique, and find queries ignore deleted rows, so keeping it would
      make any new sign-up with the same address fail
  */
  softDelete(id: User["id"]): boolean {
    const query = database.prepare(`
      update user
      set email = 'deleted-' || id || '@deleted.invalid',
          name = 'Compte supprimé',
          avatar_url = null,
          deleted_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
      where id = ?
    `);
    const result = query.run(id);

    return result.changes > 0;
  }
}

/* ************************************************************************ */
/* Export                                                                   */
/* ************************************************************************ */

export default new UserRepository();
