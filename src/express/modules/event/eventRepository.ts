/*
  Purpose:
  Persistent logic for Events.
*/

import database from "../../../database";

const mapRawTypeToEventType = (type: string): EventType => {
  switch (type) {
    case "COURSE":
      return "COURSE";
    case "REHEARSAL":
      return "REHEARSAL";
    case "SHOW":
      return "SHOW";
    case "OTHER":
      return "OTHER";
    default:
      throw new Error(`Invalid event type: ${type}`);
  }
};

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

    return result.lastInsertRowid;
  }

  find(eventId: RowId): EventData | null {
    const row = database
      .prepare(`select * from event where id = ?`)
      .get(eventId);

    if (row == null) return null;

    const {
      id,
      troupe_id,
      owner_id,
      type,
      title,
      description,
      location,
      start_time,
      end_time,
    } = row;

    return {
      id: Number(id),
      troupe_id: Number(troupe_id),
      owner_id: Number(owner_id),
      type: mapRawTypeToEventType(String(type)),
      title: String(title),
      description: String(description),
      location: String(location),
      start_time: String(start_time),
      end_time: String(end_time),
    };
  }

  findByTroupe(troupeId: RowId): EventData[] {
    const rows = database
      .prepare(
        `select * from event where troupe_id = ? order by start_time asc`,
      )
      .all(troupeId);

    return rows.map<EventData>(
      ({
        id,
        troupe_id,
        owner_id,
        type,
        title,
        description,
        location,
        start_time,
        end_time,
      }) => ({
        id: Number(id),
        troupe_id: Number(troupe_id),
        owner_id: Number(owner_id),
        type: mapRawTypeToEventType(String(type)),
        title: String(title),
        description: String(description),
        location: String(location),
        start_time: String(start_time),
        end_time: String(end_time),
      }),
    );
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
