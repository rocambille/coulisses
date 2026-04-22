/*
  Purpose:
  Handlers for Preference operations.
*/

import type { RequestHandler } from "express";
import preferenceRepository from "./preferenceRepository";

const upsert: RequestHandler = (req, res) => {
  const { level } = req.body;

  preferenceRepository.upsert(req.me.id, req.scene.id, level);

  res.sendStatus(204);
};

const browseByPlay: RequestHandler = (req, res) => {
  const { playId } = req.params;

  const preferences = preferenceRepository.findByPlay(Number(playId));
  res.json(preferences);
};

export default { upsert, browseByPlay };
