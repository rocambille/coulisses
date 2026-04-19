/*
  Purpose:
  Provide shared utilities for Express modules.

  This file contains:
  - createValidator: factory to create Zod validation middleware
  - createParamConverter: factory to create param converter middleware

  Design notes:
  - Reduces boilerplate across modules
  - Mirrors src/react/components/utils.ts on the React side
  - No business logic, only infrastructure helpers

  Related docs:
  - https://zod.dev/
  - https://expressjs.com/en/5x/api.html#router.param
*/

import type { Request, RequestHandler, RequestParamHandler } from "express";
import type { ZodObject } from "zod";

/* ************************************************************************ */
/* createValidator                                                          */
/* ************************************************************************ */

/*
  createValidator(schema):
  - Returns an Express middleware that validates req.body against a Zod schema
  - Replaces req.body with the parsed (typed, sanitized) result
  - Returns 400 with detailed Zod issues on validation failure

  Usage:
    const validate = createValidator(myDTOSchema);
    router.post("/api/things", validate, thingActions.add);
*/
export const createValidator = (
  schema: ZodObject,
  extract: (req: Request) => unknown = (req) => req.body,
): { validate: RequestHandler } => ({
  validate: (req, res, next) => {
    const parsed = schema.safeParse(extract(req));

    if (!parsed.success) {
      const { issues } = parsed.error;

      res.status(400).json(issues);

      return;
    }

    req.body = parsed.data;

    next();
  },
});

/* ************************************************************************ */
/* createParamConverter                                                     */
/* ************************************************************************ */

/*
  createParamConverter(repository, requestKey):
  - Returns an Express param middleware for router.param()
  - Loads an entity from the repository and attaches it to req[requestKey]
  - Returns 404 if not found (or 204 for DELETE, for idempotency)

  Contract:
  - repository must expose a `find(id: number)` method returning T | null

  Usage:
    const { convert } = createParamConverter(itemRepository, "item");
    router.param("itemId", convert);
    // After: req.item is guaranteed to exist

  Design note:
  - HTTP semantics (404, 204) are handled here, not in controllers
  - Controllers never deal with "missing entity" cases
*/
export const createParamConverter = <T>(
  repository: { find: (id: number) => Promise<T | null> },
  requestKey: string,
): { convert: RequestParamHandler } => {
  return {
    convert: async (req, res, next, rawId) => {
      const entity = await repository.find(+rawId);

      if (entity == null) {
        res.sendStatus(req.method === "DELETE" ? 204 : 404);
        return;
      }

      Object.assign(req, { [requestKey]: entity });

      next();
    },
  };
};
