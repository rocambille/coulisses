/*
  Purpose:
  Validate incoming payloads for Castings.
*/

import { createValidator } from "../../helpers/validation";
import { CastingDTOSchema } from "./castingSchemas";

const validate = createValidator({ body: CastingDTOSchema });

export default { validate };
