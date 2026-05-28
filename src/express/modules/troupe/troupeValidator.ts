/*
  Purpose:
  Validate and normalize incoming Troupe payloads for mutative requests.
*/

import { z } from "zod";
import { createValidator } from "../../helpers/validation";

const troupeDTOSchema = z.object({
  name: z.string().max(255),
  description: z.string(),
  external_discussion_link: z.url().or(z.literal("")),
});

export default createValidator(troupeDTOSchema);

const addMemberDTOSchema = z.object({
  email: z.email(),
  role: z.enum(["ADMIN", "ACTOR"]),
});

export const addMemberValidator = createValidator(addMemberDTOSchema);

const updateMemberDTOSchema = z.object({
  role: z.enum(["ADMIN", "ACTOR"]),
});

export const updateMemberValidator = createValidator(updateMemberDTOSchema);
