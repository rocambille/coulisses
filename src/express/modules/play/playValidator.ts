/*
  Purpose:
  Validate and normalize incoming Play payloads for mutative requests.
*/

import { z } from "zod";
import { createValidator } from "../../helpers/validation";

const playDTOSchema = z.object({
  title: z.string().max(255),
  description: z.string(),
});

export default createValidator(playDTOSchema);
