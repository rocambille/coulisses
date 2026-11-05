/*
  Purpose:
  Validate the page to open after a login (shared with the React client).

  Security:
  - Only a path of this site is accepted. Anything else would turn login
    emails into an open redirect, a gift for phishing.
  - Browsers read "//host" and "/\host" as another site, and drop tabs and
    newlines from URLs: only printable ASCII is allowed, and the second
    character cannot be a slash or a backslash
*/

import { z } from "zod";

export const NextPathSchema = z
  .string()
  .max(512)
  .regex(/^\/(?![/\\])[\x21-\x7e]*$/);

export const toSafeNextPath = (value: unknown): string | null =>
  NextPathSchema.safeParse(value).data ?? null;
