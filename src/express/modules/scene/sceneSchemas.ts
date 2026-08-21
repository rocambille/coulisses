/*
  Purpose:
  Validate and normalize incoming Scene payloads for mutative requests.
*/

import { z } from "zod";

export const SceneSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  cut_notes: z.string(),
  play_id: z.number(),
  order_in_play: z.number(),
  duration_estimated_seconds: z.number(),
  is_active: z.coerce.boolean().default(true),
});

export type Scene = z.infer<typeof SceneSchema>;

export const SceneDTOSchema = SceneSchema.omit({
  id: true,
  play_id: true,
}).extend({
  roleIds: z.array(z.number()),
});

export type SceneDTO = z.infer<typeof SceneDTOSchema>;

export type SceneDTOWithPlayId = SceneDTO & { play_id: Play["id"] };
