/*
  Purpose:
  Validate and normalize incoming Role payloads for mutative requests.
*/

import { z } from "zod";

const roleDTOSchema = z.object({
  name: z.string().max(255),
  description: z.string(),
  sceneIds: z.array(z.number()),
});

import { createValidator } from "../../helpers/validation";

export default createValidator(roleDTOSchema);
