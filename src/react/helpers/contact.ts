/*
  Purpose:
  Contact of the project team (privacy requests, feedback).

  Design notes:
  - VITE_CONTACT_EMAIL is required in production (env/server.ts); in
    development, a visible placeholder reminds to set it
*/

import { clientEnv } from "../../env/client";

export const CONTACT_EMAIL = clientEnv.VITE_CONTACT_EMAIL ?? null;

export const CONTACT_LABEL =
  CONTACT_EMAIL ?? "[adresse de contact à configurer]";
