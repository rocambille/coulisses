/*
  Purpose:
  Handlers for Casting operations.
*/

import type { RequestHandler } from "express";
import castingRepository from "./castingRepository";

const assignRole: RequestHandler = (req, res) => {
  const { userId, roleId } = req.body;

  castingRepository.assignRole(userId, roleId);

  res.sendStatus(201);
};

const unassignRole: RequestHandler = (req, res) => {
  const { userId, roleId } = req.body;

  castingRepository.unassignRole(userId, roleId);

  res.sendStatus(204);
};

const getMatrix: RequestHandler = (req, res) => {
  const matrix = castingRepository.getPlayCastingMatrix(req.play.id);
  res.json(matrix);
};

export default { assignRole, unassignRole, getMatrix };
