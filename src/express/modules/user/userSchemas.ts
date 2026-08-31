/*
  Purpose:
  Centralize Zod schemas for the User resource (SSOT).
*/

import { z } from "zod";
import { serverEnv } from "../../../env/server";

/*
  User Master Entity Schema
*/
export const UserSchema = z.object({
  id: z.number(),
  email: z.email().max(255),
  name: z.string().max(255),
  avatar_url: z
    .string()
    .nullable()
    .refine((maybeRelativeUrl) => {
      if (!maybeRelativeUrl) {
        return true;
      }

      try {
        new URL(maybeRelativeUrl, serverEnv.APP_BASE_URL);
        return true;
      } catch {
        return false;
      }
    }),
  created_at: z.iso.datetime(),
  deleted_at: z.iso.datetime().nullable(),
});

export type User = z.infer<typeof UserSchema>;

/*
  User DTO Schema (Client Input Boundary)
*/
export const UserDTOSchema = UserSchema.omit({
  id: true,
  avatar_url: true,
  created_at: true,
  deleted_at: true,
});

export type UserDTO = z.infer<typeof UserDTOSchema>;
