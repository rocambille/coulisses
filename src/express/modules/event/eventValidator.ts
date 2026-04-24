/*
  Purpose:
  Validate and normalize incoming Event payloads for mutative requests.
*/

import { z } from "zod";

const eventDTOSchema = z.object({
  type: z.enum(["SHOW", "FIXED_REHEARSAL", "AUTO_REHEARSAL"]),
  title: z.string().max(255),
  description: z.string().nullable().optional(),
  location: z.string().max(255).nullable().optional(),
  start_time: z.iso.datetime(),
  end_time: z.iso.datetime(),
});

import { createValidator } from "../../helpers/validation";

export default createValidator(eventDTOSchema);
