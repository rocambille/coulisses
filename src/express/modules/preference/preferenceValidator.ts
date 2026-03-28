/*
  Purpose:
  Validate and normalize incoming Preference payloads.
*/

import type { RequestHandler } from "express";
import { type ZodError, z } from "zod";

const preferenceDTOSchema = z.object({
  level: z.enum(["HIGH", "MEDIUM", "LOW", "NOT_INTERESTED"]),
});

const validate: RequestHandler = (req, res, next) => {
  try {
    req.body = preferenceDTOSchema.parse(req.body);
    next();
  } catch (err) {
    const { issues } = err as ZodError;
    res.status(400).json(issues);
  }
};

export default { validate };
