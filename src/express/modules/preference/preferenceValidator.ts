/*
  Purpose:
  Validate and normalize incoming Preference payloads.
*/

import { z } from "zod";

const preferenceDTOSchema = z.object({
  level: z.enum(["HIGH", "MEDIUM", "LOW", "NOT_INTERESTED"]),
});

import { createValidator } from "../../helpers/validation";

export default createValidator(preferenceDTOSchema);
