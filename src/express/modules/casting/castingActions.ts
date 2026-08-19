/*
  Purpose:
  Define HTTP request handlers for Casting-related operations.
*/

import type { RequestHandler } from "express";
import castingRepository from "./castingRepository";

const dashboard: RequestHandler = (req, res) => {
  const matrix = castingRepository.getPlayCastingMatrix(req.play.id);
  res.json(matrix);
};

const assign: RequestHandler = (req, res) => {
  castingRepository.assignRole(req.body);
  res.status(201).json({});
};

const unassign: RequestHandler = (req, res) => {
  castingRepository.unassignRole(req.body);
  res.sendStatus(204);
};

export default {
  dashboard,
  assign,
  unassign,
};
