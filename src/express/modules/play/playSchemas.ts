/*
  Purpose:
  Validate and normalize incoming Play payloads for mutative requests.
*/

import { z } from "zod";

export const PlaySchema = z.object({
  id: z.number(),
  troupe_id: z.number(),
  title: z.string(),
  description: z.string(),
});

export type Play = z.infer<typeof PlaySchema>;

export const PlayDTOSchema = PlaySchema.omit({
  id: true,
  troupe_id: true,
});

export type PlayDTO = z.infer<typeof PlayDTOSchema>;

export type PlayDTOWithTroupeId = PlayDTO & { troupe_id: Troupe["id"] };
