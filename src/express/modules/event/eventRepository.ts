/*
  Purpose:
  Persistent logic for Events.
*/

import databaseClient, {
  type Result,
  type Rows,
} from "../../../database/client";

class EventRepository {
  async findByPlay(playId: number): Promise<EventData[]> {
    const [rows] = await databaseClient.query<Rows>(
      `select * from event where play_id = ? order by start_time asc`,
      [playId],
    );
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
      }) => ({
        id,
        play_id,
        type,
        title,
        description,
        location,
        start_time,
        end_time,
      }),
    );
  }

  async create(event: Omit<EventData, "id">): Promise<number> {
    const [result] = await databaseClient.query<Result>(
      `insert into event (play_id, type, title, description, location, start_time, end_time) 
       values (?, ?, ?, ?, ?, STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s.%fZ'), STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s.%fZ'))`,
      [
        event.play_id,
        event.type,
        event.title,
        event.description,
        event.location,
        event.start_time,
        event.end_time,
      ],
    );

    return result.insertId;
  }

  async update(eventId: number, event: Partial<EventData>): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(event)) {
      if (key !== "id" && key !== "play_id" && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return false;

    values.push(eventId);

    const [result] = await databaseClient.query<Result>(
      `update event set ${fields.join(", ")} where id = ?`,
      values,
    );

    return result.affectedRows > 0;
  }

  async destroy(eventId: number): Promise<boolean> {
    const [result] = await databaseClient.query<Result>(
      `delete from event where id = ?`,
      [eventId],
    );

    return result.affectedRows > 0;
  }

  async find(eventId: number): Promise<EventData | null> {
    const [rows] = await databaseClient.query<Rows>(
      `select * from event where id = ?`,
      [eventId],
    );
    return (rows[0] as EventData) || null;
  }
}

export default new EventRepository();
