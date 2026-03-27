/*
  Purpose:
  Validate and normalize incoming Role payloads for mutative requests.
*/

import type { RequestHandler } from "express";
import { type ZodError, z } from "zod";

const roleDTOSchema = z.object({
  name: z.string().max(255),
  description: z.string().nullable().optional(),
  sceneIds: z.array(z.number()).optional(),
});

const validateAdd: RequestHandler = (req, res, next) => {
  try {
    req.body = roleDTOSchema.parse(req.body);
    next();
  } catch (err) {
    const { issues } = err as ZodError;
    res.status(400).json(issues);
  }
};

export default { validateAdd };
