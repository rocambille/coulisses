/*
  Purpose:
  Validate and normalize incoming User payloads for mutative requests.
*/

import type { RequestHandler } from "express";
import { type ZodError, z } from "zod";

const userDTOSchema = z.object({
  id: z.number().optional(),
  email: z.email().max(255),
  name: z.string().max(255),
});

const validate: RequestHandler = (req, res, next) => {
  try {
    req.body = userDTOSchema.parse(req.body);
    next();
  } catch (err) {
    const { issues } = err as ZodError;
    res.status(400).json(issues);
  }
};

export default { validate };
