/*
  Purpose:
  Validate and normalize incoming Scene payloads for mutative requests.
*/

import type { RequestHandler } from "express";
import { type ZodError, z } from "zod";

const sceneDTOSchema = z.object({
  title: z.string().max(255),
  description: z.string().nullable().optional(),
  duration: z.number().nullable().optional(),
  order: z.number(),
  is_active: z.boolean().optional(),
});

const validateAdd: RequestHandler = (req, res, next) => {
  try {
    req.body = sceneDTOSchema.parse(req.body);
    next();
  } catch (err) {
    const { issues } = err as ZodError;
    res.status(400).json(issues);
  }
};

const sceneEditDTOSchema = sceneDTOSchema.partial();

const validateEdit: RequestHandler = (req, res, next) => {
  try {
    req.body = sceneEditDTOSchema.parse(req.body);
    next();
  } catch (err) {
    const { issues } = err as ZodError;
    res.status(400).json(issues);
  }
};

export default { validateAdd, validateEdit };
