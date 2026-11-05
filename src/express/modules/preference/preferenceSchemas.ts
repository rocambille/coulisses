/*
  Purpose:
  Validate incoming payloads for Preferences.
*/

import { z } from "zod";

const PreferenceSchema = z.object({
  user_id: z.number(),
  level: z.enum(["NOT_INTERESTED", "LOW", "MEDIUM", "HIGH"]),
  created_at: z.iso.datetime(),
});

export const PreferenceDTOSchema = PreferenceSchema.pick({
  level: true,
});

export type PreferenceDTO = z.infer<typeof PreferenceDTOSchema>;

export const PlayPreferenceSchema = PreferenceSchema.extend({
  play_id: z.number(),
});

export const ScenePreferenceSchema = PreferenceSchema.extend({
  scene_id: z.number(),
});

export const RolePreferenceSchema = PreferenceSchema.extend({
  scene_id: z.number(),
  role_id: z.number(),
});

export const VotingStatusSchema = z.object({
  active_scene_ids: z.array(z.number()),
  members: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      role: z.enum(["ADMIN", "ACTOR"]),
      votes: z.array(
        z.object({
          scene_id: z.number(),
          level: PreferenceSchema.shape.level,
        }),
      ),
    }),
  ),
});

export type VotingStatus = z.infer<typeof VotingStatusSchema>;
export type Preference = z.infer<typeof PreferenceSchema>;
export type PlayPreference = z.infer<typeof PlayPreferenceSchema>;
export type ScenePreference = z.infer<typeof ScenePreferenceSchema>;
export type RolePreference = z.infer<typeof RolePreferenceSchema>;
