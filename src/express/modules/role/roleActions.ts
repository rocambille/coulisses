/*
  Purpose:
  Define HTTP request handlers for Role-related operations.
*/

import type { RequestHandler } from "express";
import roleRepository from "./roleRepository";

const browse: RequestHandler = (req, res) => {
  const roles = roleRepository.findByPlay(req.play.id);
  res.json(roles);
};

const add: RequestHandler = (req, res) => {
  const insertId = roleRepository.create(req.body);
  res.status(201).json({ insertId });
};

const edit: RequestHandler = (req, res) => {
  roleRepository.update(req.body);
  res.sendStatus(204);
};

const linkScene: RequestHandler = (req, res) => {
  const { sceneId } = req.body;
  roleRepository.linkScene(req.role.id, sceneId);
  res.sendStatus(204);
};

const destroy: RequestHandler = (req, res) => {
  roleRepository.delete(req.role.id);
  res.sendStatus(204);
};

export default {
  browse,
  add,
  edit,
  linkScene,
  destroy,
};
