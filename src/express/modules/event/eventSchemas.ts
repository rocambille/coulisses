/*
  Purpose:
  Validate and normalize incoming Event payloads for mutative requests.
*/

import { z } from "zod";

export const EventSchema = z.object({
  id: z.number(),
  troupe_id: z.number(),
  owner_id: z.number(),
  type: z.enum(["COURSE", "REHEARSAL", "SHOW", "OTHER"]),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  start_time: z.iso.datetime(),
  end_time: z.iso.datetime(),
});

export type EventData = z.infer<typeof EventSchema>;

export const EventDTOSchema = EventSchema.omit({
  id: true,
  troupe_id: true,
  owner_id: true,
});

export type EventDTO = z.infer<typeof EventDTOSchema>;

export type EventDTOWithTroupeAndOwnerId = EventDTO & {
  troupe_id: Troupe["id"];
  owner_id: User["id"];
};

export type EventDTOWithId = EventDTO & {
  id: EventData["id"];
};

export const EventPresenceSchema = z.object({
  event_id: z.number(),
  user_id: z.number(),
  status: z.enum(["PENDING", "PRESENT", "ABSENT"]),
  updated_at: z.iso.datetime(),
});

export type EventPresence = z.infer<typeof EventPresenceSchema>;

export const EventPresenceDTOSchema = EventPresenceSchema.pick({
  status: true,
});

export type EventPresenceDTO = z.infer<typeof EventPresenceDTOSchema>;

export type EventPresenceDTOWithEventAndUserIds = EventPresenceDTO & {
  id: EventData["id"];
  user_id: User["id"];
};
