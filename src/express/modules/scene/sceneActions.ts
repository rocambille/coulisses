/*
  Purpose:
  Define HTTP request handlers for Scene-related operations.
*/

import type { RequestHandler } from "express";
import sceneRepository from "./sceneRepository";

const browse: RequestHandler = (req, res) => {
  const scenes = sceneRepository.findByPlay(req.play.id);
  res.json(scenes);
};

const edit: RequestHandler = (req, res) => {
  sceneRepository.update(req.body);
  res.sendStatus(204);
};

const add: RequestHandler = (req, res) => {
  const insertId = sceneRepository.create(req.body);
  res.status(201).json({ insertId });
};

const destroy: RequestHandler = (req, res) => {
  sceneRepository.hardDelete(req.scene.id);
  res.sendStatus(204);
};

export default {
  browse,
  edit,
  add,
  destroy,
};
