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

  async update(
    eventId: number,
    event: Omit<EventData, "id" | "play_id">,
  ): Promise<boolean> {
    const [result] = await databaseClient.query<Result>(
      `update event set 
        type = ?, 
        title = ?, 
        description = ?, 
        location = ?, 
        start_time = STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s.%fZ'), 
        end_time = STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s.%fZ') 
       where id = ?`,
      [
        event.type,
        event.title,
        event.description,
        event.location,
        event.start_time,
        event.end_time,
        eventId,
      ],
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

    if (rows.length === 0) return null;

    const {
      id,
      play_id,
      type,
      title,
      description,
      location,
      start_time,
      end_time,
    } = rows[0];

    return {
      id,
      play_id,
      type,
      title,
      description,
      location,
      start_time,
      end_time,
    };
  }
}

export default new EventRepository();
