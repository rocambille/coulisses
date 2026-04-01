/*
  Purpose:
  Handlers for Preference operations.
*/

import type { RequestHandler } from "express";
import preferenceRepository from "./preferenceRepository";

const upsert: RequestHandler = async (req, res) => {
  const { level } = req.body;

  await preferenceRepository.upsert(req.me.id, req.scene.id, level);

  res.sendStatus(204); // Upsert successful
};

const browseByPlay: RequestHandler = async (req, res) => {
  const { playId } = req.params;

  const preferences = await preferenceRepository.findByPlay(Number(playId));
  res.json(preferences);
};

export default { upsert, browseByPlay };
