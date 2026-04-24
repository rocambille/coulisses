/*
  Purpose:
  Validate and normalize incoming Play payloads for mutative requests.
*/

import { z } from "zod";

const playDTOSchema = z.object({
  id: z.number().optional(),
  title: z.string().max(255),
  description: z.string().nullable().optional(),
});

import { createValidator } from "../../helpers/validation";

export default createValidator(playDTOSchema);

const playMemberDTOSchema = z.object({
  email: z.email(),
  role: z.enum(["TEACHER", "ACTOR"]),
});

export const playMemberValidator = createValidator(playMemberDTOSchema);
