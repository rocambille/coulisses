/*
  Purpose:
  Centralize all mocked data for both API and React tests.
  This ensures consistency and eliminates duplication.

  Naming:
  Use descriptive names (e.g., teacherUser, mainPlay, mainTroupe) to make tests more readable.
*/

import type { DatabaseSync } from "node:sqlite";

import { mainTroupe } from "./troupes";
import { actorUser, teacherUser } from "./users";

export const openingNightEvent: EventData = {
  id: 1,
  troupe_id: mainTroupe.id,
  owner_id: teacherUser.id,
  type: "SHOW",
  title: "Opening Night",
  description: "Opening Night description",
  location: "Main Stage",
  start_time: "2026-06-01T20:00:00.000Z",
  end_time: "2026-06-01T22:30:00.000Z",
};

export const autoRehearsalEvent: EventData = {
  id: 2,
  troupe_id: mainTroupe.id,
  owner_id: teacherUser.id,
  type: "REHEARSAL",
  title: "Rehearsal",
  description: "Rehearsal description",
  location: "Main Stage",
  start_time: "2026-06-02T20:00:00.000Z",
  end_time: "2026-06-02T22:30:00.000Z",
};

export const fixedRehearsalEvent: EventData = {
  id: 3,
  troupe_id: mainTroupe.id,
  owner_id: teacherUser.id,
  type: "COURSE",
  title: "Course",
  description: "Course description",
  location: "Main Stage",
  start_time: "2026-06-03T20:00:00.000Z",
  end_time: "2026-06-03T22:30:00.000Z",
};

export const allEvents = [
  openingNightEvent,
  autoRehearsalEvent,
  fixedRehearsalEvent,
];

export const mainEventPresences: EventPresence[] = [
  {
    event_id: openingNightEvent.id,
    user_id: actorUser.id,
    status: "PRESENT",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    event_id: openingNightEvent.id,
    user_id: teacherUser.id,
    status: "PENDING",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
];

export const seedEvents = (db: DatabaseSync) => {
  const insertEvent = db.prepare(
    "insert into event(id, troupe_id, owner_id, type, title, description, location, start_time, end_time) values(?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  for (const event of allEvents) {
    insertEvent.run(
      event.id,
      event.troupe_id,
      event.owner_id,
      event.type,
      event.title,
      event.description,
      event.location,
      event.start_time,
      event.end_time,
    );
  }

  const insertEventPresence = db.prepare(
    "insert into event_presence(event_id, user_id, status) values(?, ?, ?)",
  );
  for (const presence of mainEventPresences) {
    insertEventPresence.run(
      presence.event_id,
      presence.user_id,
      presence.status,
    );
  }
};
