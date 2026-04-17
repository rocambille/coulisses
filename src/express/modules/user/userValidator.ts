/*
  Purpose:
  Validate and normalize incoming User payloads for mutative requests.

  This validator:
  - Enforces shape and constraints of User DTOs
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
  User Data Transfer Object (DTO)

  Notes:
  - `id` is optional to allow reuse for different operations
*/
const userDTOSchema = z.object({
  id: z.number().optional(),
  email: z.email().max(255),
  name: z.string().max(255),
});

/*
  Export validator
*/
import { createValidator } from "../utils";

export default createValidator(userDTOSchema);
