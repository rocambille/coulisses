/*
  Purpose:
  Persistent logic for Events.
*/

import { z } from "zod";
import database from "../../../database";

const eventShape = {
  id: z.number(),
  troupe_id: z.number(),
  owner_id: z.number(),
  type: z.enum(["COURSE", "REHEARSAL", "SHOW", "OTHER"]),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  start_time: z.string(),
  end_time: z.string(),
};

const eventSchema: z.ZodType<EventData> = z.object(eventShape);

class EventRepository {
  create(
    troupeId: RowId,
    ownerId: RowId,
    event: Omit<EventData, "id" | "troupe_id" | "owner_id">,
  ): RowId {
    const result = database
      .prepare(
        `insert into event (troupe_id, owner_id, type, title, description, location, start_time, end_time) 
         values (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        troupeId,
        ownerId,
        event.type,
        event.title,
        event.description,
        event.location,
        event.start_time,
        event.end_time,
      );

    return Number(result.lastInsertRowid);
  }

  find(eventId: RowId): EventData | null {
    const row = database
      .prepare(`select * from event where id = ?`)
      .get(eventId);

    return row ? eventSchema.parse(row) : null;
  }

  findByTroupe(troupeId: RowId): EventData[] {
    const rows = database
      .prepare(
        `select * from event where troupe_id = ? order by start_time asc`,
      )
      .all(troupeId);

    return rows.map((row) => eventSchema.parse(row));
  }

  update(
    eventId: RowId,
    event: Omit<EventData, "id" | "troupe_id" | "owner_id">,
  ): boolean {
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
        eventId,
      );

    return result.changes > 0;
  }

  destroy(eventId: RowId): boolean {
    const result = database
      .prepare(`delete from event where id = ?`)
      .run(eventId);
    return result.changes > 0;
  }

  setPresence(
    eventId: RowId,
    userId: RowId,
    status: "PRESENT" | "ABSENT",
  ): boolean {
    const result = database
      .prepare(
        `insert into event_presence (event_id, user_id, status)
         values (?, ?, ?)
         on conflict(event_id, user_id) do update set status = excluded.status`,
      )
      .run(eventId, userId, status);

    return result.changes > 0;
  }
}

export default new EventRepository();
