/*
  Purpose:
  Validate and normalize incoming Scene payloads for mutative requests.
*/

import { z } from "zod";

const sceneDTOSchema = z.object({
  title: z.string().max(255),
  description: z.string().nullable().optional(),
  duration: z.number().nullable().optional(),
  scene_order: z.number(),
  is_active: z.boolean().optional(),
});

import { createValidator } from "../../helpers/validation";

export default createValidator(sceneDTOSchema);
