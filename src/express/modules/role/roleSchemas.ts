/*
  Purpose:
  Validate and normalize incoming Role payloads for mutative requests.
*/

import { z } from "zod";

import { SceneSchema } from "../scene/sceneSchemas";

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  play_id: z.number(),
});

export type Role = z.infer<typeof RoleSchema>;

export const RoleWithScenesSchema = RoleSchema.extend({
  scenes: z.preprocess((val: string) => {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  }, z.array(SceneSchema)),
});

export type RoleWithScenes = z.infer<typeof RoleWithScenesSchema>;

export const RoleDTOSchema = RoleSchema.omit({
  id: true,
  play_id: true,
}).extend({
  sceneIds: z.array(z.number()),
});

export type RoleDTO = z.infer<typeof RoleDTOSchema>;

export type RoleDTOWithPlayId = RoleDTO & { play_id: Play["id"] };
