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
  getMePreferences,
  setPlayPreference,
  setScenePreference,
  setRolePreference,
};
