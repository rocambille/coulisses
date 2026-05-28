/*
  Purpose:
  Define HTTP request handlers for Preference-related operations.
*/

import type { RequestHandler } from "express";
import preferenceRepository from "./preferenceRepository";

const getMePreferences: RequestHandler = (req, res) => {
  const preferences = preferenceRepository.findAllForUser(req.me.id);
  res.json(preferences);
};

const setPlayPreference: RequestHandler = (req, res) => {
  const { level } = req.body;
  preferenceRepository.upsertPlayPreference(req.me.id, req.play.id, level);
  res.sendStatus(204);
};

const setScenePreference: RequestHandler = (req, res) => {
  const { level } = req.body;
  preferenceRepository.upsertScenePreference(req.me.id, req.scene.id, level);
  res.sendStatus(204);
};

const setRolePreference: RequestHandler = (req, res) => {
  const { level } = req.body;
  preferenceRepository.upsertRolePreference(
    req.me.id,
    req.scene.id,
    req.role.id,
    level,
  );
  res.sendStatus(204);
};

export default {
  getMePreferences,
  setPlayPreference,
  setScenePreference,
  setRolePreference,
};
