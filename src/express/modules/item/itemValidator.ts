/*
  Purpose:
  Validate and normalize incoming Item payloads for mutative requests.

  This validator:
  - Enforces shape and constraints of Item DTOs
  - Injects trusted server-side data (user_id)
  - Acts as a boundary between untrusted input and business logic

  What this file intentionally does NOT do:
  - No authorization checks (handled elsewhere)
  - No persistence logic
  - No HTTP routing decisions

  Design notes:
  - Validation happens as early as possible in the request pipeline
  - Zod is used for explicit, composable schemas
  - Parsed data replaces req.body to guarantee type safety downstream

  Related docs:
  - https://zod.dev/
*/

import { z } from "zod";

/*
  Item Data Transfer Object (DTO)

  Notes:
  - `id` is optional to allow reuse for different operations
  - `user_id` is NOT trusted from the client:
    it will always be overridden by the authenticated user
*/
const itemDTOSchema = z.object({
  id: z.number().optional(),
  title: z.string().max(255),
  user_id: z.number(),
});

/*
  Export validator
*/
import { createValidator } from "../utils";

export default createValidator(itemDTOSchema, (req) => ({
  ...req.body,
  // user_id is derived from the authenticated user, not from req.body
  user_id: req.me.id,
}));
