/*
  Purpose:
  Validate and normalize incoming Event payloads for mutative requests.
*/

import type { RequestHandler } from "express";
import { type ZodError, z } from "zod";

const eventDTOSchema = z.object({
  type: z.enum(["SHOW", "FIXED_REHEARSAL", "AUTO_REHEARSAL"]),
  title: z.string().max(255),
  description: z.string().nullable().optional(),
  location: z.string().max(255).nullable().optional(),
  start_time: z.iso.datetime(),
  end_time: z.iso.datetime(),
});

export const validate: RequestHandler = (req, res, next) => {
  try {
    req.body = eventDTOSchema.parse(req.body);
    next();
  } catch (err) {
    const { issues } = err as ZodError;
    res.status(400).json(issues);
  }
};

export default { validate };
