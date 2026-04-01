/*
  Purpose:
  Define HTTP request handlers for Scene-related operations.
*/

import type { RequestHandler } from "express";
import sceneRepository from "./sceneRepository";

const browse: RequestHandler = async (req, res) => {
  const scenes = await sceneRepository.findByPlay(req.play);
  res.json(scenes);
};

const add: RequestHandler = async (req, res) => {
  const insertId = await sceneRepository.create(req.play.id, req.body);
  res.status(201).json({ insertId });
};

const read: RequestHandler = (req, res) => {
  res.json(req.scene);
};

const edit: RequestHandler = async (req, res) => {
  await sceneRepository.update(req.scene.id, req.body);
  res.sendStatus(204);
};

const destroy: RequestHandler = async (req, res) => {
  await sceneRepository.hardDelete(req.scene.id);
  res.sendStatus(204);
};

export default {
  browse,
  add,
  read,
  edit,
  destroy,
};
