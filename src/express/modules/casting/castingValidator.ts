/*
  Purpose:
  Validate and normalize incoming Casting payloads for mutative requests.
*/

import { z } from "zod";

const castingDTOSchema = z.object({
  userId: z.number(),
  roleId: z.number(),
});

import { createValidator } from "../utils";

export default createValidator(castingDTOSchema);
