/*
  Purpose:
  Define HTTP request handlers for Preference-related operations.
*/

import type { RequestHandler } from "express";
import preferenceRepository from "./preferenceRepository";

const getTroupePreferences: RequestHandler = (req, res) => {
  const preferences = preferenceRepository.findAllForTroupe(req.troupe.id);
  res.json(preferences);
};

const setPlayPreference: RequestHandler = (req, res) => {
  preferenceRepository.upsertPlayPreference(req.body);
  res.sendStatus(204);
};

const setScenePreference: RequestHandler = (req, res) => {
  preferenceRepository.upsertScenePreference(req.body);
  res.sendStatus(204);
};

const setRolePreference: RequestHandler = (req, res) => {
  preferenceRepository.upsertRolePreference(req.body);
  res.sendStatus(204);
};

export default {
  getTroupePreferences,
  setPlayPreference,
  setScenePreference,
  setRolePreference,
};
