/*
  Purpose:
  Validate and normalize incoming notification payloads.
*/

import { createValidator } from "../../helpers/validation";
import {
  NotifyDTOSchema,
  SubscribeDTOSchema,
  UnsubscribeDTOSchema,
} from "./notificationSchemas";

const subscribe = createValidator(
  { body: SubscribeDTOSchema },
  { inject: (req) => ({ user_id: req.me.id }) },
);

const unsubscribe = createValidator(
  { body: UnsubscribeDTOSchema },
  { inject: (req) => ({ user_id: req.me.id }) },
);

const notify = createValidator({ body: NotifyDTOSchema });

export default { subscribe, unsubscribe, notify };
