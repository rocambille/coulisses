/*
  Purpose:
  Centralize all persistence logic related to Item entities.

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

/* ************************************************************************ */
/* Repository                                                               */
/* ************************************************************************ */

class ItemRepository {
  /* ********************************************************************** */
  /* Create                                                                 */
  /* ********************************************************************** */

  /*
    Insert a new item.

    Contract:
    - Expects a complete Item payload without `id`
    - Returns the newly generated primary key

    Notes:
    - No validation here (done earlier in the pipeline)
    - Assumes referential integrity (user_id exists)
  */
  create(item: Omit<Item, "id">): number | bigint {
    const query = database.prepare(
      "insert into item (title, user_id) values (?, ?)",
    );

    const result = query.run(item.title, item.user_id);

    return result.lastInsertRowid;
  }

  /* ********************************************************************** */
  /* Read                                                                   */
  /* ********************************************************************** */

  /*
    Find a single item by id.

    Behavior:
    - Ignores soft-deleted rows (`deleted_at is null`)
    - Returns `null` when no matching item exists

    Why null instead of throwing:
    - Allows upper layers to decide HTTP semantics (404, 204, etc.)
  */
  find(byId: number): Item | null {
    const query = database.prepare(
      "select id, title, user_id from item where id = ? and deleted_at is null",
    );

    const row = query.get(byId);

    if (row == null) {
      return null;
    }

    const { id, title, user_id } = row;

    return { id: Number(id), title: String(title), user_id: Number(user_id) };
  }

  /*
    Find all non-deleted items.

    Notes:
    - Meant to be composed or extended if needed
  */
  findAll(limit: number, offset: number): Item[] {
    const query = database.prepare(
      "select id, title, user_id from item where deleted_at is null limit ? offset ?",
    );
    const rows = query.all(limit, offset);

    return rows.map<Item>(({ id, title, user_id }) => ({
      id: Number(id),
      title: String(title),
      user_id: Number(user_id),
    }));
  }

  /* ********************************************************************** */
  /* Update                                                                 */
  /* ********************************************************************** */

  /*
    Update an existing item.

    Contract:
    - Returns the number of affected rows
    - Does not check existence beforehand

    Why:
    - Allows callers to decide how to interpret "0 rows affected"
  */
  update(id: number, item: Omit<Item, "id">): number | bigint {
    const query = database.prepare(
      "update item set title = ?, user_id = ? where id = ? and deleted_at is null",
    );
    const result = query.run(item.title, item.user_id, id);

    return result.changes;
  }

  /* ********************************************************************** */
  /* Delete (soft & hard)                                                   */
  /* ********************************************************************** */

  /*
    Soft delete an item.

    Semantics:
    - Marks the row as deleted without removing it
    - Default find queries automatically ignore it
  */
  softDelete(id: number): number | bigint {
    const query = database.prepare(
      "update item set deleted_at = datetime('now') where id = ?",
    );
    const result = query.run(id);

    return result.changes;
  }

  /*
    Restore a soft-deleted item.
  */
  softUndelete(id: number): number | bigint {
    const query = database.prepare(
      "update item set deleted_at = null where id = ?",
    );
    const result = query.run(id);

    return result.changes;
  }

  /*
    Hard delete an item.

    Warning:
    - This permanently removes the row
  */
  hardDelete(id: number): number | bigint {
    const query = database.prepare("delete from item where id = ?");
    const result = query.run(id);

    return result.changes;
  }
}

/* ************************************************************************ */
/* Export                                                                   */
/* ************************************************************************ */

export default new ItemRepository();
