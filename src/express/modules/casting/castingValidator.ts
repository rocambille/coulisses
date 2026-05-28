/*
  Purpose:
  Validate incoming payloads for Castings.
*/

import { z } from "zod";
import { createValidator } from "../../helpers/validation";

const castingDTOSchema = z.object({
  user_id: z.number(),
  role_id: z.number(),
  scene_id: z.number(),
});

export default createValidator(castingDTOSchema);
