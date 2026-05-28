/*
  Purpose:
  Validate incoming payloads for Preferences.
*/

import { z } from "zod";
import { createValidator } from "../../helpers/validation";

const preferenceDTOSchema = z.object({
  level: z.enum(["HIGH", "MEDIUM", "LOW", "NOT_INTERESTED"]),
});

export default createValidator(preferenceDTOSchema);
