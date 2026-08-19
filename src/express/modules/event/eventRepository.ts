/*
  Purpose:
  Persistent logic for Events.
*/

import database from "../../../database";
import {
  type EventDTOWithId,
  type EventDTOWithTroupeAndOwnerId,
  type EventPresenceDTOWithEventAndUserIds,
  EventSchema,
} from "./eventSchemas";

class EventRepository {
  create(event: EventDTOWithTroupeAndOwnerId): EventData["id"] {
    const result = database
      .prepare(
        `insert into event (troupe_id, owner_id, type, title, description, location, start_time, end_time) 
         values (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        event.troupe_id,
        event.owner_id,
        event.type,
        event.title,
        event.description,
        event.location,
        event.start_time,
        event.end_time,
      );

    return Number(result.lastInsertRowid);
  }

  find(eventId: EventData["id"]): EventData | null {
    const row = database
      .prepare(`select * from event where id = ?`)
      .get(eventId);

    return row ? EventSchema.parse(row) : null;
  }

  findByTroupe(troupeId: Troupe["id"]): EventData[] {
    const rows = database
      .prepare(
        `select * from event where troupe_id = ? order by start_time asc`,
      )
      .all(troupeId);

    return rows.map((row) => EventSchema.parse(row));
  }

  update(event: EventDTOWithId): boolean {
    const query = `update event 
                   set type = ?, 
                       title = ?, 
                       description = ?, 
                       location = ?, 
                       start_time = ?, 
                       end_time = ? 
                   where id = ?`;

    const result = database
      .prepare(query)
      .run(
        event.type,
        event.title,
        event.description,
        event.location,
        event.start_time,
        event.end_time,
        event.id,
      );

    return result.changes > 0;
  }

  destroy(eventId: EventData["id"]): boolean {
    const result = database
      .prepare(`delete from event where id = ?`)
      .run(eventId);
    return result.changes > 0;
  }

  setPresence({
    id,
    user_id,
    status,
  }: EventPresenceDTOWithEventAndUserIds): boolean {
    const result = database
      .prepare(
        `insert into event_presence (event_id, user_id, status)
         values (?, ?, ?)
         on conflict(event_id, user_id) do update set status = excluded.status`,
      )
      .run(id, user_id, status);

    return result.changes > 0;
  }
}

export default new EventRepository();
