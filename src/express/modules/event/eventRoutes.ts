/*
  Purpose:
  Routes related to "events" (calendar).
*/

import { Router } from "express";

const router = Router();

import type { RequestHandler } from "express";
import authActions from "../auth/authActions";
import playParamConverter from "../play/playParamConverter";
import playRepository from "../play/playRepository";
import eventActions from "./eventActions";
import eventParamConverter from "./eventParamConverter";
import eventValidator from "./eventValidator";

const EVENTS_BY_PLAY_PATH = "/api/plays/:playId/events";
const EVENT_BY_ID_PATH = "/api/events/:eventId";

router.param("playId", playParamConverter.convert);
router.param("eventId", eventParamConverter.convert);

const checkIsMemberByPlayId: RequestHandler = async (req, res, next) => {
  const members = await playRepository.getMembers(req.play.id);
  const isMember = members.some((m) => m.id === req.me.id);

  if (isMember) {
    next();
  } else {
    res.sendStatus(403);
  }
};

const checkIsTeacherByPlayId: RequestHandler = async (req, res, next) => {
  const members = await playRepository.getMembers(req.play.id);
  const member = members.find((m) => m.id === req.me.id);

  if (member?.role === "TEACHER") {
    next();
  } else {
    res.sendStatus(403);
  }
};

const checkIsTeacherByEventId: RequestHandler = async (req, res, next) => {
  const members = await playRepository.getMembers(req.event.play_id);
  const member = members.find((m) => m.id === req.me.id);

  if (member?.role === "TEACHER") {
    next();
  } else {
    res.sendStatus(403);
  }
};

router.use(
  [EVENTS_BY_PLAY_PATH, EVENT_BY_ID_PATH],
  authActions.verifyAccessToken,
);

router
  .route(EVENTS_BY_PLAY_PATH)
  .get(checkIsMemberByPlayId, eventActions.browse)
  .post(checkIsTeacherByPlayId, eventValidator.validate, eventActions.add);

router
  .route(EVENT_BY_ID_PATH)
  .put(checkIsTeacherByEventId, eventValidator.validate, eventActions.edit)
  .delete(checkIsTeacherByEventId, eventActions.destroy);

export default router;
