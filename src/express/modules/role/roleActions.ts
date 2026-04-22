/*
  Purpose:
  Define HTTP request handlers for Role-related operations.
*/

import type { RequestHandler } from "express";
import roleRepository from "./roleRepository";

const browse: RequestHandler = (req, res) => {
  const roles = roleRepository.findByPlay(req.play);
  res.json(roles);
};

const add: RequestHandler = (req, res) => {
  const { name, description, sceneIds } = req.body;

  const insertId = roleRepository.create(
    req.play.id,
    { name, description },
    sceneIds,
  );

  res.status(201).json({ insertId });
};

export default {
  browse,
  add,
};
