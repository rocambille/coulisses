/*
  Purpose:
  Handlers for Casting operations.
*/

import type { RequestHandler } from "express";
import castingRepository from "./castingRepository";

const assignRole: RequestHandler = async (req, res) => {
  const { userId, roleId } = req.body;

  await castingRepository.assignRole(userId, roleId);

  res.sendStatus(201);
};

const getMatrix: RequestHandler = async (req, res) => {
  const matrix = await castingRepository.getPlayCastingMatrix(req.play.id);
  res.json(matrix);
};

export default { assignRole, getMatrix };
