/*
  Purpose:
  Validate and normalize incoming Role payloads for mutative requests.
*/

import { z } from "zod";

const roleDTOSchema = z.object({
  name: z.string().max(255),
  description: z.string().nullable().optional(),
  sceneIds: z.array(z.number()).optional(),
});

import { createValidator } from "../utils";

export default createValidator(roleDTOSchema);
