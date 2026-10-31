/*
  Purpose:
  Routes related to push notifications.
*/

import { Router } from "express";

const router = Router();

import type { RequestHandler } from "express";
import authActions from "../auth/authActions";
import playParamConverter from "../play/playParamConverter";
import troupeRepository from "../troupe/troupeRepository";
import notificationActions from "./notificationActions";
import notificationValidators from "./notificationValidators";

const SUBSCRIBE_PATH = "/api/notifications/subscribe";
const UNSUBSCRIBE_PATH = "/api/notifications/unsubscribe";
const PLAY_NOTIFY_PATH = "/api/plays/:playId/notify";

router.param("playId", playParamConverter.convert);

const checkIsPlayTroupeAdmin: RequestHandler = (req, res, next) => {
  if (
    troupeRepository.findMemberRole(req.play.troupe_id, req.me.id) === "ADMIN"
  ) {
    next();
  } else {
    res.sendStatus(403);
  }
};

router.use(
  [SUBSCRIBE_PATH, UNSUBSCRIBE_PATH, PLAY_NOTIFY_PATH],
  authActions.verifyAccessToken,
);

router.post(
  SUBSCRIBE_PATH,
  notificationValidators.subscribe,
  notificationActions.subscribe,
);

router.post(
  UNSUBSCRIBE_PATH,
  notificationValidators.unsubscribe,
  notificationActions.unsubscribe,
);

router.post(
  PLAY_NOTIFY_PATH,
  checkIsPlayTroupeAdmin,
  notificationValidators.notify,
  notificationActions.notify,
);

export default router;
