/*
  Purpose:
  Validate and normalize incoming Play payloads for mutative requests.
*/

import { type ZodError, z } from "zod";

const playDTOSchema = z.object({
  id: z.number().optional(),
  title: z.string().max(255),
  description: z.string().nullable().optional(),
});

import type { RequestHandler } from "express";

const validate: RequestHandler = (req, res, next) => {
  try {
    req.body = playDTOSchema.parse(req.body);
    next();
  } catch (err) {
    const { issues } = err as ZodError;
    res.status(400).json(issues);
  }
};

const playMemberDTOSchema = z.object({
  email: z.email(),
  role: z.enum(["TEACHER", "ACTOR"]),
});

const validateMember: RequestHandler = (req, res, next) => {
  try {
    req.body = playMemberDTOSchema.parse(req.body);
    next();
  } catch (err) {
    const { issues } = err as ZodError;
    res.status(400).json(issues);
  }
};

export default { validate, validateMember };
