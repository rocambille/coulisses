/*
  Purpose:
  Define HTTP request handlers for push notifications.
*/

import type { RequestHandler } from "express";
import notificationHelper from "./notificationHelper";
import notificationRepository from "./notificationRepository";

const subscribe: RequestHandler = (req, res) => {
  notificationRepository.upsert(req.body);
  res.sendStatus(204);
};

const unsubscribe: RequestHandler = (req, res) => {
  notificationRepository.deleteForUser(req.body.endpoint, req.me.id);
  res.sendStatus(204);
};

const notify: RequestHandler = (req, res) => {
  const recipients =
    req.body.kind === "VOTE_REMINDER"
      ? notificationHelper.voteReminder(req.play)
      : notificationHelper.castingPublished(req.play, req.me.id);

  res.json({ recipients });
};

export default { subscribe, unsubscribe, notify };
