/*
  Purpose:
  Validate and normalize incoming Casting payloads for mutative requests.
*/

import type { RequestHandler } from "express";
import { type ZodError, z } from "zod";

const castingDTOSchema = z.object({
  userId: z.number(),
  roleId: z.number(),
});

const validate: RequestHandler = (req, res, next) => {
  try {
    req.body = castingDTOSchema.parse(req.body);
    next();
  } catch (err) {
    const { issues } = err as ZodError;
    res.status(400).json(issues);
  }
};

export default { validate };
