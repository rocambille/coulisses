/*
  Purpose:
  Handlers for Preference operations.
*/

import type { RequestHandler } from "express";
import preferenceRepository from "./preferenceRepository";

const upsert: RequestHandler = async (req, res) => {
  const userId = Number(req.auth.sub);
  const { level } = req.body;

  await preferenceRepository.upsert(userId, req.scene.id, level);

  res.sendStatus(204); // Upsert successful
};

export default { upsert };
