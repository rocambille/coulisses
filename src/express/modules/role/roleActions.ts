/*
  Purpose:
  Define HTTP request handlers for Role-related operations.
*/

import type { RequestHandler } from "express";
import roleRepository from "./roleRepository";

const browse: RequestHandler = async (req, res) => {
  const roles = await roleRepository.browseByPlay(req.play.id);
  res.json(roles);
};

const add: RequestHandler = async (req, res) => {
  const { name, description, sceneIds } = req.body;

  const insertId = await roleRepository.create(
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
