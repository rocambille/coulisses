/*
  Purpose:
  Validate and normalize incoming Play payloads for mutative requests.
*/

import { createValidator } from "../../helpers/validation";
import { PlayDTOSchema } from "./playSchemas";

const add = createValidator(
  { body: PlayDTOSchema },
  { inject: (req) => ({ troupe_id: req.troupe.id }) },
);

const edit = createValidator(
  { body: PlayDTOSchema },
  { inject: (req) => ({ id: req.play.id, troupe_id: req.play.troupe_id }) },
);

export default {
  add,
  edit,
};
