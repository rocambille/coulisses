/*
  Purpose:
  Define HTTP request handlers for Preference-related operations.
*/

import type { RequestHandler } from "express";
import notificationHelper from "../notification/notificationHelper";
import preferenceRepository from "./preferenceRepository";

const getTroupePreferences: RequestHandler = (req, res) => {
  const preferences = preferenceRepository.findAllForTroupe(req.troupe.id);
  res.json(preferences);
};

const getVotingStatus: RequestHandler = (req, res) => {
  res.json(preferenceRepository.findVotingStatus(req.play.id));
};

const setPlayPreference: RequestHandler = (req, res) => {
  preferenceRepository.upsertPlayPreference(req.body);

  notificationHelper.playVoted(req.play, req.me, req.body.level);

  res.sendStatus(204);
};

const setScenePreference: RequestHandler = (req, res) => {
  const isFirstVote = !preferenceRepository.hasVotedInPlay(
    req.me.id,
    req.scene.play_id,
  );

  preferenceRepository.upsertScenePreference(req.body);

  if (isFirstVote) {
    notificationHelper.votingStarted(req.scene.play_id, req.me);
  }

  res.sendStatus(204);
};

const setRolePreference: RequestHandler = (req, res) => {
  const isFirstVote = !preferenceRepository.hasVotedInPlay(
    req.me.id,
    req.scene.play_id,
  );

  preferenceRepository.upsertRolePreference(req.body);

  if (isFirstVote) {
    notificationHelper.votingStarted(req.scene.play_id, req.me);
  }

  res.sendStatus(204);
};

export default {
  getTroupePreferences,
  getVotingStatus,
  setPlayPreference,
  setScenePreference,
  setRolePreference,
};
