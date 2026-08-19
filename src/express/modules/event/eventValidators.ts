/*
  Purpose:
  Validate and normalize incoming Event payloads for mutative requests.
*/

import { createValidator } from "../../helpers/validation";
import { EventDTOSchema, EventPresenceDTOSchema } from "./eventSchemas";

const add = createValidator(
  { body: EventDTOSchema },
  { inject: (req) => ({ troupe_id: req.troupe.id, owner_id: req.me.id }) },
);
const edit = createValidator(
  { body: EventDTOSchema },
  { inject: (req) => ({ id: req.event.id }) },
);
const setPresence = createValidator(
  { body: EventPresenceDTOSchema },
  { inject: (req) => ({ id: req.event.id, user_id: req.me.id }) },
);

export default { add, edit, setPresence };
