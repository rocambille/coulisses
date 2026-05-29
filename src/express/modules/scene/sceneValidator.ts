/*
  Purpose:
  Validate and normalize incoming Scene payloads for mutative requests.
*/

import { z } from "zod";

const sceneDTOSchema = z.object({
  title: z.string().max(255),
  description: z.string(),
  cut_notes: z.string(),
  duration_estimated_seconds: z.int().nonnegative(),
  order_in_play: z.int(),
  is_active: z.boolean(),
});

import { createValidator } from "../../helpers/validation";

export default createValidator(sceneDTOSchema);
