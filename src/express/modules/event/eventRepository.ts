/*
  Purpose:
  Persistent logic for Events.
*/

import database from "../../../database";

const mapRawTypeToEventType = (type: string) => {
  switch (type) {
    case "SHOW":
      return "SHOW";
    case "FIXED_REHEARSAL":
      return "FIXED_REHEARSAL";
    case "AUTO_REHEARSAL":
      return "AUTO_REHEARSAL";
    default:
      throw new Error(`Invalid event type: ${type}`);
  }
};

class EventRepository {
  create(event: Omit<EventData, "id">): RowId {
    const result = database
      .prepare(
        `insert into event (play_id, type, title, description, location, start_time, end_time) 
       values (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        event.play_id,
        event.type,
        event.title,
        event.description ?? null,
        event.location ?? null,
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
      play_id,
      type,
      title,
      description,
      location,
      start_time,
      end_time,
    } = row;

    const eventData: EventData = {
      id: Number(id),
      play_id: Number(play_id),
      type: mapRawTypeToEventType(String(type)),
      title: String(title),
      start_time: String(start_time),
      end_time: String(end_time),
    };
    if (description != null) eventData.description = String(description);
    if (location != null) eventData.location = String(location);

    return eventData;
  }

  findByPlay(playId: RowId): EventData[] {
    const rows = database
      .prepare(`select * from event where play_id = ? order by start_time asc`)
      .all(playId);

    return rows.map<EventData>(
      ({
        id,
        play_id,
        type,
        title,
        description,
        location,
        start_time,
        end_time,
      }) => {
        const eventData: EventData = {
          id: Number(id),
          play_id: Number(play_id),
          type: mapRawTypeToEventType(String(type)),
          title: String(title),
          start_time: String(start_time),
          end_time: String(end_time),
        };
        if (description != null) eventData.description = String(description);
        if (location != null) eventData.location = String(location);
        return eventData;
      },
    );
  }

  update(eventId: RowId, event: Omit<EventData, "id" | "play_id">): boolean {
    const result = database
      .prepare(
        `update event set 
        type = ?, 
        title = ?, 
        description = ?, 
        location = ?, 
        start_time = ?, 
        end_time = ? 
       where id = ?`,
      )
      .run(
        event.type,
        event.title,
        event.description ?? null,
        event.location ?? null,
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
}

export default new EventRepository();
