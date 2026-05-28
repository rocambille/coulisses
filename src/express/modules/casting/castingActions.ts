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
  const { scene_id, role_id, user_id } = req.body;
  castingRepository.assignRole(scene_id, role_id, user_id);
  res.status(201).json({});
};

const unassign: RequestHandler = (req, res) => {
  const { scene_id, role_id, user_id } = req.body;
  castingRepository.unassignRole(scene_id, role_id, user_id);
  res.sendStatus(204);
};

export default {
  dashboard,
  assign,
  unassign,
};
