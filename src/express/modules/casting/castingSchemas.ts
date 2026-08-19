/*
  Purpose:
  Validate incoming payloads for Castings.
*/

import { z } from "zod";
import { RolePreferenceSchema } from "../preference/preferenceSchemas";
import { RoleSchema } from "../role/roleSchemas";
import { SceneSchema } from "../scene/sceneSchemas";
import { UserSchema } from "../user/userSchemas";

export const CastingSchema = z.object({
  user_id: z.number(),
  role_id: z.number(),
  scene_id: z.number(),
  assigned_at: z.iso.datetime(),
});

export type Casting = z.infer<typeof CastingSchema>;

export const CastingDTOSchema = CastingSchema.omit({ assigned_at: true });

export type CastingDTO = z.infer<typeof CastingDTOSchema>;

export const CastingMatrixSchema = z.object({
  actors: z.array(UserSchema),
  scenes: z.array(
    SceneSchema.extend({
      roles: z.array(
        RoleSchema.extend({
          assigned_user: UserSchema.nullable(),
          preferences: z.array(RolePreferenceSchema),
        }),
      ),
    }),
  ),
});

export type CastingMatrix = z.infer<typeof CastingMatrixSchema>;
